import { Link, Stack, Typography } from '@mui/material';
import { ChatProvider } from '../Chat/useChat';
import { useAuth } from '../Auth/useAuth';
import { ChatSection } from '../Chat/ChatSection';
import { useLingui } from '@lingui/react';
import { FaqItem } from '../Landing/FAQ/FaqItem';
import { ReceiptText, Cookie } from 'lucide-react';
import { ContactList } from '../Landing/Contact/ContactList';
import { getUrlStart } from '../Lang/getUrlStart';

const supportUserId = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';

export const SupportPage = () => {
  const auth = useAuth();
  const { i18n } = useLingui();

  const users = [auth.uid, supportUserId];
  const chatSpace = `support_${users.sort((a, b) => a.localeCompare(b)).join('_')}`;
  if (!auth.uid) return null;
  return (
    <Stack
      sx={{
        gap: '40px',
      }}
    >
      <Stack
        sx={{
          gap: '5px',
        }}
      >
        <Typography variant="h5">{i18n._(`Need help?`)}</Typography>
        <Typography variant="caption">
          {i18n._(
            `If you have any questions regarding your payment history, you can write message here. We will answer you as soon as possible.`,
          )}
        </Typography>
      </Stack>

      <ChatProvider
        metadata={{
          spaceId: chatSpace,
          allowedUserIds: users,
          isPrivate: true,
          type: 'privateChat',
        }}
      >
        <ChatSection
          contextForAiAnalysis=""
          placeholder={i18n._('Add your problem here...')}
          noMessagesPlaceholder={i18n._('No support messages yet')}
        />
      </ChatProvider>

      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <Typography variant="h6">{i18n._('Frequently Asked Questions')}</Typography>
        <Stack>
          <FaqItem
            info={{
              question: i18n._('I paid, but I still don’t have access.'),
              answer: i18n._(
                'After the payment is completed, it may take a few minutes for the system to process it and grant you access. If you still do not have access after 10 minutes, please contact support via the chat above. We will assist you as soon as possible and make sure you receive the access you paid for.',
              ),
            }}
          />

          <FaqItem
            info={{
              question: i18n._("I don't like the service. Can I get a refund?"),
              answer: i18n._(
                'Yes. If you are not satisfied with our service, you can request a refund. Please contact our support team via the chat above, and we will guide you through the refund process.',
              ),
            }}
          />

          <FaqItem
            info={{
              question: i18n._("I don't like the service. I expected a different feature."),
              answer: i18n._(
                'FluencyPal is still relatively new, and your feedback is very important to us. Please share your feature requests via the chat above, and we will consider them for future updates to improve the service.',
              ),
            }}
          />
        </Stack>
      </Stack>

      <Stack
        sx={{
          flexDirection: 'row',
          gap: '50px',
          width: '100%',
          maxWidth: '800px',
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            gap: '50px',
          },
        }}
      >
        <Stack
          gap={'10px'}
          sx={{
            width: '100%',
          }}
        >
          <Typography>{i18n._(`Contacts:`)}</Typography>

          <ContactList />
        </Stack>

        <Stack
          gap={'10px'}
          sx={{
            width: '100%',
          }}
        >
          <Typography
            sx={{
              opacity: 1,
            }}
          >
            {i18n._(`Legal:`)}
          </Typography>

          <Stack gap={'10px'}>
            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              <ReceiptText />
              <Typography>
                <Link href={`${getUrlStart('en')}terms`}>{i18n._(`Terms of Use`)}</Link>
              </Typography>
            </Stack>

            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              <Cookie />
              <Typography>
                <Link href={`${getUrlStart('en')}privacy`}>{i18n._(`Privacy Policy`)}</Link>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
