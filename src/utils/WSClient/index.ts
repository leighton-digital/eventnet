import { AWSConfig, stackName } from "../AWSConfig";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const clientSSM = new SSMClient(AWSConfig);
const clientEventBridge = new EventBridgeClient(AWSConfig);

const Ajv = require("ajv");
const ajv = new Ajv({ strict: false });
let WebSocket = require("ws");

export default class EventNetClient {
  private WsMessagesStore: any[] = [];
  private WsClient: any;
  private time: any = null;
  private stop = false;

  constructor(store: any[], client: any) {
    this.WsMessagesStore = store;
    this.WsClient = client;
  }

  static async create (prefix?: string) {
    let socketName = `${stackName.toLowerCase()}-eventNet-WS-URL`;
    if (prefix) {
      socketName = `${prefix}-eventNet-WS-URL`;
    }
    const stackUrl = await EventNetClient.getParam(socketName);

    const WsClient = new WebSocket(stackUrl);
    const store: any[] = [];
    WsClient.onmessage = (event: any) => {
      //@ts-ignore
      store.push(JSON.parse(event.data));
    };
    return new EventNetClient(store, WsClient);
  }

  private static getParam = async (paramKey: string): Promise<any> => {
    const input = {
      Name: paramKey,
    };
    const command = new GetParameterCommand(input);
    const response = await clientSSM.send(command);
    //@ts-ignore
    return response.Parameter.Value;
  };

  public async closeClient () {
    return await this.WsClient.close();
  }

  private waitForState (socket: any, state: any) {
    const self = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (socket.readyState === state) {
          resolve({});
        } else {
          self.waitForState(socket, state).then(resolve);
        }
      }, 5);
    });
  }

  public waitForOpenSocket () {
    const state = this.WsClient.OPEN;
    return this.waitForState(this.WsClient, state);
  }

  public waitForClosedSocket () {
    const state = this.WsClient.CLOSED;
    return this.waitForState(this.WsClient, state);
  }

  public clearEventHistory () {
    this.WsMessagesStore = [];
  }

  public async validateAndSendEvent (event: any, schema: any) {
    const self = this;
    var validate = ajv.compile(schema);
    var valid = validate(schema.detail);
    if (!valid) {
      let warning: string = "Event";
      validate.errors.forEach((msg: any) => {
        warning = warning + ` ${msg.message}`;
      });

      throw new Error("Event does not match schema");
    }

    const ents = {
      Entries: [
        {
          EventBusName: event.EventBusName,
          Source: event.Source,
          DetailType: event.DetailType,
          Detail: JSON.stringify(event.Detail),
        },
      ],
    };
    self.WsClient.close();
    const command = new PutEventsCommand(ents);
    return await clientEventBridge.send(command);
  }

  public matchEnvelope (
    source: string,
    type: string,
    total = 1,
    timeout = 5000
  ) {
    const self = this;
    if (!self.time) {
      self.time = setTimeout(function () {
        self.stop = true;
      }, timeout);
    }

    return new Promise(function (resolve) {
      setTimeout(function () {
        if (self.stop) {
          clearTimeout(self.time);
          self.stop = false;
          self.WsClient.close();
          resolve([]);
        } else {
          let matched;
          if (source !== "*") {
            //@ts-ignore
            matched = self.WsMessagesStore.filter(
              (element) => element.source === source
            );
          } else {
            //@ts-ignore
            matched = self.WsMessagesStore;
          }
          if (type !== "*") {
            matched = matched.filter(
              (element) => element["detail-type"] === type
            );
          } else {
            matched = matched;
          }
          if (matched.length >= total) {
            self.WsClient.close();
            clearTimeout(self.time);
            resolve(matched);
          } else {
            self.matchEnvelope(source, type, total).then(resolve);
          }
        }
      }, 50);
    });
  }
}
