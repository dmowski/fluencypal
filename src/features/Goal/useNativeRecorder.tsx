import { useEffect, useState } from "react";
import { speechRecognitionLanguages, SupportedLanguage } from "../Lang/lang";

import * as Sentry from "@sentry/nextjs";

export const useNativeRecorder = ({ lang }: { lang: SupportedLanguage }) => {
  const [isAbleToRecord, setIsAbleToRecord] = useState(false);

  const [fullTranscript, setFullTranscript] = useState<string>();
  const [recognizer, setRecognizer] = useState<SpeechRecognition | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopRecording = () => {
    if (recognizer) {
      recognizer?.stop();
    }
    setIsRecording(false);
  };

  const getSpeechRec = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return null;
    }
    const SpeechRec = isWindow ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

    return SpeechRec;
  };

  useEffect(() => {
    setTimeout(async () => {
      setIsAbleToRecord(!!getSpeechRec());
    }, 1000); // Wait for the window to be ready
  }, []);

  const startRecording = async () => {
    const SpeechRec = getSpeechRec();
    if (!SpeechRec) {
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    setFullTranscript("");
    setIsRecording(true);
    try {
      const rec = new SpeechRec();
      setRecognizer(rec);
      rec.lang = speechRecognitionLanguages[lang];
      rec.continuous = true;
      rec.onresult = (e: any) => {
        const fullResults: string[] = [];
        for (let i = 0; i < e.results.length; i++) {
          fullResults.push(e.results?.[i]?.[0]?.transcript.trim() || "");
        }
        const resultString = fullResults.filter(Boolean).join(" ").trim();
        setFullTranscript(resultString);
      };
      rec.onerror = (e: any) => {
        console.error("Speech recognition error: ", e);
        setError(`Error during speech recognition. Try again.`);
        Sentry.captureException(e);
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      rec.start();
    } catch (error) {
      setError(`Failed to start speech recognition. Please try again.`);
      Sentry.captureException(error);
      console.error("Failed to start recording: ", error);
      setIsRecording(false);
      return;
    }
  };

  return {
    isAbleToRecord,
    fullTranscript,
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
};
