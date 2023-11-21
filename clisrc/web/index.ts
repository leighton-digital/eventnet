import shell from "shelljs";

export const runWeb = () => {
  const filePath = "http-server app";
  shell.cd("node_modules/@leighton-digital/event-net");
  shell.exec(filePath);
  return filePath;
};
