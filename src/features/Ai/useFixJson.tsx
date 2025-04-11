import * as Sentry from "@sentry/react";
import { useTextAi } from "./useTextAi";

export const useFixJson = () => {
  const textAi = useTextAi();

  const parseJson = async (json: string) => {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error("Error parsing JSON", error);
      console.error("Error parsing JSON", json);

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
      "Return only the correct JSON, nothing else.",
    ].join(" ");

    const fixJsonRes = await textAi.generate({
      systemMessage,
      userMessage: badJson,
      model: "gpt-4o",
    });
    try {
      return JSON.parse(fixJsonRes);
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
