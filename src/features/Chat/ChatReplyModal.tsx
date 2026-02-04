import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Message } from './Message';
import { SubmitForm } from './SubmitForm';
import { ThreadsMessage } from './type';
import { useChat } from './useChat';

export const ChatReplyModal = ({
  onCloseRecordMessageModal,
  isNewPostModalOpen,
  titleContent,
  messageToComment,
  contextForAiAnalysis,
  setIsActiveRecording,
}: {
  onCloseRecordMessageModal: () => void;
  isNewPostModalOpen: boolean;
  titleContent?: React.ReactNode;
  messageToComment?: ThreadsMessage;
  contextForAiAnalysis: string;
  setIsActiveRecording: (isRecording: boolean) => void;
}) => {
  const chat = useChat();
  const { i18n } = useLingui();
  return (
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
              onSubmit={async (messageContent, attachments) => {
                onCloseRecordMessageModal();
                await chat.addMessage({
                  messageContent,
                  parentMessageId: messageToComment?.id ? messageToComment.id : '',
                  attachments,
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
  );
};
