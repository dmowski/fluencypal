'use client';

import { createContext, JSX, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { getMediaAudioStreams } from './mediaStream';
import { isMicrophoneDenied, isMicrophoneGranted } from '@/libs/mic';
import { MicrophonePermissionModal } from './MicrophonePermissionModal';

const PREP_MODAL_SEEN_KEY = 'microphone-prep-modal-seen-v2';

type MicrophonePermissionContextType = {
  requestMicrophoneWithConsent: () => Promise<MediaStream | null>;
};

const MicrophonePermissionContext = createContext<MicrophonePermissionContextType | null>(null);

export function MicrophonePermissionProvider({ children }: { children: ReactNode }): JSX.Element {
  const [hasSeenPrepModal, setHasSeenPrepModal] = useLocalStorage(PREP_MODAL_SEEN_KEY, false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [wasDenied, setWasDenied] = useState(false);
  const pendingResolveRef = useRef<((stream: MediaStream | null) => void) | null>(null);

  const finishRequest = useCallback((stream: MediaStream | null) => {
    pendingResolveRef.current?.(stream);
    pendingResolveRef.current = null;
    const timeout = stream ? 2000 : 0;
    setTimeout(() => {
      setIsModalOpen(false);
      setIsRequesting(false);
    }, timeout);
  }, []);

  const requestBrowserMicrophone = useCallback(async () => {
    setIsRequesting(true);
    const stream = await getMediaAudioStreams();
    setIsRequesting(false);

    if (!stream) {
      setWasDenied(true);
      return null;
    }

    return stream;
  }, []);

  const requestMicrophoneWithConsent = useCallback(async (): Promise<MediaStream | null> => {
    const existingStream = (window as Window & { singleMediaStreamAudio?: MediaStream })
      .singleMediaStreamAudio;
    if (existingStream?.active) {
      return existingStream;
    }

    if (await isMicrophoneGranted()) {
      return getMediaAudioStreams();
    }

    const isDenied = await isMicrophoneDenied();
    if (!hasSeenPrepModal || isDenied) {
      return new Promise<MediaStream | null>((resolve) => {
        pendingResolveRef.current = resolve;
        setWasDenied(isDenied);
        setIsModalOpen(true);
      });
    }

    return getMediaAudioStreams();
  }, [hasSeenPrepModal]);

  const onGrant = useCallback(async () => {
    setHasSeenPrepModal(true);
    const stream = await requestBrowserMicrophone();
    if (stream) {
      finishRequest(stream);
    }
  }, [finishRequest, requestBrowserMicrophone, setHasSeenPrepModal]);

  const onClose = useCallback(() => {
    finishRequest(null);
  }, [finishRequest]);

  return (
    <MicrophonePermissionContext.Provider value={{ requestMicrophoneWithConsent }}>
      {children}
      <MicrophonePermissionModal
        isOpen={isModalOpen}
        isRequesting={isRequesting}
        wasDenied={wasDenied}
        onGrant={onGrant}
        onClose={onClose}
      />
    </MicrophonePermissionContext.Provider>
  );
}

export const useMicrophonePermission = (): MicrophonePermissionContextType => {
  const context = useContext(MicrophonePermissionContext);
  if (!context) {
    throw new Error('useMicrophonePermission must be used within a MicrophonePermissionProvider');
  }
  return context;
};
