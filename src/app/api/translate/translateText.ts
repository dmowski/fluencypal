import { TranslationServiceClient } from "@google-cloud/translate";

const getTranslateClient = () => {
  const serviceAccount = JSON.parse(process.env.GOOGLE_TRANSlATE_SERVICE_ACCOUNT_CREDS as string);
  return new TranslationServiceClient({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id,
  });
};

interface TranslateTextProps {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}
export const translateText = async ({
  text,
  sourceLanguage,
  targetLanguage,
}: TranslateTextProps) => {
  const client = getTranslateClient();
  const projectId = "dark-lang";
  const location = "global";

  const translatedTextResponse = await client.translateText({
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: "text/plain",
    sourceLanguageCode: sourceLanguage,
    targetLanguageCode: targetLanguage,
  });

  const translatedText =
    translatedTextResponse[0].translations
      ?.map((t) => {
        return t.translatedText;
      })
      .join("") || "Translation failed";

  return translatedText;
};
