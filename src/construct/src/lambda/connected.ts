import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error("tableName not specified in process.env.TABLE_NAME");
  }

  const writeRequest = {
    RequestItems: {
      [`${process.env.TABLE_NAME}`]: [
        {
          PutRequest: {
            Item: {
              PK: event.requestContext.connectionId,
            },
          },
        },
      ],
    },
  };

  try {
    await await docClient.send(
      new BatchWriteCommand(writeRequest)
    );;
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }

  return { statusCode: 200, body: "Connected." };
};
