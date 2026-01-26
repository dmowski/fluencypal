import { useLingui } from '@lingui/react';
import { Stack, Button } from '@mui/material';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { getAllParentMessages } from './getAllParentMessages';
import { Message } from './Message';
import { ThreadsMessage } from './type';

export const RelyMessage = ({
  message,
  messages,
}: {
  message: ThreadsMessage;
  messages: ThreadsMessage[];
}) => {
  const parent = message.parentMessageId
    ? messages.find((m) => m.id === message.parentMessageId)
    : null;

  const isMoreParents = parent?.parentMessageId;

  const { i18n } = useLingui();
  const [isShowAllParents, setIsShowAllParents] = useState(false);

  const parentsOfParent = parent && isShowAllParents ? getAllParentMessages(parent, messages) : [];

  return (
    <Stack
      key={message.id}
      sx={{
        padding: '0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: 0,
        borderRight: 0,
      }}
    >
      {(!isMoreParents || isShowAllParents) && (
        <Stack
          sx={{
            padding: '20px 0 0 0',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        />
      )}
      {isMoreParents && !isShowAllParents && (
        <Stack
          sx={{
            padding: '0px 10px 0 10px',
          }}
        >
          <Stack
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              paddingTop: '12px',
            }}
          >
            <Button
              endIcon={<ChevronUp />}
              size="small"
              sx={{}}
              variant="text"
              onClick={() => setIsShowAllParents(true)}
            >
              {i18n._('Show previous')}
            </Button>
          </Stack>
        </Stack>
      )}
      {parentsOfParent.map((parent) => (
        <Message key={parent.id} message={parent} isFullContentByDefault={true} isChain />
      ))}
      {parent && <Message key={parent.id} message={parent} isFullContentByDefault={true} isChain />}
      <Message key={message.id} message={message} isFullContentByDefault={true} />

      {(!isMoreParents || isShowAllParents) && (
        <Stack
          sx={{
            padding: '20px 0 0 0',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        />
      )}
    </Stack>
  );
};
