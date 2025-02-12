import OpenAI from "openai";
import { askClient } from "../utils";
import { SYSTEM_PROMPT } from "./config";
import { configDotenv } from "dotenv";
import { tools } from "../tools";

configDotenv();

const messages: any[] = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

const ai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export const startAgent = async () => {
  while (true) {
    const user = await askClient("You: ");
    messages.push({
      role: "user",
      content: JSON.stringify({ type: "user", user }),
    });
    while (true) {
      const resp = await ai.chat.completions.create({
        model: "deepseek-chat",
        messages,
        response_format: { type: "json_object" },
      });
      const result = resp.choices[0].message;
      console.log("result", result);
      console.log("Messages", messages);
      let type;
      let rest;
      try {
        if (!result?.content || result?.content.trim() === "") {
          console.log("❌ Error: AI returned an empty response.");
          continue; // Skip this iteration and try again
        }
        const final = result?.content?.length ? JSON.parse(result.content) : {};
        type = final?.type;
        rest = final;
      } catch (error) {
        console.log(error);
      }
      messages.push(result);
      switch (type) {
        case "plan":
          continue;
        case "requirement":
          const requirement = rest["requirement"];
          const user = await askClient(requirement + "\n" + "You :");
          messages.push({
            role: "user",
            content: JSON.stringify({ type: "user", user }),
          });
          continue;
        case "action":
          const functionName = rest["function"];
          let input = rest["input"];
          const tool = (tools as any)[functionName];
          try {
            if (typeof input === "string") {
              input = JSON.parse(input);
            }
          } catch (error) {
            console.log("❌ Error while parsing input:", error);
            continue;
          }
          // const observation = await tool(inp);
          messages.push({
            role: "user",
            content: JSON.stringify({
              type: "observation",
              observation: "Sent successfully",
            }),
          });
          continue;
        case "output":
          console.log("Output", rest["output"]);
      }
      break;
    }
  }
};
