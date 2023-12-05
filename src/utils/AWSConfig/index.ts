import { loadArg } from "../options/args";
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { fromIni } = require("@aws-sdk/credential-providers");

export const stackName = loadArg({
  cliArg: "stack",
  processEnvName: "CFN_STACK_NAME",
});

export const region = loadArg({
  cliArg: "region",
  processEnvName: "AWS_REGION",
  defaultValue: "eu-west-2",
});

const profile = loadArg({
  cliArg: "profile",
  processEnvName: "PROFILE",
});

let AWSConfigObject: any = {
  provider: defaultProvider({
    roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity({
      region,
    }),
  }),
};

if (profile) {
  AWSConfigObject = {
    credentials: fromIni({
      profile,
    }),
    region,
  };
}

export const AWSConfig = AWSConfigObject;
