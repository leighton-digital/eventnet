import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, GetConnectionCommand, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
const docClient = DynamoDBDocumentClient.from(client);

const apiClient = new ApiGatewayManagementApiClient({
  region: process.env.AWS_REGION,
  endpoint: `https://${process.env.API_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.STAGE}`
});

export const main = async (event: any): Promise<any> => {
  let connectionData;

  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error("tableName not specified in process.env.TABLE_NAME");
  }

  if (!event) {
    throw new Error("event body is missing");
  }

  try {
    connectionData = await docClient.send(new ScanCommand({ TableName: tableName, ProjectionExpression: "PK" }));
  } catch (e) {
    return { statusCode: 500, body: e };
  }

  const postCalls = (connectionData.Items ?? []).map(async ({ PK }) => {
    try {
      const input = { ConnectionId: PK, Data: JSON.stringify(event) };

      const command = new PostToConnectionCommand(input);
      apiClient.send(command);
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    console.log(e);
    console.error("error 500");
  }
  console.info("complete");
};
