<img width="50px" height="50px" align="right" alt="EventNet Logo" src="eventnet.png?sanitize=true" title="Leighton EventNet"/>

# EventNet

Several tools for working with AWS EventBridge and the events published through it.

## CDK Event Extension

A CDK construct that allows you to connect a WebSocket to an EventBridge instance and make the events published to it visible to a client.

## Test Client

#### Event Producers - Perform and Action and Collect Events

The Test Client connects to the WebSocket and collects the events for Jest assertions.

#### Event Consumers - Validating and Sending Events

The Test Client validates the event you will send to ensure it matches the Schema; if it is valid, it will send the events. You can then check that the events sent trigger the correct response from your application, such as saving the record to DynamoDb.

#### Jest Schema Assertion - Assert Events Match the Prescibed Schema

Test that your captured events match a published JSON Schema specification.

#### Event Monitoring Client - Collect Events to a WebUI in realtime

A web application that can connect to your WebSocket, allowing you to inspect, save and copy the published events. Useful when developing for instant feedback without adding lots of console logs to your Jest tests or logging out through compute.

---

## Using the EventNet CDK Construct

Install and import the construct.

```Typescript
import { EventNet } from "@leighton-digital/event-net/lib/construct/";
```

Set up the EventNet instance with the EventBridge instance.

```Typescript
const eventNet = new EventNet(
    this,
    "event-net",
    {
        prefix: stackName,
        eventBusName: eventBusName,
        includeOutput: true, // optional, default is false
        invludeLogs: true // optional, default is false
    }
);
```

- **prefix**: usually your stackname, used to namespace the event net resources. Usually, your stackName. If you want to monitor multiple buses in the same application, you can construct an individual reference such as `${stackName}-1` and `${stackName}-2`, as long as you can reproduce this when creating the connection in your test suite
- **eventBusName**: name of an existing EventBridge bus you want to subscribe too
- **includeOutput**: prints out the WebSocket URL for easy access for the WebClient

**Note:** Wrap this construct in a conditional that omits it from PRODUCTION; this is for test use only and exposes your events through a WebSocket.

---

## Using the Test Client

- For testing **Event Producers**, you will want to perform an action that will trigger your application to generate an event. For instance, writing a record to the DynamoDb table.

- The test harness then collects all events produced and sends them to a web socket connection.

- The Test Client collects the events from the WebSocket.

```Typescript
import { EventNetClient } from "@leighton-digital/event-net";
```

The EventNet client expects your `prefix` from the CDK construct to be passed in as `'--stack=my-service-dev'`. This corresponds to the Cloud Formation stack name produced by CDK. i.e.:

`yarn test:int --stack=my-stack-name-dev --all --runInBand`

_Why did we choose this?_ Because we also heavily use [sls-test-tools](https://github.com/aleios-cloud/sls-test-tools) in our test suites, we didn't want to create another mechanism for bootstrapping our test suite.

If you are using multiple Event Buses, we strongly recommend basing the names from the stackName as it is easier to reproduce.

### Event Producer Example - Perform Action and Collect Events

```Typescript

import { EventNetClient, stackName } from "@leighton-digital/event-net";


describe("Test Producer > ", () => {
  test("basic request produces event", async () => {
    // Following can be added to beforeEach/beforeAll
    eventNet = await EventNetClient.create();
    // If you have used the stack name eventNet
    // will automatically use the target stack
    await eventNet.waitForOpenSocket();

    // You can also override it:
    // await eventNet.waitForOpenSocket(`${stackName}-1`);
    // OR
    // await eventNet.waitForOpenSocket(`${stackName}-2`);

    const payload = { some: "something"};
    const resp = await axios.post(url, payload);

    // Matches any * source
    // Matches any * detailtype
    // Returns when TWO record have been found
    // Or waits for 10 secs
    const events = await eventNet.matchEnvelope("*", "*", 2, 100000);

    await eventNet.waitForClosedSocket()

    expect(resp.data.body).toBeDefined();
    expect(events).toHaveLength(2);

    // Following can be added to afterEach/afterAll
    await eventNet.closeClient();

  });
});
```

---

## Event Consumer Example - Validating and Sending Events

```Typescript

import { EventNetClient } from "@leighton-digital/event-net";
import * as EventSpec from "../../jsonSpecs/someSchema-v1.json";

describe("Test Consumer > ", () => {
  test("basic request produces event", async () => {
    eventNet = await EventNetClient.create();
    await eventNet.waitForOpenSocket();

    const Event {
        EventBusName: 'your-event-bus-name',
        Source: "some.source",
        DetailType: "some.detail.type",
        Detail: {
          some: "value"
        },
      },

    const sendEvents = await eventNet.validateAndSendEvent(Event, EventSpec)
    await eventNet.waitForClosedSocket()

    // Check DynamoDb Table or S3 that events have been stored or modified
    // ...
    // Following can be added to afterEach/afterAll
    await eventNet.closeClient();

  });
});
```

---

## Using the Jest Schema Matcher

When installed, the Jest JSONschema matcher will be available to use.

```Typescript
import * as EventSpec from "../../jsonSpecs/someSchema-v1.json";
```

Importantly, this can be from a shared/published NPM module.

```Typescript
import * as EventSpec from "../../node_modules/@something/event-catalogue/events/orderCreated/someSchema-v1.json";
```

Then, use the schema to assert against a captured event.

```Typescript
expect(singleMessage).toMatchJsonSchema(EventSpec);
```

---

## Using the EventNet Web Client

First, you need to run the client:

```
eventNet start
```

This will open a web client on url: http://localhost:3000

From the output in CDK, you will have a WebSocket URL.

```
wss://xxxxx.execute-api.eu-west-2.amazonaws.com/dev
```

You need to paste it into `eventnet` client and press connect.

Once connected, we can inspect events, save them locally or copy/paste them into your IDE.

---

<img src="leighton-logo.svg" width="200" >
