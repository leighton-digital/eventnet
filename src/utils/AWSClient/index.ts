import { loadArg } from "../options/args";
import AWS from "aws-sdk";

export const stackName = loadArg({
  cliArg: "stack",
  processEnvName: "CFN_STACK_NAME",
});

const profile = loadArg({
  cliArg: "profile",
  processEnvName: "AWS_PROFILE",
  defaultValue: "default",
});

export const region = loadArg({
  cliArg: "region",
  processEnvName: "AWS_REGION",
  defaultValue: "eu-west-2",
});

let creds;

if (
  process.env.AWS_ACCESS_KEY_ID !== undefined &&
  process.env.AWS_SECRET_ACCESS_KEY !== undefined
) {
  creds = new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });
} else {
  creds = new AWS.SharedIniFileCredentials({
    profile,
    callback: (err) => {
      if (err) {
        console.error(`SharedIniFileCreds Error: ${err.name} - ${err.message}`);
      }
    },
  });
}

AWS.config.credentials = creds;
AWS.config.region = region;

export const AWSClient = AWS;
