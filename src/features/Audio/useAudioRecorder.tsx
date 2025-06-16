"use client";

import { useEffect, useRef, useState } from "react";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { useIsWebView } from "../Auth/useIsWebView";

export const useAudioRecorder = ({
  languageCode,
  getAuthToken,
  isFree,
  isGame,
}: {
  languageCode: string;
  getAuthToken: () => Promise<string>;
  isFree: boolean;
  isGame: boolean;
}) => {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioDurationRef = useRef<number>(0);
  audioDurationRef.current = recordingSeconds;
  const learnLanguageCode = languageCode || "en";

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const recorderControls = useVoiceVisualizer();

  const { inWebView } = useIsWebView();

  useEffect(() => {
    if (!recorderControls.recordedBlob) return;

    if (isCancel.current) {
      console.log("Cancelled recording");
      return;
    }

    const format = recorderControls.recordedBlob.type.toLowerCase();

    getRecordTranscript(recorderControls.recordedBlob, format);
  }, [recorderControls.recordedBlob]);

  const isCancel = useRef(false);

  const getRecordTranscript = async (recordedAudioBlog: Blob, format: string) => {
    setTranscriptionError(null);
    if (!recordedAudioBlog) {
      setTranscription(null);
      setIsTranscribing(false);
      recorderControls.clearCanvas();
      return;
    }

    setIsTranscribing(true);
    const token = await getAuthToken();
    try {
      const transcriptResponse = await sendTranscriptRequest({
        audioBlob: recordedAudioBlog,
        authKey: token,
        languageCode: learnLanguageCode,
        audioDuration: audioDurationRef.current || 5,
        format,
        isGame,
        isFree,
      });
      setTranscription(transcriptResponse.transcript);
      if (transcriptResponse.error) {
        setTranscriptionError(transcriptResponse.error);
      }
    } catch (error) {
      setTranscriptionError("Error during transcription");
    }
    recorderControls.clearCanvas();
    setIsTranscribing(false);
  };

  const startRecording = async () => {
    recorderControls.startRecording();
    isCancel.current = false;
    setRecordingSeconds(0);
  };

  const stopRecording = async () => {
    setIsTranscribing(true);
    recorderControls.stopRecording();
  };

  const isRecording = recorderControls.isRecordingInProgress;

  const cancelRecording = async () => {
    if (isRecording) {
      isCancel.current = true;
      recorderControls.stopRecording();
    }
  };

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: isRecording,
    isTranscribing,
    transcription,
    error: recorderControls.error?.message || transcriptionError || "",
    recordingMilliSeconds: recorderControls.recordingTime,
    isAbleToRecord: !inWebView,
    removeTranscript: () => {
      if (isRecording) {
        isCancel.current = true;
        recorderControls.stopRecording();
      }
      setTranscription(null);
      setIsTranscribing(false);
    },
    visualizerComponent: recorderControls.isRecordingInProgress ? (
      <VoiceVisualizer
        controls={recorderControls}
        height={"40px"}
        isControlPanelShown={false}
        speed={1}
        fullscreen={true}
        barWidth={3}
        gap={1}
        width={"150px"}
      />
    ) : null,
  };
};
