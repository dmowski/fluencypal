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
  visualizerComponentWidth,
}: {
  languageCode: string;
  getAuthToken: () => Promise<string>;
  isFree: boolean;
  isGame: boolean;
  visualizerComponentWidth?: string;
}) => {
  const learnLanguageCode = languageCode || "en";

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const recorderControls = useVoiceVisualizer();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingMilliSeconds = recorderControls.recordingTime;

  useEffect(() => {
    const seconds = Math.floor(recordingMilliSeconds / 1000);
    setRecordingSeconds(seconds);
  }, [recordingMilliSeconds]);

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
        audioDuration: recordingSeconds || 5,
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

  const removeTranscript = () => {
    if (isRecording) {
      isCancel.current = true;
      recorderControls.stopRecording();
    }
    setTranscription(null);
    setIsTranscribing(false);
  };

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isTranscribing,
    transcription,
    error: recorderControls.error?.message || transcriptionError || "",
    recordingMilliSeconds: recordingSeconds * 1000,
    isAbleToRecord: !inWebView,
    removeTranscript,
    visualizerComponent: recorderControls.isRecordingInProgress ? (
      <VoiceVisualizer
        controls={recorderControls}
        height={"40px"}
        isControlPanelShown={false}
        speed={1}
        fullscreen={true}
        barWidth={3}
        gap={1}
        width={visualizerComponentWidth || "150px"}
      />
    ) : null,
  };
};
