import inquirer from "inquirer";

export const setUpPort = () => {
  const questions = [
    {
      type: "list",
      name: "DEFAULT_PORT",
      message:
        "Do you want to run on the default port? (http://localhost:8080)",
      choices: ["Yes", "No"],
    },
  ];
  return inquirer.prompt(questions);
};

export const setUpOtherPort = () => {
  const questions = [
    {
      type: "input",
      name: "OTHER_PORT",
      message: "Input a different port:",
    },
  ];
  return inquirer.prompt(questions);
};
