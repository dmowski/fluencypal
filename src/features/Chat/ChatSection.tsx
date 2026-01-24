'use client';
import { Button, Stack, Typography } from '@mui/material';
import { useChat } from './useChat';
import { useAuth } from '../Auth/useAuth';
import { SubmitForm } from './SubmitForm';
import { useMemo, useState } from 'react';
import { useUrlState } from '../Url/useUrlParam';
import { ChevronLeft } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { Message } from './Message';
import { useGame } from '../Game/useGame';
import { CustomModal } from '../uiKit/Modal/CustomModal';

import { MessageChain } from './MessageChain';
import { ChatSectionHeader } from './ChatSectionHeader';
import { NoMessagesPlaceholder } from './NoMessagesPlaceholder';
import { ChatSectionContainer } from './ChatSectionContainer';
import { MessageViewsIcon } from './MessageViewsIcon';

export const ChatSection = ({
  placeholder,
  titleContent,
  contextForAiAnalysis,
  addNewPostButtonText,
  limitTopMessages,
  isFullContentByDefault,
  noMessagesPlaceholder,
}: {
  placeholder?: string;
  titleContent?: React.ReactNode;
  contextForAiAnalysis: string;
  addNewPostButtonText?: string;
  limitTopMessages?: number;
  isFullContentByDefault?: boolean;
  noMessagesPlaceholder?: string;
}) => {
  const auth = useAuth();
  const chat = useChat();
  const game = useGame();
  const { i18n } = useLingui();
  const userId = auth.uid || 'anonymous';

  const [activeMessageId, setActiveMessageId] = useUrlState('post', '', false);
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

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      {isModalOpen && (
        <CustomModal onClose={onCloseRecordMessageModal} isOpen={true}>
          <Stack
            sx={{
              maxWidth: '600px',
              gap: '20px',
              width: '100%',
            }}
          >
            <Stack sx={{ marginBottom: '10px' }}>
              {!titleContent && (
                <Typography variant="h6">
                  {isNewPostModalOpen ? i18n._('Add New Post') : i18n._('Add Comment')}
                </Typography>
              )}

              {isNewPostModalOpen && !titleContent && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._('Share your thoughts and get feedback!')}
                </Typography>
              )}

              {titleContent}
            </Stack>

            <Stack
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                backgroundColor: 'rgba(30, 38, 50, 0.9)',
              }}
            >
              {messageToComment && (
                <Message
                  isContentWide
                  key={messageToComment.id}
                  message={messageToComment}
                  isFullContentByDefault
                />
              )}

              <Stack>
                <SubmitForm
                  setIsActiveRecording={setIsActiveRecording}
                  onSubmit={async (messageContent) => {
                    onCloseRecordMessageModal();
                    await chat.addMessage({
                      messageContent,
                      parentMessageId: messageToComment?.id ? messageToComment.id : '',
                    });
                  }}
                  isLoading={chat.loading}
                  recordMessageTitle={
                    messageToComment?.id ? i18n._('Add a reply') : i18n._('Record a message')
                  }
                  previousBotMessage={
                    messageToComment ? messageToComment.content : contextForAiAnalysis || ''
                  }
                />
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}
      {activeMessage ? (
        <Stack
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            gap: '0px',
            '@media (max-width: 700px)': {
              borderRadius: '0px',
              border: 'none',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: '10px 10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.031)',
              borderRadius: '12px 12px 0 0',
              gap: '10px',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Button
              startIcon={<ChevronLeft />}
              onClick={() => setActiveMessageId(activeMessage.parentMessageId || '')}
            >
              {i18n._('Back')}
            </Button>

            <MessageViewsIcon activeMessage={activeMessage} />
          </Stack>
          <MessageChain
            topLevel
            parentId={activeMessage.id}
            isFullContentByDefault={isFullContentByDefault}
          />
        </Stack>
      ) : (
        <ChatSectionContainer>
          <ChatSectionHeader
            setIsNewPostModalOpen={setIsNewPostModalOpen}
            addNewPostButtonText={addNewPostButtonText}
            placeholder={placeholder}
          />

          <MessageChain topLevel parentId={''} limitTopMessages={limitTopMessages} />
        </ChatSectionContainer>
      )}

      {chat.messages.length === 0 && (
        <NoMessagesPlaceholder noMessagesPlaceholder={noMessagesPlaceholder} />
      )}
    </Stack>
  );
};
