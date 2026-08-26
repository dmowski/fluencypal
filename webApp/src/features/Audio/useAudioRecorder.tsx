'use client';
import { useEffect, useRef, useState } from 'react';
import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import {
  beginPreferredAudioInputCapture,
  isAllowedMicrophone,
  readPreferredMicrophoneId,
  requestMicrophoneAccess,
  writePreferredMicrophoneId,
} from '@/libs/mic';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { isAliasGameSession, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';

export const useAudioRecorder = () => {
  const auth = useAuth();
  const settings = useSettings();
  const { requestMicrophoneWithConsent } = useMicrophonePermission();
  const learnLanguageCode = settings.languageCode || 'en';
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionBlob, setTranscriptionBlob] = useState<Blob | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [microphoneDeviceId, setMicrophoneDeviceIdState] = useState<string | null>(
    readPreferredMicrophoneId,
  );
  const microphoneDeviceIdRef = useRef(microphoneDeviceId);
  microphoneDeviceIdRef.current = microphoneDeviceId;
  const recorderControls = useVoiceVisualizer();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingMilliSeconds = recorderControls.recordingTime;
  useEffect(() => {
    const seconds = Math.floor(recordingMilliSeconds / 1000);
    setRecordingSeconds(seconds);
  }, [recordingMilliSeconds]);
  useEffect(() => {
    if (!recorderControls.recordedBlob) return;
    if (isCancel.current) {
      return;
    }
    const format = recorderControls.recordedBlob.type.toLowerCase();
    getRecordTranscript(recorderControls.recordedBlob, format);
  }, [recorderControls.recordedBlob]);

  const isCancel = useRef(false);
  const hasTrackedFirstRecording = useRef(false);
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
      setTranscriptionBlob(null);
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
      setTranscriptionBlob(recordedAudioBlog);
      if (
        isAliasGameSession() &&
        !hasTrackedFirstRecording.current &&
        transcriptResponse.transcript
      ) {
        trackAliasEvent('alias_first_recording_completed');
        hasTrackedFirstRecording.current = true;
      }
      if (transcriptResponse.error) {
        setTranscriptionError(transcriptResponse.error);
      }
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      setTranscriptionError('Error during transcription: ' + errorString);
    }
    recorderControls.clearCanvas();
    setIsTranscribing(false);
  };
  const startRecording = async () => {
    const deviceId = microphoneDeviceIdRef.current || readPreferredMicrophoneId();
    const restoreGetUserMedia = beginPreferredAudioInputCapture(deviceId);
    try {
      const isAliasSession = isAliasGameSession();

      if (isAliasSession) {
        trackAliasEvent('alias_microphone_permission_requested');
        const stream = await requestMicrophoneWithConsent();
        trackAliasEvent(
          stream ? 'alias_microphone_permission_granted' : 'alias_microphone_permission_denied',
        );
        if (!stream) {
          return;
        }
      } else {
        const isAllowed = await isAllowedMicrophone();
        if (!isAllowed) {
          const requestResult = await requestMicrophoneAccess(deviceId);
          if (!requestResult) {
            alert(
              'Microphone access is denied. Please allow microphone access in your browser settings.',
            );
            return;
          }
        }
      }

      recorderControls.startRecording();
      isCancel.current = false;
    } finally {
      restoreGetUserMedia();
    }
  };

  const setMicrophoneDeviceId = (deviceId: string | null) => {
    setMicrophoneDeviceIdState(deviceId);
    writePreferredMicrophoneId(deviceId);
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
    setTranscriptionBlob(null);
    setIsTranscribing(false);
  };
  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isTranscribing,
    transcription,
    transcriptionBlob,
    error: recorderControls.error?.message || transcriptionError || '',
    recordingMilliSeconds: recordingSeconds * 1000,
    removeTranscript,
    microphoneDeviceId,
    setMicrophoneDeviceId,
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
