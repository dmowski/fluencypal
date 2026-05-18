import { IconButton, Popover, Stack, Tab, Tabs, ThemeProvider } from '@mui/material';
import { BookOpen, CircleEllipsis, Highlighter, SlidersHorizontal, X } from 'lucide-react';
import { type MouseEvent, useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { lightTheme } from '../../uiKit/theme';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { ReaderChapterItem, ReaderChaptersList } from './ReaderChaptersPopover';
import { ReaderHighlightItem, ReaderHighlightsList } from './ReaderHighlightsPopover';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';

const ACTIVE_TAB_STORAGE_KEY = 'reader-book-info-active-tab';

type BookInfoButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  chapters: ReaderChapterItem[];
  highlights: ReaderHighlightItem[];
  activeChapterId: string | null;
  onSelectChapter: (targetPage: number) => void;
  onSelectHighlight: (targetPage: number) => void;
};

type ModalView = 'settings' | 'chapters' | 'highlights';

const getInitialTab = (): ModalView => {
  if (typeof window === 'undefined') return 'settings';
  const stored = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  if (stored === 'settings' || stored === 'chapters' || stored === 'highlights') return stored;
  return 'settings';
};

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
  const [activeView, setActiveView] = useState<ModalView>(getInitialTab);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const setActiveViewPersisted = (view: ModalView) => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, view);
    setActiveView(view);
  };

  const handleInfoClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }

    setAnchorEl(event.currentTarget);
  };

  const closeModal = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        onClick={handleInfoClick}
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
        <CircleEllipsis size={18} />
      </IconButton>

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
              borderRadius: '12px',
            },
          },
        }}
      >
        <Stack
          data-testid="book-info-modal"
          sx={{
            padding: '0',
            width: '340px',
            position: 'relative',

            overflow: 'hidden',
            '@media (max-width:400px)': {
              width: 'calc(100vw - 40px)',
              padding: '10px 0x',
            },
          }}
        >
          <IconButton
            onClick={closeModal}
            aria-label={i18n._('Close settings')}
            sx={{
              width: '30px',
              height: '30px',
              padding: 0,
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              flexShrink: 0,
              zIndex: 1,
              opacity: 0,
              ':hover': {
                opacity: 1,
              },
            }}
          >
            <X size={18} />
          </IconButton>

          <Tabs
            value={activeView}
            onChange={(_, v: ModalView) => setActiveViewPersisted(v)}
            aria-label={i18n._('Book info sections')}
            variant="fullWidth"
          >
            <Tab
              data-testid="book-info-tab-settings"
              value="settings"
              icon={<SlidersHorizontal size={18} />}
              label={i18n._('Settings')}
            />
            <Tab
              data-testid="book-info-tab-chapters"
              value="chapters"
              icon={<BookOpen size={18} />}
              label={i18n._('Chapters')}
            />
            <Tab
              data-testid="book-info-tab-highlights"
              value="highlights"
              icon={<Highlighter size={18} />}
              label={i18n._('Highlights')}
            />
          </Tabs>

          <Stack
            sx={{
              padding: '10px 20px 20px 20px',
              maxHeight: 'calc(100vh - 180px)',
              width: '100%',
              overflowY: 'auto',
              '@media (max-width:400px)': {
                padding: '10px 15px',
              },
            }}
          >
            {activeView === 'settings' ? (
              <ReaderSettingsPanel
                speech={speech}
                isTouchDevice={isTouchDevice}
                onReset={readerSettings.resetToDefault}
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
        </Stack>
      </Popover>
    </>
  );
};
