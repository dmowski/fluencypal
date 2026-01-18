import { translateRequest } from "@/app/api/translate/translateRequest";
import { useSettings } from "../Settings/useSettings";
import { getPageLangCode } from "../Lang/lang";
import { usePlan } from "../Plan/usePlan";
import { useMemo, useState } from "react";
import { IconButton, Popover, Stack } from "@mui/material";
import { useLingui } from "@lingui/react";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { ArrowDown, X } from "lucide-react";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { fullLanguagesMap } from "@/libs/language/languages";
import { LoadingShapes } from "../uiKit/Loading/LoadingShapes";

const translationCache: Record<string, string> = {};

export const useTranslate = () => {
  const settings = useSettings();
  const plan = usePlan();

  const [isShowModal, setIsShowModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || null;
  const learningLanguage = settings.languageCode || "en";

  const planNativeLanguage = plan.activeGoal?.goalQuiz?.nativeLanguageCode;

  const targetLanguage = useMemo(() => {
    const targetCandidates = [nativeLanguageCode, planNativeLanguage, pageLangCode].filter(Boolean);

    const candidate =
      targetCandidates.find(
        (lang) => lang && lang !== learningLanguage && fullLanguagesMap[lang]
      ) || null;

    const candidateLangCode = candidate ? fullLanguagesMap[candidate] || null : null;

    return candidateLangCode?.languageCode || null;
  }, [nativeLanguageCode, planNativeLanguage, pageLangCode]);

  const isTranslateAvailable = targetLanguage && targetLanguage !== learningLanguage;

  const translateText = async ({ text }: { text: string }) => {
    if (!targetLanguage) {
      return "";
    }

    if (translationCache[text]) {
      return translationCache[text];
    }

    const response = await translateRequest({
      text,
      sourceLanguage: null,
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
  const translateWithModal = async (text: string, element: HTMLElement) => {
    try {
      setAnchorEl(element);
      setIsShowModal(true);
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
      setIsTranslating(false);
    } catch (error) {
      setIsTranslating(false);
      throw error;
    }
  };

  const onCloseTranslate = () => {
    setIsTranslating(false);
    setTranslatedText(null);
    setIsShowModal(false);
    setAnchorEl(null);
  };
  const { i18n } = useLingui();

  return {
    translateText,
    isTranslateAvailable,
    translateWithModal,
    onCloseTranslate,
    translateModal:
      (isTranslating || translatedText) && isShowModal && anchorEl ? (
        <Popover
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => onCloseTranslate()}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            },
          }}
        >
          <Stack
            sx={{
              gap: "30px",
              backgroundColor: "#333",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "600px",
              padding: "10px 15px",
              position: "relative",
            }}
          >
            <IconButton
              sx={{ position: "absolute", top: "0px", right: "0px" }}
              onClick={onCloseTranslate}
            >
              <X size={"18px"} />
            </IconButton>
            <Stack
              sx={{
                gap: "10px",
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
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
                  voice={"shimmer"}
                />
              </Stack>

              <ArrowDown size={"18px"} color="rgba(180, 180, 180, 1)" />

              {isTranslating ? (
                <LoadingShapes sizes={["30px"]} />
              ) : (
                <Markdown variant="conversation">
                  {translatedText?.translated || i18n._("No translation available")}
                </Markdown>
              )}
            </Stack>
          </Stack>
        </Popover>
      ) : null,
  };
};
