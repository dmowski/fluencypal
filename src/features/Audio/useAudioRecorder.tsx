'use client';
import { useEffect, useRef, useState } from 'react';
import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { useIsWebView } from '../Auth/useIsWebView';
import { isAllowedMicrophone, requestMicrophoneAccess } from '@/libs/mic';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';

export const useAudioRecorder = () => {
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || 'en';
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
      return;
    }
    const format = recorderControls.recordedBlob.type.toLowerCase();
    getRecordTranscript(recorderControls.recordedBlob, format);
  }, [recorderControls.recordedBlob]);
  const isCancel = useRef(false);
  const getRecordTranscript = async (recordedAudioBlog: Blob, format: string) => {
    if (format.includes('ogg')) {
      setTranscriptionError(
        'Sorry, transcription is not available for your audio. Try another browser.',
      );
      setIsTranscribing(false);
      recorderControls.clearCanvas();
      return;
    }
    setTranscriptionError(null);
    if (!recordedAudioBlog) {
      setTranscription(null);
      setIsTranscribing(false);
      recorderControls.clearCanvas();
      return;
    }
    setIsTranscribing(true);
    const token = await auth.getToken();
    try {
      const transcriptResponse = await sendTranscriptRequest({
        audioBlob: recordedAudioBlog,
        authKey: token,
        languageCode: learnLanguageCode,
        audioDuration: recordingSeconds || 5,
        format,
      });
      setTranscription(transcriptResponse.transcript);
      if (transcriptResponse.error) {
        setTranscriptionError(transcriptResponse.error);
      }
    } catch (error) {
      setTranscriptionError('Error during transcription');
    }
    recorderControls.clearCanvas();
    setIsTranscribing(false);
  };
  const startRecording = async () => {
    const isAllowed = await isAllowedMicrophone();
    if (!isAllowed) {
      const requestResult = await requestMicrophoneAccess();
      if (!requestResult) {
        alert(
          'Microphone access is denied. Please allow microphone access in your browser settings.',
        );
        return;
      }
    }
    recorderControls.startRecording();
    isCancel.current = false;
  };
  const stopRecording = async () => {
    const seconds = Math.floor(recorderControls.recordingTime / 1000);
    if (seconds < 1) {
      cancelRecording();
      return;
    }
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
    error: recorderControls.error?.message || transcriptionError || '',
    recordingMilliSeconds: recordingSeconds * 1000,
    isAbleToRecord: !inWebView,
    removeTranscript,
    visualizerComponent: recorderControls.isRecordingInProgress ? (
      <VoiceVisualizer
        controls={recorderControls}
        height={'40px'}
        isControlPanelShown={false}
        speed={1}
        fullscreen={true}
        barWidth={3}
        gap={1}
        width={'100%'}
      />
    ) : null,
  };
};
