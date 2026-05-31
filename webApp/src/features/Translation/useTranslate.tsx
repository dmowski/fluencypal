import { useSettings } from '../Settings/useSettings';
import { getPageLangCode } from '../Lang/lang';
import { useEffect, useMemo, useState } from 'react';
import { IconButton, Popover, Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { ArrowDown, X } from 'lucide-react';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { NativeLangCode } from '@/libs/language/type';
import {
  getBatchTranslation,
  getTranslation,
  resolveTranslateTargetLanguage,
} from './translationHelpers';

type UseTranslateOptions = {
  onTranslateModalClose?: () => void;
};

export const useTranslate = (options?: UseTranslateOptions) => {
  const settings = useSettings();

  const [isShowModal, setIsShowModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || null;
  const learningLanguage = settings.languageCode || 'en';

  const targetLanguage = useMemo(
    () =>
      resolveTranslateTargetLanguage({
        nativeLanguageCode,
        pageLangCode,
        learningLanguage,
      }),
    [learningLanguage, nativeLanguageCode, pageLangCode],
  );

  const isTranslateAvailable = targetLanguage && targetLanguage !== learningLanguage;

  const translateText = async (props: {
    text: string;
    sourceLanguage?: NativeLangCode | null;
    targetLanguage?: NativeLangCode | null;
  }) => {
    const finalTargetLanguage = props.targetLanguage || targetLanguage;
    if (!finalTargetLanguage) {
      return '';
    }

    return getTranslation({
      text: props.text,
      sourceLanguage: props.sourceLanguage || null,
      targetLanguage: finalTargetLanguage || null,
    });
  };

  const translateBatchText = async (props: {
    texts: string[];
    sourceLanguage?: NativeLangCode | null;
    targetLanguage?: NativeLangCode | null;
  }): Promise<string[]> => {
    const finalTargetLanguage = props.targetLanguage || targetLanguage;
    if (!finalTargetLanguage) {
      return [];
    }

    return getBatchTranslation({
      texts: props.texts,
      sourceLanguage: props.sourceLanguage || null,
      targetLanguage: finalTargetLanguage || null,
    });
  };

  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<{
    source: string;
    translated: string;
  } | null>(null);
  const translateWithModal = async (text: string, element: HTMLElement) => {
    try {
      console.log('element', element);
      setAnchorEl(element);
      setIsShowModal(true);
      setTranslatedText(null);
      setIsTranslating(true);
      setTranslatedText({
        source: text,
        translated: '',
      });
      const translatedText = await translateText({ text });
      setTranslatedText({
        source: text,
        translated: translatedText,
      });
      setIsTranslating(false);
    } catch (error) {
      setIsTranslating(false);
      throw error;
    }
  };

  const onCloseTranslate = () => {
    setIsTranslating(false);
    setTranslatedText(null);
    setIsShowModal(false);
    setAnchorEl(null);
    options?.onTranslateModalClose?.();
  };

  useEffect(() => {
    if (!isShowModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseTranslate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isShowModal]);

  const { i18n } = useLingui();

  return {
    translateText,
    isTranslateAvailable,
    isTranslateModalOpen: isShowModal,
    translateWithModal,
    onCloseTranslate,
    translateBatchText,
    translateModal:
      (isTranslating || translatedText) && isShowModal && anchorEl ? (
        <Popover
          anchorEl={anchorEl}
          open={!!anchorEl}
          disableScrollLock
          onClose={() => onCloseTranslate()}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
            },
          }}
        >
          <Stack
            sx={{
              gap: '30px',
              backgroundColor: '#333',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '600px',
              padding: '10px 15px',
              position: 'relative',
            }}
          >
            <IconButton
              sx={{ position: 'absolute', top: '0px', right: '0px' }}
              onClick={onCloseTranslate}
            >
              <X size={'18px'} />
            </IconButton>
            <Stack
              sx={{
                gap: '10px',
                width: '100%',
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Markdown variant="conversation">
                  {translatedText?.source ||
                    (isTranslating ? i18n._('Loading...') : i18n._('No text to translate'))}
                </Markdown>
                <AudioPlayIcon text={translatedText?.source || ''} />
              </Stack>

              <ArrowDown size={'18px'} color="rgba(180, 180, 180, 1)" />

              {isTranslating ? (
                <LoadingShapes sizes={['30px']} />
              ) : (
                <Markdown variant="conversation">
                  {translatedText?.translated || i18n._('No translation available')}
                </Markdown>
              )}
            </Stack>
          </Stack>
        </Popover>
      ) : null,
  };
};
