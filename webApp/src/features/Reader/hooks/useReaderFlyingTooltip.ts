import { useCallback, useEffect, useRef, useState } from 'react';
import { MouseEvent } from 'react';
import { getTranslation, normalizeToNativeLangCode } from '../../Translation/translationHelpers';
import { normalizeSelectedText } from '../components/Paragraph/libs/normalizeReaderSelectedText';
import { canTranslateReaderText } from '../components/Paragraph/libs/readerTextTranslationEligibility';
import { getPointerPosition } from '../components/Paragraph/libs/pointerPositionFromMouseEvent';
import { NativeLangCode } from '@/libs/language/type';
import {
  FLYING_TOOLTIP_OFFSET_X,
  FLYING_TOOLTIP_OFFSET_Y,
  FlyingTooltip,
} from '../components/FlyingTooltip';
import React from 'react';

export const useReaderFlyingTooltip = ({
  translateOnHover,
  sourceLanguage,
  targetLanguage,
}: {
  translateOnHover: boolean;
  sourceLanguage: string;
  targetLanguage: NativeLangCode | null;
}) => {
  const [hoverTranslation, setHoverTranslation] = useState<string | null>(null);
  const [hoverPointer, setHoverPointer] = useState<{ x: number; y: number } | null>(null);
  const hoverRequestIdRef = useRef(0);
  const pendingWordRef = useRef<string | null>(null);
  const resolvedWordRef = useRef<string | null>(null);
  const lastHoverRequestRef = useRef<{ word: string; at: number } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Latest refs so `onWordHover` identity stays stable when the user changes
  // translate-on-hover, source language, target language, or device pointer
  // type. Keeping the callback stable avoids re-rendering memoized
  // `ReaderParagraph` children.
  const translateOnHoverRef = useRef(translateOnHover);
  translateOnHoverRef.current = translateOnHover;
  const sourceLanguageRef = useRef(sourceLanguage);
  sourceLanguageRef.current = sourceLanguage;
  const targetLanguageRef = useRef(targetLanguage);
  targetLanguageRef.current = targetLanguage;
  const isTouchDeviceRef = useRef(isTouchDevice);
  isTouchDeviceRef.current = isTouchDevice;

  const clearHoverTranslation = useCallback(() => {
    hoverRequestIdRef.current += 1;
    pendingWordRef.current = null;
    resolvedWordRef.current = null;
    setHoverTranslation(null);
    setHoverPointer(null);
  }, []);

  const onWordHover = useCallback(
    async (word: string, e: MouseEvent<HTMLElement>) => {
      if (!translateOnHoverRef.current || isTouchDeviceRef.current) return;
      setHoverPointer(getPointerPosition(e, FLYING_TOOLTIP_OFFSET_X, FLYING_TOOLTIP_OFFSET_Y));

      const text = normalizeSelectedText(word);
      const normalizedSourceLanguage = normalizeToNativeLangCode(sourceLanguageRef.current);
      const currentTargetLanguage = targetLanguageRef.current;
      if (
        !canTranslateReaderText({
          text,
          sourceLanguage: normalizedSourceLanguage,
          targetLanguage: currentTargetLanguage,
        })
      ) {
        clearHoverTranslation();
        return;
      }

      // When markdown nodes remount under the cursor, onMouseEnter can fire again
      // for the same word. Avoid duplicate network requests for identical hover text.
      if (pendingWordRef.current === text || resolvedWordRef.current === text) {
        return;
      }

      const now = Date.now();
      const lastRequest = lastHoverRequestRef.current;
      if (lastRequest && now - lastRequest.at < 350) {
        return;
      }
      if (lastRequest && lastRequest.word === text && now - lastRequest.at < 10000) {
        return;
      }

      const requestId = hoverRequestIdRef.current + 1;
      hoverRequestIdRef.current = requestId;
      pendingWordRef.current = text;
      lastHoverRequestRef.current = { word: text, at: now };
      resolvedWordRef.current = null;
      setHoverTranslation(null);

      try {
        const translated = await getTranslation({
          text,
          sourceLanguage: normalizedSourceLanguage,
          targetLanguage: currentTargetLanguage,
        });

        if (hoverRequestIdRef.current !== requestId || !translated.trim()) {
          return;
        }

        pendingWordRef.current = null;
        resolvedWordRef.current = text;
        setHoverTranslation(translated);
      } catch {
        if (hoverRequestIdRef.current === requestId) {
          pendingWordRef.current = null;
          resolvedWordRef.current = null;
          setHoverTranslation(null);
        }
      }
    },
    [clearHoverTranslation],
  );

  const onWordMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    setHoverPointer(getPointerPosition(e, FLYING_TOOLTIP_OFFSET_X, FLYING_TOOLTIP_OFFSET_Y));
  }, []);

  const flyingTooltipNode: React.ReactNode = hoverTranslation
    ? React.createElement(FlyingTooltip, { text: hoverTranslation, initialPosition: hoverPointer })
    : null;

  return {
    flyingTooltipNode,
    onWordHover,
    onWordMouseMove,
    clearHoverTranslation,
  };
};
