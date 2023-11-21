import * as AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: process.env.AWS_REGION,
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
    connectionData = await ddb
      .scan({ TableName: tableName, ProjectionExpression: "PK" })
      .promise();
  } catch (e) {
    return { statusCode: 500, body: e };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: `https://${process.env.API_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.STAGE}`,
  });

  const postCalls = (connectionData.Items ?? []).map(async ({ PK }) => {
    try {
      await apigwManagementApi
        .postToConnection({ ConnectionId: PK, Data: JSON.stringify(event) })
        .promise();
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
