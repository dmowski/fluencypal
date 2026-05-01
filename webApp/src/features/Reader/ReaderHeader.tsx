'use client';

import { Stack, Typography } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { fitElementFontSizeToWidth } from '@/libs/typography/fitElementFontSizeToWidth';

export const ReaderHeader = ({
  title,
  subtitle,
  activePage,
  pageCount,
  category,
}: {
  title: string;
  subtitle: string;
  activePage: number;
  pageCount: number;
  category: string;
}) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const textBlockRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);
  const [fontSizes, setFontSizes] = useState({
    title: undefined as string | undefined,
    subtitle: undefined as string | undefined,
  });

  useLayoutEffect(() => {
    const headerElement = headerRef.current;
    const textBlockElement = textBlockRef.current;
    const titleElement = titleRef.current;
    const subtitleElement = subtitleRef.current;

    if (!headerElement || !textBlockElement || !titleElement || !subtitleElement) return;

    let frameId = 0;

    const updateFontSizes = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const availableWidth = textBlockElement.getBoundingClientRect().width;

        const nextTitleSize = fitElementFontSizeToWidth({
          element: titleElement,
          text: title,
          availableWidth,
        });
        const nextSubtitleSize = fitElementFontSizeToWidth({
          element: subtitleElement,
          text: subtitle,
          availableWidth,
        });

        if (!nextTitleSize || !nextSubtitleSize) return;

        setFontSizes((previous) => {
          if (previous.title === nextTitleSize && previous.subtitle === nextSubtitleSize) {
            return previous;
          }

          return {
            title: nextTitleSize,
            subtitle: nextSubtitleSize,
          };
        });
      });
    };

    updateFontSizes();

    const resizeObserver = new ResizeObserver(() => {
      updateFontSizes();
    });

    resizeObserver.observe(headerElement);
    resizeObserver.observe(textBlockElement);
    document.fonts?.ready.then(() => {
      updateFontSizes();
    });

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [subtitle, title]);

  return (
    <Stack
      ref={headerRef}
      sx={{
        width: '100%',
        minWidth: 0,
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: 'serif', fontStyle: 'italic' }}>
          {`${activePage} of ${pageCount}`}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontFamily: 'serif', fontStyle: 'italic', textAlign: 'right' }}
        >
          {category}
        </Typography>
      </Stack>

      <Stack ref={textBlockRef} sx={{ width: '100%', minWidth: 0 }}>
        <Typography
          ref={titleRef}
          variant="h2"
          sx={{
            width: '100%',
            fontFamily: 'serif',
            fontWeight: 500,
            fontSize: fontSizes.title,
            lineHeight: 0.95,
            minWidth: 0,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        <Typography
          ref={subtitleRef}
          variant="h4"
          sx={{
            width: '100%',
            fontFamily: 'serif',
            fontSize: fontSizes.subtitle,
            lineHeight: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  );
};
