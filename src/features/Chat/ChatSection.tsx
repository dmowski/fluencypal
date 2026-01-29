'use client';
import { Button, Stack } from '@mui/material';
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

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
    >
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
          />
        </ChatSectionContainer>
      )}

      {chat.messages.length === 0 && (
        <NoMessagesPlaceholder noMessagesPlaceholder={noMessagesPlaceholder} />
      )}
    </Stack>
  );
};
