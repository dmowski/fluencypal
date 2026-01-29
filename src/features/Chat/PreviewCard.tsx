import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronRight } from 'lucide-react';
import { ChatProvider, useChat } from './useChat';
import { PreviewMessage } from './Message';
import { useRouter } from 'next/navigation';

const PreviewCardComponent = () => {
  const { i18n } = useLingui();
  const chat = useChat();
  const router = useRouter();

  const previewMessages = chat.previewMessages;

  const openMessage = async (messageId: string) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set('post', `${messageId}`);
    newSearchParams.set('page', `community`);
    newSearchParams.set('section', `chat`);
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.push(`${newUrl}`, { scroll: true });
  };

  const redirectToCommunity = async () => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set('post', ``);
    newSearchParams.set('page', `community`);
    newSearchParams.set('section', `chat`);
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.push(`${newUrl}`, { scroll: true });
  };

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '10px',
        marginTop: '20px',

        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.8,
          padding: '5px 0 0px 10px',
        }}
      >
        {i18n._('Community messages:')}
      </Typography>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '20px 15',
            width: 'max-content',
          }}
        >
          {previewMessages.map((message, index) => {
            return <PreviewMessage key={message.id} message={message} onOpen={openMessage} />;
          })}
        </Stack>

        <Stack
          onClick={redirectToCommunity}
          component={'button'}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '100%',
            position: 'absolute',
            zIndex: 122,
            top: 0,
            color: '#fff',
            right: '-2px',
            border: 'none',
            background:
              'linear-gradient(90deg, rgba(10, 18, 30, 0.1) 0%, rgba(10, 18, 30, 1) 90%, rgba(10, 18, 30, 1) 100%)',
            cursor: 'pointer',
          }}
        >
          <Stack
            sx={{
              borderRadius: '50%',
              height: '40px',
              width: '40px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #ffffff98',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ChevronRight size={'25px'} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const PreviewCard = () => {
  return (
    <ChatProvider
      metadata={{
        spaceId: 'global',
        allowedUserIds: null,
        isPrivate: false,
        type: 'global',
      }}
    >
      <PreviewCardComponent />
    </ChatProvider>
  );
};
