import { translateRequest } from "@/app/api/translate/translateRequest";
import { useSettings } from "../Settings/useSettings";
import { getPageLangCode } from "../Lang/lang";
import { usePlan } from "../Plan/usePlan";
import { useMemo, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { ArrowDown } from "lucide-react";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";

const translationCache: Record<string, string> = {};
export const useTranslate = () => {
  const settings = useSettings();
  const plan = usePlan();

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || null;
  const learningLanguage = settings.languageCode || "en";

  const planNativeLanguage = plan.latestGoal?.goalQuiz?.nativeLanguageCode;

  const targetCandidates = [nativeLanguageCode, planNativeLanguage, pageLangCode];

  const targetLanguage = targetCandidates.find((lang) => lang && lang !== learningLanguage) || null;

  const isTranslateAvailable = targetLanguage && targetLanguage !== learningLanguage;

  const translateText = async ({ text }: { text: string }) => {
    if (!targetLanguage) {
      return "";
    }

    if (translationCache[text]) {
      return translationCache[text];
    }
    // todo: add words to the dictionary to learn

    const response = await translateRequest({
      text,
      sourceLanguage: learningLanguage,
      targetLanguage,
    });
    translationCache[text] = response.translatedText;
    return response.translatedText;
  };

  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<{
    source: string;
    translated: string;
  } | null>(null);
  const translateWithModal = async (text: string) => {
    try {
      setTranslatedText(null);
      setIsTranslating(true);
      setTranslatedText({
        source: text,
        translated: "",
      });
      const translatedText = await translateText({ text });
      setTranslatedText({
        source: text,
        translated: translatedText,
      });
    } catch (error) {
      setIsTranslating(false);
      throw error;
    }
  };

  const onCloseTranslate = () => {
    setIsTranslating(false);
    setTranslatedText(null);
  };
  const { i18n } = useLingui();

  return {
    translateText,
    isTranslateAvailable,
    translateWithModal,
    onCloseTranslate,
    translateModal:
      isTranslating || translatedText ? (
        <CustomModal isOpen={true} onClose={() => onCloseTranslate()} padding="40px 20px">
          <Typography variant="caption">{i18n._("Translation")}</Typography>
          <Stack
            sx={{
              gap: "10px",
              width: "100%",
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Markdown variant="conversation">
                {translatedText?.source ||
                  (isTranslating ? i18n._("Loading...") : i18n._("No text to translate"))}
              </Markdown>
              <AudioPlayIcon
                text={translatedText?.source || ""}
                instructions="Calm and clear"
                voice={"coral"}
              />
            </Stack>

            <ArrowDown size={"18px"} color="rgba(180, 180, 180, 1)" />

            <Markdown variant="conversation">
              {translatedText?.translated ||
                (isTranslating ? "..." : i18n._("No translation available"))}
            </Markdown>
            <Button variant="outlined" onClick={onCloseTranslate} sx={{ marginTop: "20px" }}>
              {i18n._("Close")}
            </Button>
          </Stack>
        </CustomModal>
      ) : null,
  };
};
