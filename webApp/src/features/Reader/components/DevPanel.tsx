'use client';

import { IconButton, Slider, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { ReaderParagraph } from './Paragraph/ReaderParagraph';
import { splitTextIntoParagraphs } from '../utils/splitParagraphsIntoPages';
import { isFitInPage } from '../utils/isFitInPage';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useUrlState } from '@/features/Url/useUrlState';

const DEFAULT_DEV_TEXT = `This is a sample paragraph for validating page fitting. Change settings and compare visual fit with calculated result.
Add another paragraph to test paragraph gap and content height constraints.
In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.`;

export const DevPanel = () => {
  const i18n = useLingui();
  const [isOpen, setIsOpen] = useUrlState('devPanel', false, false);
  const [isLocalhost, setIsLocalhost] = useState(false);

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

      <CustomModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DevPanelContent />
      </CustomModal>
    </>
  );
};

const DevPanelContent = () => {
  const readerSettings = useReaderSettings();
  const [tab, setTab] = useState<'isFit'>('isFit');
  const [text, setText] = useState(DEFAULT_DEV_TEXT);

  const paragraphWords = useMemo(() => splitTextIntoParagraphs(text), [text]);
  const paragraphs = useMemo(
    () => paragraphWords.map((words) => words.join(' ')),
    [paragraphWords],
  );

  const fits = useMemo(() => {
    return isFitInPage({
      paragraphs,
      settings: readerSettings,
    });
  }, [paragraphs, readerSettings]);

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
      </Tabs>

      {tab === 'isFit' && (
        <Stack sx={{ gap: '20px' }}>
          <TextField
            label="Text"
            multiline
            minRows={8}
            value={text}
            onChange={(event) => setText(event.target.value)}
            fullWidth
            sx={{
              '& .MuiInputBase-root': { color: '#fff' },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
            }}
          />

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
              step={1}
              sliderValue={readerSettings.paragraphGap}
              onChange={(value) => readerSettings.setParagraphGap(value)}
            />
          </Stack>

          <Typography variant="h6" sx={{ color: fits ? '#86efac' : '#fca5a5' }}>
            isFitInPage: {fits ? 'true' : 'false'}
          </Typography>

          <Stack
            sx={{
              width: '100%',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px',
              boxSizing: 'border-box',
              paddingBottom: '140px',
            }}
          >
            <Stack
              sx={{
                width: `${readerSettings.contentWidth}px`,
                boxShadow: fits ? '0 0 10px 5px #86efac' : '0 0 10px 5px #fca5a5',
                height: `${readerSettings.contentHeight}px`,
                overflow: 'hidden',
                backgroundColor: '#F4E1C6',
                color: '#000',
                padding: '0',
                boxSizing: 'border-box',
                gap: `${readerSettings.paragraphGap}px`,
              }}
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
                  translateOnHover={readerSettings.translateOnHover}
                  sourceLanguage={readerSettings.language}
                  targetLanguage={null}
                  playText={() => undefined}
                  onSelection={() => undefined}
                  highlights={[]}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      )}
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
