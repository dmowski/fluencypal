'use client';

import { useCallback, useRef, useState } from 'react';
import { sendPermission, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import { isMicrophoneDenied, isMicrophoneGranted, requestMicrophoneAccess } from '@/libs/mic';
import { MicrophonePermissionModal } from '@/features/webCam/MicrophonePermissionModal';

/**
 * Explains the browser microphone prompt before it appears.
 * Returns true only after access is already granted or the person allows it from this modal.
 */
export const useDemoMicrophonePrep = (onPrepare?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [wasDenied, setWasDenied] = useState(false);
  const pendingRef = useRef<((granted: boolean) => void) | null>(null);

  const finish = useCallback((granted: boolean) => {
    pendingRef.current?.(granted);
    pendingRef.current = null;
    setIsOpen(false);
    setIsRequesting(false);
  }, []);

  const ensureMicrophone = useCallback(async () => {
    if (await isMicrophoneGranted()) return true;
    if (pendingRef.current) return false;
    setWasDenied(await isMicrophoneDenied());
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingRef.current = resolve;
    });
  }, []);

  const onGrant = useCallback(async () => {
    if (isRequesting) return;
    onPrepare?.();
    setIsRequesting(true);
    sendPermission({ kind: 'mic', state: 'prompt' });
    const granted = await requestMicrophoneAccess();
    if (!granted) {
      setIsRequesting(false);
      setWasDenied(true);
      sendUiError('demo-mic-denied');
      return;
    }
    finish(true);
  }, [finish, isRequesting, onPrepare]);

  const onClose = useCallback(() => {
    sendPermission({ kind: 'mic', state: 'dismissed' });
    finish(false);
  }, [finish]);

  const modal = (
    <MicrophonePermissionModal
      isOpen={isOpen}
      isRequesting={isRequesting}
      wasDenied={wasDenied}
      onGrant={() => {
        void onGrant();
      }}
      onClose={onClose}
    />
  );

  return { ensureMicrophone, modal };
};
