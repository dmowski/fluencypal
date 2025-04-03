"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useSettings } from "../Settings/useSettings";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

export const useAudioRecorder = () => {
  const maxRecordingSeconds = 40;
  // todo: Limit Recording Time
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioDurationRef = useRef<number>(0);
  audioDurationRef.current = recordingSeconds;
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || "en";

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const recorderControls = useVoiceVisualizer();

  useEffect(() => {
    if (!recorderControls.recordedBlob) return;

    if (isCancel.current) {
      console.log("Cancelled recording");
      return;
    }

    getRecordTranscript(recorderControls.recordedBlob);
  }, [recorderControls.recordedBlob]);

  const isCancel = useRef(false);

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
    recorderControls.startRecording();
    isCancel.current = false;
    setRecordingSeconds(0);
    setTranscription(null);
  };

  const stopRecording = async () => {
    recorderControls.stopRecording();
  };

  const cancelRecording = async () => {
    isCancel.current = true;
    recorderControls.stopRecording();
  };

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: recorderControls.isRecordingInProgress,
    isTranscribing,
    transcription,
    error: recorderControls.error,
    recordingSeconds: Math.round((recorderControls.recordingTime / 1000) * 10) / 10,
    visualizerComponent: recorderControls.isRecordingInProgress ? (
      <VoiceVisualizer
        controls={recorderControls}
        height={"40px"}
        isControlPanelShown={false}
        speed={1}
        fullscreen={true}
        barWidth={3}
        gap={1}
        width={"290px"}
      />
    ) : null,
  };
};
