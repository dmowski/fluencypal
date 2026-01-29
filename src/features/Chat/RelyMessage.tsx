import { useLingui } from '@lingui/react';
import { Stack, Button, Typography } from '@mui/material';
import { ArrowUp, ChevronUp } from 'lucide-react';
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
            padding: '0px 0 0 0px',
          }}
        >
          <Stack
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              paddingTop: '12px',
              paddingBottom: '3px',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '0px',
                cursor: 'pointer',
              }}
              onClick={() => setIsShowAllParents(true)}
            >
              <Stack
                sx={{
                  width: '65px',
                  paddingLeft: '0px',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(0, 0, 0, 1)',
                    borderRadius: '50%',
                    color: 'black',
                    width: '22px',
                    height: '22px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowUp size={'14px'} strokeWidth={4} />
                </Stack>
              </Stack>

              <Typography
                sx={{
                  opacity: 0.5,
                }}
                variant="body2"
              >
                {i18n._('Show previous')}
              </Typography>
            </Stack>
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
