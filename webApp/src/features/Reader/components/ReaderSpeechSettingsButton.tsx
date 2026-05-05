import { Button, IconButton, Popover, Stack, ThemeProvider, Typography } from '@mui/material';
import { ChevronLeft, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { lightTheme } from '../../uiKit/theme';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { ReaderChapterItem, ReaderChaptersList } from './ReaderChaptersPopover';
import { ReaderHighlightItem, ReaderHighlightsList } from './ReaderHighlightsPopover';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';

type BookInfoButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  chapters: ReaderChapterItem[];
  highlights: ReaderHighlightItem[];
  activeChapterId: string | null;
  onSelectChapter: (targetPage: number) => void;
  onSelectHighlight: (targetPage: number) => void;
};

type ModalView = 'menu' | 'settings' | 'chapters' | 'highlights';

const SETTINGS_UPDATE_DELAY_MS = 350;

export const BookInfoButton = ({
  speech,
  chapters,
  highlights,
  activeChapterId,
  onSelectChapter,
  onSelectHighlight,
}: BookInfoButtonProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeView, setActiveView] = useState<ModalView>('menu');
  const [localFontSize, setLocalFontSize] = useState(readerSettings.fontSize);
  const [localParagraphGap, setLocalParagraphGap] = useState(readerSettings.paragraphGap);
  const [localLineHeight, setLocalLineHeight] = useState(readerSettings.lineHeight);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (!open) {
      setActiveView('menu');
      return;
    }

    setLocalFontSize(readerSettings.fontSize);
    setLocalParagraphGap(readerSettings.paragraphGap);
    setLocalLineHeight(readerSettings.lineHeight);
  }, [open, readerSettings.fontSize, readerSettings.lineHeight, readerSettings.paragraphGap]);

  useEffect(() => {
    if (!open || activeView !== 'settings') return;
    if (localFontSize === readerSettings.fontSize) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setFontSize(localFontSize);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [activeView, localFontSize, open, readerSettings.fontSize, readerSettings.setFontSize]);

  useEffect(() => {
    if (!open || activeView !== 'settings') return;
    if (localParagraphGap === readerSettings.paragraphGap) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setParagraphGap(localParagraphGap);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [
    activeView,
    localParagraphGap,
    open,
    readerSettings.paragraphGap,
    readerSettings.setParagraphGap,
  ]);

  useEffect(() => {
    if (!open || activeView !== 'settings') return;
    if (localLineHeight === readerSettings.lineHeight) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setLineHeight(localLineHeight);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [activeView, localLineHeight, open, readerSettings.lineHeight, readerSettings.setLineHeight]);

  const closeModal = () => setAnchorEl(null);

  const title =
    activeView === 'settings'
      ? i18n._('Settings')
      : activeView === 'chapters'
        ? i18n._('Chapters')
        : activeView === 'highlights'
          ? i18n._('Highlights')
          : i18n._('Book info');

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={i18n._('Book info')}
        sx={{
          position: 'fixed',
          top: '5px',
          left: '5px',
          zIndex: 3,
          height: '54px',
          width: '54px',
          backgroundColor: 'transparent',
          color: '#333',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Info size={18} />
      </IconButton>

      <ThemeProvider theme={lightTheme}>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={closeModal}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#FFF3DD',
                color: '#111',
              },
            },
          }}
        >
          <Stack
            data-testid="book-info-modal"
            sx={{ padding: '20px 20px 30px 20px', width: 340, gap: '30px', position: 'relative' }}
          >
            {activeView !== 'menu' ? (
              <IconButton
                data-testid="book-info-back-button"
                onClick={() => setActiveView('menu')}
                aria-label={i18n._('Back')}
                sx={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                }}
              >
                <ChevronLeft size={18} />
              </IconButton>
            ) : null}

            <IconButton
              onClick={closeModal}
              aria-label={i18n._('Close settings')}
              sx={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                padding: 0,
              }}
            >
              <X size={18} />
            </IconButton>

            <Stack
              sx={{
                paddingTop: activeView !== 'menu' ? '14px' : 0,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Stack>

            {activeView === 'menu' ? (
              <Stack sx={{ gap: '10px' }}>
                <Button
                  data-testid="book-info-menu-settings"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setActiveView('settings')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {i18n._('Settings')}
                </Button>
                <Button
                  data-testid="book-info-menu-chapters"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setActiveView('chapters')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {i18n._('Chapters')}
                </Button>
                <Button
                  data-testid="book-info-menu-highlights"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setActiveView('highlights')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {i18n._('Highlights')}
                </Button>
              </Stack>
            ) : null}

            {activeView === 'settings' ? (
              <ReaderSettingsPanel
                speech={speech}
                isTouchDevice={isTouchDevice}
                localFontSize={localFontSize}
                localParagraphGap={localParagraphGap}
                localLineHeight={localLineHeight}
                setLocalFontSize={setLocalFontSize}
                setLocalParagraphGap={setLocalParagraphGap}
                setLocalLineHeight={setLocalLineHeight}
              />
            ) : null}

            {activeView === 'chapters' ? (
              <ReaderChaptersList
                chapters={chapters}
                activeChapterId={activeChapterId}
                onSelect={(targetPage) => {
                  onSelectChapter(targetPage);
                  closeModal();
                }}
              />
            ) : null}

            {activeView === 'highlights' ? (
              <ReaderHighlightsList
                highlights={highlights}
                onSelect={(targetPage) => {
                  onSelectHighlight(targetPage);
                  closeModal();
                }}
              />
            ) : null}
          </Stack>
        </Popover>
      </ThemeProvider>
    </>
  );
};
