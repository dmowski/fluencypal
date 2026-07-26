'use client';

import { useLingui } from '@lingui/react';
import { useEffect, useRef, useState } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { isAllowedMicrophone, requestMicrophoneAccess } from '@/libs/mic';

export const useVoiceChatRecorder = () => {
  const { i18n } = useLingui();
  const recorderControls = useVoiceVisualizer();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const isCancel = useRef(false);

  useEffect(() => {
    setRecordingSeconds(Math.floor(recorderControls.recordingTime / 1000));
  }, [recorderControls.recordingTime]);

  const startRecording = async () => {
    const isAllowed = await isAllowedMicrophone();
    if (!isAllowed) {
      const requestResult = await requestMicrophoneAccess();
      if (!requestResult) {
        alert(
          i18n._(
            'Microphone access is denied. Please allow microphone access in your browser settings.',
          ),
        );
        return;
      }
    }
    isCancel.current = false;
    recorderControls.startRecording();
  };

  const stopRecording = () => {
    const seconds = Math.floor(recorderControls.recordingTime / 1000);
    if (seconds < 1) {
      cancelRecording();
      return;
    }
    recorderControls.stopRecording();
  };

  const cancelRecording = () => {
    if (recorderControls.isRecordingInProgress) {
      isCancel.current = true;
      recorderControls.stopRecording();
    }
    recorderControls.clearCanvas();
  };

  const clearRecording = () => {
    cancelRecording();
    recorderControls.clearCanvas();
  };

  const recordedBlob = isCancel.current ? null : recorderControls.recordedBlob;

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
    isRecording: recorderControls.isRecordingInProgress,
    recordedBlob,
    recordingSeconds,
    error: recorderControls.error?.message || '',
    visualizer: recorderControls.isRecordingInProgress ? (
      <VoiceVisualizer
        controls={recorderControls}
        height={'48px'}
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
