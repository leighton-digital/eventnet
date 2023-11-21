import { AWSClient, EventNetClient, stackName } from "./utils/index";
import matchers from "./utils/exports";

type GlobalWithExpectKey = { expect: any };
export const isGlobalWithExpectKey = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  global: any
): global is GlobalWithExpectKey => "expect" in global;

if (isGlobalWithExpectKey(global)) {
  const jestExpect = global.expect;

  if (jestExpect !== undefined) {
    jestExpect.extend(matchers);
  } else {
    console.error("Unable to find Jest's global expect.");
  }
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSchema(eventSchema: any): Promise<R>;
    }
  }
}

export { AWSClient, EventNetClient, stackName };
