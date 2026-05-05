'use client';

import { Stack, Typography } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { fitElementFontSizeToWidth } from '@/libs/typography/fitElementFontSizeToWidth';

export const ReaderHeader = ({
  title,
  subtitle,
  currentPage,
  totalPages,
  author,
}: {
  title: string;
  subtitle: string;
  currentPage: number;
  totalPages: number;
  author: string;
}) => {
  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
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
        gap: '10px',
      }}
    >
      <Stack
        sx={{
          paddingRight: '5px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography
          data-testid="reader-page-indicator"
          sx={{
            fontSize: '19px',
            textTransform: 'uppercase',
            fontFamily: 'serif',
            opacity: 0.8,
          }}
        >
          {author}
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

      <Stack
        sx={{
          paddingRight: '5px',
          //display: 'grid',
          display: 'none',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontFamily: 'serif',
            alignItems: 'left',
            textTransform: 'uppercase',
          }}
        >
          {`${percentage}%`}
        </Typography>

        <Typography
          sx={{
            fontSize: '14px',
            fontFamily: 'serif',
            textTransform: 'uppercase',

            textAlign: 'right',
          }}
        >
          {`${currentPage} / ${totalPages}`}
        </Typography>
      </Stack>
    </Stack>
  );
};
