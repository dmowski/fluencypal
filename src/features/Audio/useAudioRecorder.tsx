"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useSettings } from "../Settings/useSettings";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const maxRecordingSeconds = 40;
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioDurationRef = useRef<number>(0);
  audioDurationRef.current = recordingSeconds;
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || "en";

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const isCancel = useRef(false);

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const timeout = setTimeout(() => {
      setRecordingSeconds((prev) => {
        if (prev >= maxRecordingSeconds) {
          stopRecording();
          return prev;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [isRecording, recordingSeconds]);

  const getRecordTranscript = async (recordedAudioBlog: Blob) => {
    if (!recordedAudioBlog) {
      return;
    }

    setIsTranscribing(true);
    const token = await auth.getToken();
    const transcriptResponse = await sendTranscriptRequest({
      audioBlob: recordedAudioBlog,
      authKey: token,
      languageCode: learnLanguageCode,
      audioDuration: audioDurationRef.current || 5,
    });
    setTranscription(transcriptResponse.transcript);
    setIsTranscribing(false);
  };

  const startRecording = async () => {
    isCancel.current = false;
    setRecordingSeconds(0);
    setTranscription(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (isCancel.current) {
          return;
        }

        const blob = new Blob(chunks, { type: "audio/webm" });
        getRecordTranscript(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingSeconds(0);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      isCancel.current = true;
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isTranscribing,
    transcription,
    recordingSeconds: Math.round(recordingSeconds * 10) / 10,
  };
};
