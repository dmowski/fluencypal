import * as Sentry from "@sentry/nextjs";
import { useTextAi } from "./useTextAi";

export const useFixJson = () => {
  const textAi = useTextAi();

  const parseJson = async (json: string) => {
    try {
      let trimmedJson = json.trim();
      const isAbleToFixWithoutAi = trimmedJson.startsWith("```json") && trimmedJson.endsWith("```");
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      return JSON.parse(trimmedJson);
    } catch (error) {
      console.error("Error parsing JSON. error", error);
      console.error("Error parsing JSON. json", json);

      Sentry.captureException(error, {
        extra: {
          title: "Error init parsing in useFixJson",
        },
      });
      const fixedJson = await fixJson(json, error + "");
      return fixedJson;
    }
  };

  const fixJson = async (badJson: string, error: string) => {
    const systemMessage = [
      "Given JSON with some json mistakes.",
      "Please fix json and return the fixed JSON.",
      "Error: " + error,
      "Return only the correct JSON, nothing else. No wrappers, no explanations, your response will be passed into javascript JSON.parse() function",
    ].join("\n");

    const fixJsonRes = await textAi.generate({
      systemMessage,
      userMessage: badJson,
      model: "gpt-4o",
    });
    try {
      let trimmedJson = fixJsonRes.trim();
      const isAbleToFixWithoutAi = trimmedJson.startsWith("```json") && trimmedJson.endsWith("```");
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      return JSON.parse(trimmedJson);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          title: "Error parsing fixed json in useFixJson",
        },
      });
      throw error;
    }
  };

  return { parseJson };
};
