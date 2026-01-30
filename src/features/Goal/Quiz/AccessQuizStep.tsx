import { AiVoice } from '@/common/ai';
import { AiAvatarVideo } from '@/features/Conversation/CallMode/AiAvatarVideo';
import { AiAvatar } from '@/features/Conversation/CallMode/types';
import { getAiVoiceByVoice } from '@/features/Conversation/CallMode/voiceAvatar';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { InfoStep } from '@/features/Survey/InfoStep';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { BotOff, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
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
            title={i18n._(`Full Access`)}
            description={i18n._(
              `Unlock full access to personalized practice plans and real-time conversations with AI.`,
            )}
          />

          <AccessSelector
            isSpeaking={false}
            isFullAccess={false}
            isSelected={!isFullAccessRedirect}
            onSelect={() => setIsFullAccessRedirect(false)}
            aiAvatar={getAiVoiceByVoice(teacherVoice)}
            title={i18n._(`Free Access`)}
            description={i18n._(`Not sure yet? Try the app for free first.`)}
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
  title,
  description,
  isSpeaking,
  isFullAccess,
}: {
  isSelected: boolean;
  onSelect: () => void;
  aiAvatar: AiAvatar;
  title: string;
  description: string;
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
        flexDirection: 'row',
        textAlign: 'left',
        background: isFullAccess
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(0, 255, 163, 0) 100%)'
          : 'transparent',
        border: 'none',
        borderRadius: '10px',
        color: 'inherit',

        alignItems: 'center',
        justifyContent: 'center',

        gap: '0px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        padding: '0px',
        // allow text selection
        userSelect: 'text',

        boxShadow: isSelected
          ? '0px 0px 0px 7px rgba(0, 0, 0, 1), 0px 0px 0px 10px rgba(0, 185, 252, 1) '
          : '0px 0px 0px 1px rgb(255, 255, 255, 0.15)',
      }}
    >
      <Stack
        sx={{
          height: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          justifyContent: 'flex-start',
          padding: '20px',
        }}
      >
        <Stack
          sx={{
            width: '70px',
            height: '70px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '100px',
          }}
        >
          <AiAvatarVideo
            aiVideo={aiAvatar}
            isSpeaking={isFullAccess && isSelected && !isShowRefundPolicy}
          />
          {!isFullAccess && (
            <Stack
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,

                alignItems: 'center',
                justifyContent: 'center',

                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <BotOff color="white" size={22} />
            </Stack>
          )}
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          padding: '15px 15px 15px 0',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            opacity: isSelected ? 0.9 : 0.8,
          }}
        >
          {i18n._(description)}
        </Typography>

        {!isFullAccess && (
          <Stack
            sx={{
              marginTop: '15px',
            }}
          >
            <ColorIconTextList
              gap="10px"
              listItems={[
                {
                  title: i18n._('Limited messages per conversation'),
                  iconName: 'lock',
                },
                {
                  title: i18n._('Limited voice features'),
                  iconName: 'lock',
                },
                {
                  title: i18n._('Access to the community'),
                  iconName: 'check',
                },
              ]}
            />
          </Stack>
        )}

        {isFullAccess && (
          <Stack
            sx={{
              marginTop: '15px',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 245, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              {i18n._('Refund policy')}
            </Typography>
            {isShowRefundPolicy ? <ChevronUp /> : <ChevronDown />}
          </Stack>
        )}
        {isShowRefundPolicy && isFullAccess && (
          <Typography
            variant="body2"
            sx={{
              marginTop: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
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
