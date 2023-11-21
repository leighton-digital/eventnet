#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import shell from "shelljs";

import { init } from "./launch";
import { setUp } from "./setUp";
import { runWeb } from "./web";
console.log("this is the index");

const run = async () => {
  // show script introduction
  init();

  const answers = await setUp();
  const { RUN_TYPE } = answers;
  console.log(RUN_TYPE);

  if (RUN_TYPE === "Web") {
    const web = runWeb();
    console.log(chalk.white.bgGreen.bold(web));
  } else {
    console.log(chalk.white.bgGreen.bold(`Still working on ${RUN_TYPE}`));
  }
};

run();
