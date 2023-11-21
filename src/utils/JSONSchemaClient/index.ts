const Ajv = require("ajv");
const ajv = new Ajv({ strict: false });

export interface TestResultOutput {
  message: () => string;
  pass: boolean;
}

export const testResult = (
  message: string,
  pass: boolean
): TestResultOutput => ({
  message: () => message,
  pass,
});

export default {
  toMatchSchema(theEvent: any, theSchema: any) {
    try {
      var validate = ajv.compile(theSchema);
      var valid = validate(theEvent.detail);
      if (!valid) {
        let warning: string = "Event";
        validate.errors.forEach((msg: any) => {
          warning = warning + ` ${msg.message}`;
        });

        return testResult(warning, false);
      } else {
        return testResult(`Event matches Scheama`, true);
      }
    } catch (error) {
      console.log(error);
      return testResult(JSON.stringify(error), false);
    }
  },
};
