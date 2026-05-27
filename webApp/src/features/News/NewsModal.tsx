'use client';

import { useLingui } from '@lingui/react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getNewsFullTextRequest } from '@/app/api/news/getNewsFullText/getNewsFullTextRequest';
import { useAiConversation } from '../Conversation/useAiConversation/useAiConversation';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaVideoStreams } from '../webCam/mediaStream';
import { useSettings } from '../Settings/useSettings';
import { useAuth } from '../Auth/useAuth';
import { sleep } from '@/libs/sleep';
import { useTranslate } from '../Translation/useTranslate';
import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { NEWS_COMPLEXITY_LABELS } from './constants';
import { useNews } from './useNews';
import { useNewsModal } from './useNewsModal';
import { buildNewsDiscussionPrompt } from './buildNewsDiscussionPrompt';
import { NewsItem, NewsLanguageComplexity } from './types';
import { NewsComments } from './NewsComments';

export const NewsModal = () => {
  const { isOpen, newsId, closeNews } = useNewsModal();

  if (!isOpen || !newsId) return null;

  return <NewsModalContent newsId={newsId} onClose={closeNews} />;
};

interface NewsModalContentProps {
  newsId: string;
  onClose: () => void;
}

const NewsModalContent = ({ newsId, onClose }: NewsModalContentProps) => {
  const news = useNews();
  const auth = useAuth();
  const translator = useTranslate();
  const aiConversation = useAiConversation();
  const audio = useConversationAudio();
  const settings = useSettings();
  const { i18n } = useLingui();

  const [item, setItem] = useState<NewsItem | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [isCallStarting, setIsCallStarting] = useState(false);
  const requestedKeyRef = useRef<string | null>(null);

  const getNewsByIdRef = useRef(news.getNewsById);
  getNewsByIdRef.current = news.getNewsById;

  const complexity: NewsLanguageComplexity = news.complexity;

  useEffect(() => {
    const key = `${newsId}|${retryToken}`;
    if (requestedKeyRef.current === key) return;
    requestedKeyRef.current = key;

    const requestedKey = key;
    setIsLoading(true);
    setHasError(false);
    setItem(null);
    setContent('');

    getNewsByIdRef
      .current(newsId)
      .then((next) => {
        if (requestedKeyRef.current !== requestedKey) return;
        setItem(next);
        setHasError(next === null);
      })
      .catch((error) => {
        if (requestedKeyRef.current !== requestedKey) return;
        console.error('NewsModal: getNewsById failed', error);
        setItem(null);
        setHasError(true);
      })
      .finally(() => {
        if (requestedKeyRef.current !== requestedKey) return;
        setIsLoading(false);
      });
  }, [newsId, retryToken]);

  useEffect(() => {
    if (!item) return;

    const existing = item.versions?.[complexity];
    if (existing) {
      setContent(existing);
      setIsContentLoading(false);
      return;
    }

    let cancelled = false;
    setIsContentLoading(true);
    setContent('');

    void (async () => {
      try {
        const token = await auth.getToken();
        const response = await getNewsFullTextRequest(
          { id: item.id, complexity },
          token || null,
        );
        if (cancelled) return;
        setContent(response.text ?? '');
        if (response.text) {
          setItem((prev) =>
            prev
              ? {
                  ...prev,
                  versions: { ...(prev.versions ?? {}), [complexity]: response.text as string },
                }
              : prev,
          );
        }
      } catch (error) {
        if (cancelled) return;
        console.error('NewsModal: getNewsFullText failed', error);
        setContent('');
      } finally {
        if (!cancelled) {
          setIsContentLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item, complexity, auth]);

  const formattedDate = item?.dateIso
    ? new Date(item.dateIso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const discussWithAi = async () => {
    if (!item || isCallStarting) return;
    setIsCallStarting(true);
    audio.initAudio();

    try {
      await getMediaVideoStreams();
    } catch (e) {
      console.error('Microphone permission denied. error', e);
      alert(
        i18n._(
          'Microphone permission is required to start the call. Please allow microphone access and try again.',
        ),
      );
      window.location.reload();
      setIsCallStarting(false);
      return;
    }

    const prompt = buildNewsDiscussionPrompt(
      {
        ...item,
        versions: { ...(item.versions ?? {}), [complexity]: content || item.versions?.[complexity] },
      },
      complexity,
    );

    await settings.setConversationMode('call');
    await aiConversation.startConversation({
      mode: 'news-discussion',
      ruleToLearn: prompt,
      conversationMode: 'call',
    });

    setIsCallStarting(false);
    await sleep(1000);
    onClose();
  };

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="0">
      <Stack
        sx={{
          backgroundColor: '#37373a',
          color: '#EBEBF5',
          width: '100%',
          height: '100%',
          padding: '0 10px',
        }}
      >
        <Stack
          data-testid="news-modal"
          sx={{
            gap: '24px',
            padding: '20px 5px 80px',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            opacity: 0,
            animation: 'fadeInOpacity 1.2s ease 100ms forwards',
          }}
        >
          {isLoading ? (
            <Stack sx={{ gap: '20px' }} data-testid="news-modal-loading">
              <Typography
                variant="caption"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                {i18n._('Loading article...')}
              </Typography>
              <LoadingShapes sizes={['30px', '200px', '30px', '200px']} />
            </Stack>
          ) : !item || hasError ? (
            <Stack sx={{ gap: '16px' }} data-testid="news-modal-error">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {i18n._('Could not load article')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {i18n._(
                  'Something went wrong while fetching this article. Please check your connection and try again.',
                )}
              </Typography>
              <Stack sx={{ flexDirection: 'row', gap: '12px' }}>
                <Button
                  variant="contained"
                  color="info"
                  data-testid="news-modal-retry-button"
                  onClick={() => setRetryToken((prev) => prev + 1)}
                >
                  {i18n._('Retry')}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack sx={{ gap: '8px' }}>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  {formattedDate && (
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      data-testid="news-modal-date"
                    >
                      {formattedDate}
                    </Typography>
                  )}
                  {item.countryName && (
                    <Chip
                      size="small"
                      label={item.countryName}
                      data-testid="news-modal-country"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    />
                  )}
                  <Chip
                    size="small"
                    label={NEWS_COMPLEXITY_LABELS[complexity]}
                    data-testid="news-modal-complexity"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 600 }} data-testid="news-modal-title">
                  {item.title}
                </Typography>
                {item.subTitle && <Typography>{item.subTitle}</Typography>}
              </Stack>

              {item.imageUrl && (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '420px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    '@media (max-width:600px)': {
                      height: '200px',
                    },
                  }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    data-testid="news-modal-image"
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              )}

              {isContentLoading ? (
                <Stack sx={{ gap: '20px' }} data-testid="news-modal-content-loading">
                  <LoadingShapes sizes={['30px', '200px', '30px', '200px']} />
                </Stack>
              ) : content ? (
                <Stack
                  sx={{
                    '* p': {
                      padding: '16px 0',
                      fontSize: '30px',
                      fontWeight: 400,
                      '@media (max-width:600px)': {
                        fontSize: '22px',
                      },
                    },
                    '*': {
                      fontFamily: 'serif',
                    },
                  }}
                >
                  <Markdown
                    variant="rule"
                    onWordClick={
                      translator.isTranslateAvailable
                        ? (word, element) => {
                            translator.translateWithModal(word, element);
                          }
                        : undefined
                    }
                  >
                    {'\n' + content}
                  </Markdown>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {i18n._(
                    'This article does not have a version for the selected complexity yet. Try a different level.',
                  )}
                </Typography>
              )}

              <Stack
                sx={{
                  marginTop: '20px',
                  flexDirection: 'row',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<VideocamIcon />}
                  disabled={isCallStarting || isContentLoading || !content}
                  onClick={discussWithAi}
                  data-testid="news-modal-discuss-button"
                  sx={{ padding: '10px 24px' }}
                >
                  {isCallStarting ? i18n._('Starting...') : i18n._('Discuss with AI')}
                </Button>
              </Stack>

              <NewsComments newsId={newsId} />
            </>
          )}

          {translator.translateModal}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
