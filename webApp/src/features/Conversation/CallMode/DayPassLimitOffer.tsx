'use client';

import CallEndIcon from '@mui/icons-material/CallEnd';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { useUrlStateContext } from '@/features/Url/UrlStateContext';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';

export const DAY_PASS_OFFER_TEST_ID = 'day-pass-offer';
export const CHAT_WITH_PEOPLE_TEST_ID = 'chat-with-people';
export const BUY_ACCESS_TEST_ID = 'buy-access';
export const LIMIT_CLOSE_TEST_ID = 'limit-close';

/** Practice path for today's question, keeping a locale prefix such as `/ar`. */
export const practiceDailyQuestionsPath = (pathname: string) => {
  const first = pathname.split('/').filter(Boolean)[0];
  const langPrefix =
    first && first !== 'practice' && supportedLanguages.includes(first as SupportedLanguage)
      ? `/${first}`
      : '';
  return `${langPrefix}/practice?dailyQuestions=true`;
};

export const DayPassLimitOffer = ({
  onClose,
  onCheckoutOpen,
}: {
  onClose: () => void;
  /** Close whatever is covering the page, such as the lesson review. */
  onCheckoutOpen?: () => void;
}) => {
  const { i18n } = useLingui();
  const router = useRouter();
  const { setUrlState } = useUrlStateContext();

  useEffect(() => {
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'day-pass' });
  }, []);

  const openDailyQuestions = () => {
    const nextUrl = practiceDailyQuestionsPath(window.location.pathname);
    router.push(nextUrl, { scroll: false });
  };

  const openPlansModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('paymentModal', 'true');
    params.delete('paymentConfirm');
    params.delete('planLesson');
    params.delete('planLessonDetails');
    if (params.get('paymentDuration') === 'day') {
      params.delete('paymentDuration');
    }
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== nextUrl) {
      router.push(nextUrl, { scroll: false });
    } else {
      setUrlState('paymentModal', 'true');
      setUrlState('paymentConfirm', '');
      setUrlState('paymentDuration', '');
    }
    onCheckoutOpen?.();
  };

  return (
    <Stack
      data-testid={DAY_PASS_OFFER_TEST_ID}
      sx={{ width: '100%', maxWidth: '970px', gap: '25px' }}
    >
      <Stack sx={{ gap: '5px' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '2.5rem',
            lineHeight: '120%',
            '@media (max-width: 400px)': {
              fontSize: '2rem',
            },
          }}
        >
          {i18n._('Free answers have run out')}
        </Typography>
        <Typography sx={{ textWrap: 'balance' }}>
          {i18n._('But there is a solution: chat with real people or buy unlimited access.')}
        </Typography>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'row',
          gap: '10px 25px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button
          size="large"
          color="info"
          variant="contained"
          data-testid={CHAT_WITH_PEOPLE_TEST_ID}
          data-analytics="chat-with-people"
          sx={{
            fontWeight: 600,
            borderRadius: '30px',
            minHeight: '48px',
          }}
          onClick={openDailyQuestions}
        >
          {i18n._('Chat with people')}
        </Button>
        <Button
          size="large"
          color="success"
          variant="contained"
          data-testid={BUY_ACCESS_TEST_ID}
          data-analytics="buy-access"
          sx={{
            backgroundColor: 'rgba(28, 212, 108, 0.78)',
            color: '#ddfff8',
            fontWeight: 600,
            borderRadius: '30px',
            minHeight: '48px',
          }}
          onClick={openPlansModal}
        >
          {i18n._('Buy access')}
        </Button>
        <IconButton
          size="large"
          aria-label={i18n._('End call')}
          data-testid={LIMIT_CLOSE_TEST_ID}
          data-analytics="limit-close"
          onClick={onClose}
          sx={{
            width: '70px',
            borderRadius: '30px',
            backgroundColor: '#dc362e',
            ':hover': { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};
