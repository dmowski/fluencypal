'use client';

import { IconButton, Slider, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Wrench } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { ReaderParagraph } from './Paragraph/ReaderParagraph';
import { splitIntoPages, splitTextIntoParagraphs } from '../utils/splitParagraphsIntoPages';
import { isFitInPage } from '../utils/isFitInPage';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useUrlState } from '@/features/Url/useUrlState';
import { sleep } from '@/libs/sleep';

const DEFAULT_DEV_TEXT = `This is a sample paragraph for validating page fitting. Change settings and compare visual fit with calculated result.
Add another paragraph to test paragraph gap and content height constraints.
In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.`;

const DEFAULT_SPLIT_DEV_TEXT =
  'Force a page break across the italic span normal normal normal text _long paragraph italic text_ and more words to force a page break across the italic span';

const STATIC_PAGE_WIDTH = 400;
const STATIC_PAGE_HEIGHT = 600;
const SPLIT_STATIC_PAGE_HEIGHT = 200;

export const DevPanel = () => {
  const i18n = useLingui();
  const [isOpen, setIsOpen] = useUrlState('devPanel', false, false);
  const [tab, setTab] = useUrlState<DevPanelTab>('testCase', 'isFit', true);
  const [isLocalhost, setIsLocalhost] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
    await sleep(200);
    setTab('isFit');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsLocalhost(['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname));
  }, []);

  if (!isLocalhost) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(true)}
        aria-label={i18n._('Open Dev Panel')}
        sx={{
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 500,
          backgroundColor: '#b71c1c',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#8e0000',
          },
        }}
      >
        <Wrench size={18} />
      </IconButton>

      <CustomModal isOpen={isOpen} onClose={onClose}>
        <DevPanelContent tab={tab} setTab={setTab} />
      </CustomModal>
    </>
  );
};

type DevPanelTab = 'isFit' | 'split';

const DevPanelContent = ({
  tab,
  setTab,
}: {
  tab: DevPanelTab;
  setTab: (value: DevPanelTab) => void;
}) => {
  return (
    <Stack sx={{ width: '100%', maxWidth: '1400px', gap: '16px' }}>
      <Typography variant="h4" sx={{ color: '#fff' }}>
        Reader Dev Panel
      </Typography>

      <Tabs
        value={tab}
        onChange={(_event, nextValue) => setTab(nextValue)}
        textColor="inherit"
        sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}
      >
        <Tab value="isFit" label="isFit" sx={{ color: '#fff' }} />
        <Tab value="split" label="Split" sx={{ color: '#fff' }} />
      </Tabs>

      {tab === 'isFit' && <IsFitTab />}
      {tab === 'split' && <SplitTab />}
    </Stack>
  );
};

const DevTextField = ({
  label,
  value,
  onChange,
  minRows = 8,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  minRows?: number;
}) => (
  <TextField
    label={label}
    multiline
    minRows={minRows}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    fullWidth
    sx={{
      '& .MuiInputBase-root': { color: '#fff' },
      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
    }}
  />
);

const ReaderTypographySliders = () => {
  const readerSettings = useReaderSettings();

  return (
    <Stack sx={{ gap: '14px' }}>
      <SettingSlider
        label="Font size"
        value={`${readerSettings.fontSize}px`}
        min={20}
        max={64}
        step={1}
        sliderValue={readerSettings.fontSize}
        onChange={(value) => readerSettings.setFontSize(value)}
      />

      <SettingSlider
        label="Line height"
        value={readerSettings.lineHeight.toFixed(2)}
        min={1}
        max={2.5}
        step={0.05}
        sliderValue={readerSettings.lineHeight}
        onChange={(value) => readerSettings.setLineHeight(value)}
      />

      <SettingSlider
        label="Paragraph gap"
        value={`${readerSettings.paragraphGap}px`}
        min={0}
        max={80}
        step={2}
        sliderValue={readerSettings.paragraphGap}
        onChange={(value) => readerSettings.setParagraphGap(value)}
      />
    </Stack>
  );
};

const IsFitTab = () => {
  const readerSettings = useReaderSettings();
  const [text, setText] = useState(DEFAULT_DEV_TEXT);

  const paragraphWords = useMemo(() => splitTextIntoParagraphs(text), [text]);
  const paragraphs = useMemo(
    () => paragraphWords.map((words) => words.join(' ')),
    [paragraphWords],
  );

  const fits = useMemo(() => {
    return isFitInPage({
      paragraphs: paragraphs.map((paragraph) => ({ text: paragraph, sourceStartCharOffset: 0 })),
      settings: {
        ...readerSettings,
        contentHeight: STATIC_PAGE_HEIGHT,
        contentWidth: STATIC_PAGE_WIDTH,
      },
    });
  }, [paragraphs, readerSettings]);

  return (
    <Stack sx={{ gap: '20px' }}>
      <DevTextField label="Text" value={text} onChange={setText} />
      <ReaderTypographySliders />

      <Typography variant="h6" sx={{ color: fits ? '#86efac' : '#fca5a5' }}>
        isFitInPage: {fits ? 'true' : 'false'}
      </Typography>

      <DevPagePreview
        pageWidth={STATIC_PAGE_WIDTH}
        pageHeight={STATIC_PAGE_HEIGHT}
        highlightColor={fits ? '#86efac' : '#fca5a5'}
      >
        {paragraphWords.map((words, index) => (
          <ReaderParagraph
            key={index}
            paragraphIndex={index}
            paragraphStartCharOffset={0}
            words={words}
            fontSize={readerSettings.fontSize}
            lineHeight={readerSettings.lineHeight}
            justifyText={readerSettings.justifyText}
            playText={() => undefined}
            onSelection={() => undefined}
            highlights={[]}
          />
        ))}
      </DevPagePreview>
    </Stack>
  );
};

const SplitTab = () => {
  const readerSettings = useReaderSettings();
  const [text, setText] = useState(DEFAULT_SPLIT_DEV_TEXT);
  const [pageWidth, setPageWidth] = useState(STATIC_PAGE_WIDTH);
  const [pageHeight, setPageHeight] = useState(SPLIT_STATIC_PAGE_HEIGHT);

  const bookParagraphs = useMemo(() => splitTextIntoParagraphs(text), [text]);

  const paginationSettings = useMemo(
    () => ({
      ...readerSettings,
      contentWidth: pageWidth,
      contentHeight: pageHeight,
      columns: 1 as const,
    }),
    [pageHeight, pageWidth, readerSettings],
  );

  const pages = useMemo(
    () =>
      splitIntoPages({
        bookParagraphs,
        settings: paginationSettings,
      }),
    [bookParagraphs, paginationSettings],
  );

  return (
    <Stack sx={{ gap: '20px' }}>
      <DevTextField label="Text" value={text} onChange={setText} minRows={4} />

      <Stack sx={{ gap: '14px' }}>
        <SettingSlider
          label="Page width"
          value={`${pageWidth}px`}
          min={200}
          max={800}
          step={10}
          sliderValue={pageWidth}
          onChange={setPageWidth}
        />

        <SettingSlider
          label="Page height"
          value={`${pageHeight}px`}
          min={200}
          max={900}
          step={10}
          sliderValue={pageHeight}
          onChange={setPageHeight}
        />
      </Stack>

      <ReaderTypographySliders />

      <Typography variant="h6" sx={{ color: '#fff' }}>
        Pages: {pages.length}
      </Typography>

      <Stack
        sx={{
          width: '100%',
          overflow: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px',
          boxSizing: 'border-box',
          paddingBottom: '140px',
          gap: '24px',
        }}
      >
        {pages.map((pageParagraphs, pageIndex) => (
          <Stack key={pageIndex} sx={{ gap: '8px' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Page {pageIndex + 1} ({pageParagraphs.length} fragment
              {pageParagraphs.length === 1 ? '' : 's'})
            </Typography>
            <DevPagePreview pageWidth={pageWidth} pageHeight={pageHeight}>
              {pageParagraphs.map((paragraph) => (
                <ReaderParagraph
                  key={`${paragraph.sourceParagraphIndex}-${paragraph.sourceStartCharOffset}`}
                  paragraphIndex={paragraph.sourceParagraphIndex}
                  paragraphStartCharOffset={paragraph.sourceStartCharOffset}
                  words={paragraph.words}
                  fontSize={readerSettings.fontSize}
                  lineHeight={readerSettings.lineHeight}
                  justifyText={readerSettings.justifyText}
                  playText={() => undefined}
                  onSelection={() => undefined}
                  highlights={[]}
                />
              ))}
            </DevPagePreview>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

const DevPagePreview = ({
  pageWidth,
  pageHeight,
  highlightColor,
  children,
}: {
  pageWidth: number;
  pageHeight: number;
  highlightColor?: string;
  children: ReactNode;
}) => {
  const readerSettings = useReaderSettings();

  return (
    <Stack
      sx={{
        width: `${pageWidth}px`,
        boxShadow: highlightColor ? `0 0 10px 5px ${highlightColor}` : undefined,
        height: `${pageHeight}px`,
        overflow: 'hidden',
        backgroundColor: '#F4E1C6',
        color: '#000',
        padding: '0',
        boxSizing: 'border-box',
        gap: `${readerSettings.paragraphGap}px`,
      }}
    >
      {children}
    </Stack>
  );
};

const SettingSlider = ({
  label,
  value,
  sliderValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  sliderValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (nextValue: number) => void;
}) => {
  return (
    <Stack sx={{ gap: '8px' }}>
      <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {value}
        </Typography>
      </Stack>
      <Slider
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(_event, nextValue) =>
          onChange(Array.isArray(nextValue) ? nextValue[0] : nextValue)
        }
        valueLabelDisplay="auto"
      />
    </Stack>
  );
};
