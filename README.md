<img width="50px" height="50px" align="right" alt="EventNet Logo" src="eventnet.png?sanitize=true" title="Leighton EventNet"/>

# EventNet

A number of tools for workign with AWS EventBridge and the events published through it.

## CDK Event Extension

A CDK construct that allows you to connect a WebSocket to a EventBridge instance and make the evvents published to it visible to a client.

## Test Client

### Event Producers - Perform and Action and Collect Events

The Test Client connects to the WebSocket and collects the events for use in Jest tests.

### Event Consumers - Validating and Sending Events

The Test Client validates the event you are going to send to make sure it matches the Schema, if it is valid it will send the events. You can then check that events sent trigger the correct response from you application, such as saving the record to DynamoDb.

### Jest Schema Assertion - Assert Events Match the Prescibed Schema

Test that your captured events match a publiched JSON Schema specification.

## Event Monitoring Client - Collect Events to a WebUI in realtime

A web application that can connect to your WebSocket allowing you to inspect, save and copy the published events. Useful when developing for instant feedback without having to add lots of console logs to your Jest tests or log out through compute.

---

## Using the EventNet CDK Construct

Install and import the construct.

```Typescript
import { EventNet } from "@leighton-digital/event-net/lib/construct/";
```

Set up the EventNet instance with the EventBridge instance

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

- prefix: usually your stackname, used to namespace the event net resources. Usually your stackName.
- eventBusName: name of an existing EventBridge bus you want to subscribe too
- includeOutput: prints out the WebSocket URL for easy access for the WebClient

---

## Using the Test Client

For testing Event Producers, you will want to perform an action that will trigger your application to generate an event. For instance writing an record to DynamoDb table.

The test harness then collects all events produced and sends them to a web socket connection.

The Test Client to recieve events from the WebSocket.

```Typescript
import { EventNetClient } from "@leighton-digital/event-net";
```

The EventNet client expects your `prefix` from the CDK construct to be passed in as `'--stack=my-service-dev'`. This corrosponds to the Cloud Formation stack name produced by CDK. i.e:

`yarn test:int --stack=my-stack-name-dev --all --runInBand`

_Why did we choose this?_ Because we also uses [sls-test-tools](https://github.com/aleios-cloud/sls-test-tools) heavily in our test suites and we didn't want to create anoother mechanism for bootstrapping our test suite.

You can now use the client in your tests:

### Event Prodcuer Example - Perform Action and Collect Events

```Typescript

import { EventNetClient } from "@leighton-digital/event-net";


describe("Test Producer > ", () => {
  test("basic request produces event", async () => {
    // Following can be added to beforeEach/beforeAll
    eventNet = await EventNetClient.create();
    await eventNet.waitForOpenSocket();

    const payload = { some: "something"};
    const resp = await axios.post(url, payload);

    //Matches any * source
    //Matches any * detailtype
    //Returns when TWO record have been found
    //Or waits for 10 secs
    const events = await eventNet.matchEnvelope("*", "*", 2, 100000);

    await eventNet.waitForClosedSocket()

    expect(resp.data.body).toBeDefined();
    expect(events).toHaveLength(1);

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

    // Check in DynamoDb Table that event has been stored
    // ...
    // Follwing can be added to afterEach/afterAll
    await eventNet.closeClient();

  });
});
```

---

## Using the Jest Schema Matcher

When installed the Jest JSONschema matcher will available to use.

```Typescript
import * as EventSpec from "../../jsonSpecs/someSchema-v1.json";
```

Importantly this can be from a shared/published NPM module

```Typescript
import * as EventSpec from "../../node_modules/@something/event-catalogue/events/orderCreated/someSchema-v1.json";
```

Then use the schema to asserts against a caputred event.

```Typescript
expect(singleMessage).toMatchJsonSchema(EventSpec);
```

---

## Using the EventNet Web Client

First you need to run the client:

```
eventNet start
```

This will open a web client on url: http://localhost:3000

From the output in CDK you will have a WebSocket URL.

```
wss://xxxxx.execute-api.eu-west-2.amazonaws.com/dev
```

You need to paste it into `eventnet` client and press connect

Once connected we are ready to inspect events, save locally or copy/paste them into your IDE.

---

<img src="leighton-logo.svg" width="200" >
