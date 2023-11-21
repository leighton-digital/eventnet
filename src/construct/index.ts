import { Construct } from "constructs";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeFunction from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as SSM from "aws-cdk-lib/aws-ssm";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

export interface EventNetProps {
  prefix: string;
  eventBusName: string;
  includeOutput?: boolean;
  includeLogs?: boolean;
}

export class EventNet extends Construct {
  constructor(scope: Construct, id: string, props: EventNetProps) {
    super(scope, id);

    const region = cdk.Stack.of(this).region;

    const table = new dynamodb.Table(this, "EventTable", {
      tableName: `${props.prefix}-eventnet-table`,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const eventBus = events.EventBus.fromEventBusName(
      this,
      "attachedEventBus",
      props.eventBusName
    );

    const rule = new events.Rule(this, "netAllRule", {
      eventPattern: {
        source: [{ prefix: "" }] as any[],
      },
      eventBus,
    });

    const role = new iam.Role(this, `role`, {
      roleName: `${props.prefix}-eventNet-Lambda-role`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    if (props.includeLogs) {
      role.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["*"],
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
        })
      );
    }

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ["*"],
        actions: [
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
        ],
      })
    );

    const connectHandler = new nodeFunction.NodejsFunction(
      this,
      "ConnectHandler",
      {
        entry: path.join(path.resolve(__dirname), `/src/lambda/connected.js`),
        environment: {
          TABLE_NAME: table.tableName,
        },
        memorySize: 1024,
        architecture: lambda.Architecture.ARM_64,
        awsSdkConnectionReuse: true,
        timeout: cdk.Duration.minutes(1),
        runtime: lambda.Runtime.NODEJS_18_X,
        tracing: lambda.Tracing.ACTIVE,
        handler: "main",
        role,
      }
    );

    if (props.includeLogs) {
      new LogGroup(this, `nodeJsFunctionLogGroupConnectHandler`, {
        logGroupName: `/aws/lambda/${connectHandler.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: RetentionDays.ONE_WEEK,
      });
    }

    const disconnectHandler = new nodeFunction.NodejsFunction(
      this,
      "DisconnectHandler",
      {
        entry: path.join(
          path.resolve(__dirname),
          `/src/lambda/disconnected.js`
        ),
        environment: {
          TABLE_NAME: table.tableName,
        },
        memorySize: 1024,
        architecture: lambda.Architecture.ARM_64,
        awsSdkConnectionReuse: true,
        timeout: cdk.Duration.minutes(1),
        runtime: lambda.Runtime.NODEJS_18_X,
        tracing: lambda.Tracing.ACTIVE,
        handler: "main",
        role,
      }
    );

    if (props.includeLogs) {
      new LogGroup(this, `nodeJsFunctionLogGroupDisconnectHandler`, {
        logGroupName: `/aws/lambda/${disconnectHandler.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: RetentionDays.ONE_WEEK,
      });
    }

    const webSocketApi = new apigwv2.WebSocketApi(this, "eventNetApi", {
      apiName: `${props.prefix}-eventnet-api`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "connectedHandler",
          connectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "disconnectHandler",
          disconnectHandler
        ),
      },
    });

    const wsStage = new apigwv2.WebSocketStage(this, "EventNetStage", {
      webSocketApi,
      stageName: "dev",
      autoDeploy: true,
    });

    const eventNetFunction = new nodeFunction.NodejsFunction(
      this,
      "eventNetFunction",
      {
        environment: {
          TABLE_NAME: table.tableName,
          API_ID: webSocketApi.apiId,
          STAGE: wsStage.stageName,
        },
        memorySize: 1024,
        architecture: lambda.Architecture.ARM_64,
        awsSdkConnectionReuse: true,
        timeout: cdk.Duration.minutes(1),
        runtime: lambda.Runtime.NODEJS_18_X,
        tracing: lambda.Tracing.ACTIVE,
        handler: "main",
        role: role,
        entry: path.join(path.resolve(__dirname), `/src/lambda/data.js`),
      }
    );

    rule.addTarget(
      new targets.LambdaFunction(eventNetFunction, {
        retryAttempts: 3,
      })
    );

    eventNetFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["execute-api:ManageConnections"],
        resources: ["*"],
      })
    );

    const wsURL =
      "wss://" +
      webSocketApi.apiId +
      ".execute-api." +
      region +
      ".amazonaws.com/" +
      wsStage.stageName;

    new SSM.StringParameter(this, "EventNetWSURLParameter", {
      description: "URL for EventNet websocket connection",
      stringValue: wsURL,
      parameterName: `${props.prefix}-eventNet-WS-URL`,
    });

    if (props.includeOutput) {
      new cdk.CfnOutput(this, "EventNetClientURL", {
        exportName: `${props.prefix}-event-net-URL`,
        value: wsStage.url,
      });
    }
  }
}
