import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const normalizedSourceLanguage = useMemo(
    () => normalizeToNativeLangCode(sourceLanguage),
    [sourceLanguage],
  );

  const clearHoverTranslation = useCallback(() => {
    hoverRequestIdRef.current += 1;
    pendingWordRef.current = null;
    resolvedWordRef.current = null;
    setHoverTranslation(null);
    setHoverPointer(null);
  }, []);

  const onWordHover = useCallback(
    async (word: string, e: MouseEvent<HTMLElement>) => {
      if (!translateOnHover || isTouchDevice) return;
      setHoverPointer(getPointerPosition(e, FLYING_TOOLTIP_OFFSET_X, FLYING_TOOLTIP_OFFSET_Y));

      const text = normalizeSelectedText(word);
      if (
        !canTranslateReaderText({
          text,
          sourceLanguage: normalizedSourceLanguage,
          targetLanguage,
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

      const requestId = hoverRequestIdRef.current + 1;
      hoverRequestIdRef.current = requestId;
      pendingWordRef.current = text;
      resolvedWordRef.current = null;
      setHoverTranslation(null);

      try {
        const translated = await getTranslation({
          text,
          sourceLanguage: normalizedSourceLanguage,
          targetLanguage,
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
    [
      translateOnHover,
      isTouchDevice,
      normalizedSourceLanguage,
      targetLanguage,
      clearHoverTranslation,
    ],
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
