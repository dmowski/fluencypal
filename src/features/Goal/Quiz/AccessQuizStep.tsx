import { AiVoice } from '@/common/ai';
import { AiAvatarVideo } from '@/features/Conversation/CallMode/AiAvatarVideo';
import { AiAvatar } from '@/features/Conversation/CallMode/types';
import { getAiVoiceByVoice } from '@/features/Conversation/CallMode/voiceAvatar';
import { Avatar } from '@/features/Game/Avatar';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { InfoStep } from '@/features/Survey/InfoStep';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { BotOff, ShieldCheck, ChevronUp, ChevronDown, Unlock } from 'lucide-react';
import { useState } from 'react';

export const AccessQuizStep = ({
  isFullAccessRedirect,
  setIsFullAccessRedirect,
  teacherVoice,
  isStepLoading,
  next,
}: {
  isFullAccessRedirect: boolean;
  setIsFullAccessRedirect: (value: boolean) => void;
  teacherVoice: AiVoice;
  next: () => void;
  isStepLoading?: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <InfoStep
      title={i18n._(`How would you like to practice?`)}
      subTitle={i18n._(
        `Unlock human-like voice conversations and a curriculum tailored specifically to your goals.`,
      )}
      subComponent={
        <Stack sx={{ paddingTop: '30px', gap: '30px' }}>
          <AccessSelector
            isSpeaking={true}
            isFullAccess={true}
            isSelected={isFullAccessRedirect}
            onSelect={() => setIsFullAccessRedirect(true)}
            aiAvatar={getAiVoiceByVoice(teacherVoice)}
          />

          <AccessSelector
            isSpeaking={false}
            isFullAccess={false}
            isSelected={!isFullAccessRedirect}
            onSelect={() => setIsFullAccessRedirect(false)}
            aiAvatar={getAiVoiceByVoice(teacherVoice)}
          />
        </Stack>
      }
      onClick={next}
      disabled={isStepLoading}
      isStepLoading={isStepLoading}
    />
  );
};

const AccessSelector = ({
  isSelected,
  onSelect,
  aiAvatar,

  isSpeaking,
  isFullAccess,
}: {
  isSelected: boolean;
  onSelect: () => void;
  aiAvatar: AiAvatar;

  isSpeaking: boolean;
  isFullAccess: boolean;
}) => {
  const { i18n } = useLingui();
  const [isShowRefundPolicy, setIsShowRefundPolicy] = useState(false);
  return (
    <Stack
      component={'button'}
      onClick={onSelect}
      sx={{
        textAlign: 'left',
        background: isFullAccess
          ? 'linear-gradient(135deg, rgba(21, 101, 230, 0.26) 0%, rgba(0, 255, 163, 0) 100%)'
          : 'transparent',
        border: 'none',
        borderRadius: '10px',
        color: 'inherit',

        gap: '25px',
        // allow text selection
        userSelect: 'text',
        padding: '0px 0 5px 0',

        boxShadow: isSelected
          ? '0px 0px 0px 7px rgba(0, 0, 0, 1), 0px 0px 0px 10px rgba(0, 185, 252, 1) '
          : '0px 0px 0px 1px rgb(255, 255, 255, 0.3)',
      }}
    >
      <Stack
        sx={{
          height: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          justifyContent: 'flex-start',

          alignItems: 'center',
          flexDirection: 'row',
          justifyItems: 'space-between',
          gap: '5px',
          padding: '20px',
          paddingBottom: '0px',
          '@media (max-width: 600px)': {
            padding: '15px',
            paddingBottom: '0px',
          },
        }}
      >
        <Stack
          sx={{
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: isFullAccess ? '42px' : '28px',
              fontWeight: isFullAccess ? 800 : 600,
              '@media (max-width: 600px)': {
                fontSize: isFullAccess ? '32px' : '24px',
              },

              '@media (max-width: 400px)': {
                fontSize: isFullAccess ? '28px' : '22px',
              },
            }}
          >
            {isFullAccess ? i18n._(`Full Access`) : i18n._(`Free Access`)}
          </Typography>

          <Typography
            sx={{
              opacity: isSelected ? 0.9 : 0.8,
            }}
          >
            {isFullAccess
              ? i18n._(`For focused, uninterrupted learning.`)
              : i18n._(`If you want to try before you buy.`)}
          </Typography>
        </Stack>
        {isFullAccess && (
          <Stack
            sx={{
              width: '70px',
              minWidth: '70px',
              height: '70px',
              position: 'relative',
              overflow: 'hidden',
              //borderRadius: '100px',
              '@media (max-width: 600px)': {
                display: ' none',
              },
            }}
          >
            <Avatar url={aiAvatar.photoUrls[0]} avatarSize="70px" />
          </Stack>
        )}
      </Stack>

      <Stack
        sx={{
          width: '100%',
          padding: '20px',
          paddingTop: '0px',
          '@media (max-width: 600px)': {
            padding: '15px',
            paddingTop: '0px',
          },
          gap: '30px',
        }}
      >
        <ColorIconTextList
          gap="10px"
          listItems={
            isFullAccess
              ? [
                  {
                    title: i18n._('Unlimited messages'),
                    iconName: 'check',
                  },
                  {
                    title: i18n._('Full voice features'),
                    iconName: 'volume-2',
                  },
                  {
                    title: i18n._('Access to the community'),
                    iconName: 'users',
                  },
                ]
              : [
                  {
                    title: i18n._('Limited messages'),
                    iconName: 'lock',
                  },
                  {
                    title: i18n._('Limited voice features'),
                    iconName: 'volume-off',
                  },
                  {
                    title: i18n._('Access to the community'),
                    iconName: 'users',
                  },
                ]
          }
        />

        {isFullAccess && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 245, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              padding: '5px 10px 5px 10px',
              borderRadius: '8px',
              width: 'fit-content',
            }}
            component={'span'}
            onClick={(e) => {
              e.stopPropagation();
              setIsShowRefundPolicy(!isShowRefundPolicy);
            }}
          >
            <ShieldCheck size={21} color="rgb(231, 235, 252)" />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
              }}
            >
              {i18n._('Refund guarantee')}
            </Typography>
            {isShowRefundPolicy ? <ChevronUp /> : <ChevronDown />}
          </Stack>
        )}
        {isShowRefundPolicy && isFullAccess && (
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 1)',
            }}
          >
            {i18n._(
              'If it doesn’t feel like the right fit for you, you can request a refund from your Profile → Payment history. No stress, no complicated steps.',
            )}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
