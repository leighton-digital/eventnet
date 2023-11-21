import inquirer from "inquirer";

export const setUp = () => {
  const questions = [
    {
      type: "list",
      name: "RUN_TYPE",
      message: "What EventNet Client do you want to run?",
      choices: ["Web", "CLI"],
    },
  ];
  return inquirer.prompt(questions);
};
