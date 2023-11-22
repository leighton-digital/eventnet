import { loadArg } from "../options/args";
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

export const stackName = loadArg({
  cliArg: "stack",
  processEnvName: "CFN_STACK_NAME",
});

export const region = loadArg({
  cliArg: "region",
  processEnvName: "AWS_REGION",
  defaultValue: "eu-west-2",
});

const provider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity({ region }),
});

export const AWSConfig = { credentialDefaultProvider: provider };
