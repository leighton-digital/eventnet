import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async (event: APIGatewayProxyEvent) => {
  console.log({ event });
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error("tableName not specified in process.env.TABLE_NAME");
  }

  const putItem = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: event.requestContext.connectionId,
    },
  };

  try {
    await docClient.send(new PutCommand(putItem));
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }

  return { statusCode: 200, body: "Connected." };
};
