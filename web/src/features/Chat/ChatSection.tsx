'use client';
import { Button, Stack, Typography } from '@mui/material';
import { useChat } from './useChat';
import { useMemo, useState } from 'react';
import { useUrlState } from '../Url/useUrlState';
import { ChevronLeft } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { MessageChain } from './MessageChain';
import { ChatSectionHeader } from './ChatSectionHeader';
import { NoMessagesPlaceholder } from './NoMessagesPlaceholder';
import { ChatSectionContainer } from './ChatSectionContainer';
import { MessageViewsIcon } from './MessageViewsIcon';
import { ActiveMessageHeaderContainer } from './ActiveMessageHeaderContainer';
import { ChatReplyModal } from './ChatReplyModal';
import { ChartSortMode } from './type';
import { useAccess } from '../Usage/useAccess';
import { useSettings } from '../Settings/useSettings';

export const ChatSection = ({
  placeholder,
  titleContent,
  contextForAiAnalysis,
  addNewPostButtonText,
  limitTopMessages,
  isFullContentByDefault,
  noMessagesPlaceholder,
  sortMode = 'all',
}: {
  placeholder?: string;
  titleContent?: React.ReactNode;
  contextForAiAnalysis: string;
  addNewPostButtonText?: string;
  limitTopMessages?: number;
  isFullContentByDefault?: boolean;
  noMessagesPlaceholder?: string;
  sortMode?: ChartSortMode;
}) => {
  const chat = useChat();
  const { i18n } = useLingui();
  const access = useAccess();
  const settings = useSettings();

  const [activeMessageId, setActiveMessageId] = useUrlState('post', '', true);
  const activeMessage = chat.messages.find((msg) => msg.id === activeMessageId);

  const messageToComment = useMemo(() => {
    return chat.messages.find((msg) => msg.id === chat.activeCommentMessageId);
  }, [chat.activeCommentMessageId, chat.messages]);

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const isModalOpen = messageToComment || isNewPostModalOpen;
  const [isActiveRecording, setIsActiveRecording] = useState(false);

  const onCloseRecordMessageModal = () => {
    if (isActiveRecording) {
      alert(i18n._('Please stop the recording before closing the window.'));
      return;
    }
    chat.setActiveCommentMessageId('');
    setIsNewPostModalOpen(false);
  };

  const isNeedAgeConfirmation = !access.isAge18PlusConfirmed;

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        position: 'relative',
      }}
    >
      {isNeedAgeConfirmation && (
        <Stack
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            minHeight: 'max-content',
            height: '100%',
            backgroundColor: 'rgba(4, 22, 43, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            borderRadius: '12px',
            zIndex: 10,
            alignItems: 'center',
          }}
        >
          <Stack
            sx={{
              alignItems: 'center',
              padding: '60px 20px 60px 20px',

              gap: '20px',
              position: 'sticky',
              top: '0px',
            }}
          >
            <Stack
              sx={{
                gap: '10px',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800 }} textAlign={'center'}>
                {i18n._('Age Confirmation Required')}
              </Typography>
              <Typography
                align="center"
                sx={{
                  textWrap: 'balance',
                }}
              >
                {i18n._(
                  'This content may contain material that is not suitable for all ages. Please confirm that you are over 18 years old to proceed.',
                )}
              </Typography>
            </Stack>
            <Stack
              sx={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
                flexWrap: 'wrap',
              }}
            >
              <Button
                size="large"
                variant="contained"
                color="info"
                onClick={() => settings.confirmAge18Plus()}
              >
                {i18n._('Yes, 18+ years old')}
              </Button>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                onClick={() => window.history.back()}
              >
                {i18n._('No, take me back')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}

      {isModalOpen && (
        <ChatReplyModal
          onCloseRecordMessageModal={onCloseRecordMessageModal}
          isNewPostModalOpen={isNewPostModalOpen}
          titleContent={titleContent}
          messageToComment={messageToComment}
          contextForAiAnalysis={contextForAiAnalysis}
          setIsActiveRecording={setIsActiveRecording}
        />
      )}

      {activeMessage ? (
        <ChatSectionContainer>
          <ActiveMessageHeaderContainer>
            <Button
              startIcon={<ChevronLeft />}
              onClick={() => setActiveMessageId(activeMessage.parentMessageId || '')}
            >
              {i18n._('Back')}
            </Button>

            <MessageViewsIcon activeMessage={activeMessage} />
          </ActiveMessageHeaderContainer>

          <MessageChain
            topLevel
            parentId={activeMessage.id}
            isFullContentByDefault={isFullContentByDefault}
          />
        </ChatSectionContainer>
      ) : (
        <ChatSectionContainer>
          <ChatSectionHeader
            setIsNewPostModalOpen={setIsNewPostModalOpen}
            addNewPostButtonText={addNewPostButtonText}
            placeholder={placeholder}
          />

          <MessageChain
            topLevel
            parentId={''}
            limitTopMessages={limitTopMessages}
            sortMode={sortMode}
            isFullContentByDefault={isFullContentByDefault}
          />
        </ChatSectionContainer>
      )}

      {chat.messages.length === 0 && (
        <NoMessagesPlaceholder noMessagesPlaceholder={noMessagesPlaceholder} />
      )}
    </Stack>
  );
};
