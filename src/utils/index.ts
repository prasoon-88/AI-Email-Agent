import readLine from "readline";

export const createTerminalClient = () =>
  readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const terminalClient = createTerminalClient();

export const askClient = async (placeholder: string) =>
  new Promise((resolve) => terminalClient.question(placeholder, resolve));
