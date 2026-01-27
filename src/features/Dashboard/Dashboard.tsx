'use client';

import { Button, IconButton, Stack, Typography } from '@mui/material';

import { ProgressBoard } from './Progress/ProgressBoard';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';
import { UsageStatsCards } from '../Usage/UsageStatsCards';
import { PlanDashboardCards } from './PlanDashboardCards';
import { SupportedLanguage } from '@/features/Lang/lang';
import { NavigationBar } from '../Navigation/NavigationBar';
import { MyProfile } from '../Settings/MyProfile';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { DashboardBlur } from './DashboardBlur';
import { RolePlayModal } from '../RolePlay/RolePlayModal';
import { usePlan } from '../Plan/usePlan';
import { LessonStartModal } from '../Plan/LessonStartModal';
import { useLingui } from '@lingui/react';
import { Origami, VolumeOff } from 'lucide-react';
import { useAiConversation } from '../Conversation/useAiConversation';
import { useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useAccess } from '../Usage/useAccess';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTeacherSettings } from '../Conversation/CallMode/useTeacherSettings';
import { useConversationAudio } from '../Audio/useConversationAudio';
import dayjs from 'dayjs';
import { AccessBadge } from './AccessBadge';
import VideocamIcon from '@mui/icons-material/Videocam';

interface DashboardProps {
  lang: SupportedLanguage;
}

export function Dashboard({ lang }: DashboardProps) {
  const appNavigation = useAppNavigation();

  const plan = usePlan();
  const { i18n } = useLingui();
  const teacherSettings = useTeacherSettings();

  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const settings = useSettings();
  const access = useAccess();
  const audio = useConversationAudio();

  const startJustTalk = async () => {
    audio.startConversationAudio();

    setIsCallStarting(true);
    await settings.setConversationMode('call');
    conversation.startConversation({
      conversationMode: 'call',
      mode: 'talk',
      voice: settings.userSettings?.teacherVoice || 'shimmer',
    });
  };

  return (
    <>
      <NavigationBar />
      <RolePlayModal />

      {plan.activeGoalElementInfo && (
        <LessonStartModal
          onClose={() => plan.closeElementModal()}
          goalInfo={plan.activeGoalElementInfo}
        />
      )}

      <Stack
        sx={{
          alignItems: 'center',
          paddingBottom: '120px',
          paddingTop: '30px',
        }}
      >
        <Stack
          sx={{
            maxWidth: '700px',
            padding: '0 10px',
            gap: '40px',
            width: '100%',
            '@media (max-width:600px)': {
              padding: '0px',
            },
          }}
        >
          {appNavigation.currentPage === 'home' && (
            <>
              {!access.isFullAppAccess && (
                <AccessBadge
                  title={i18n._('Limited access')}
                  subTitle={i18n._('The AI voice is disabled.')}
                />
              )}

              {access.isFullAppAccess && access.isExpiringSoon && (
                <AccessBadge
                  title={i18n._('Full access - Expiring soon')}
                  subTitle={
                    access.activeSubscriptionTill
                      ? i18n._('Your unlimited access is active until {date}', {
                          date: dayjs(access.activeSubscriptionTill).format('MMM D, YYYY HH:mm'),
                        })
                      : i18n._('Your unlimited access is about to expire soon.')
                  }
                />
              )}

              <Stack
                sx={{
                  marginBottom: '20px',
                  alignItems: 'flex-start',
                  gap: '20px',

                  width: '100%',
                  borderRadius: '16px',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  '@media (max-width:600px)': {
                    borderRadius: '0px',
                    padding: '20px 10px',
                  },
                }}
              >
                <Stack>
                  <Typography variant="h6">{i18n._('Conversation with AI')}</Typography>
                  <Typography
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {i18n._(
                      "Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.",
                    )}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '15px',
                  }}
                >
                  <Button
                    color="info"
                    startIcon={<VideocamIcon />}
                    onClick={startJustTalk}
                    disabled={isCallStarting}
                    variant="contained"
                    sx={{
                      padding: '10px 35px',
                    }}
                  >
                    {i18n._('Start a call')}
                  </Button>
                  <IconButton size="small" sx={{}}>
                    <SettingsIcon onClick={teacherSettings.openSettingsModal} />
                  </IconButton>
                </Stack>
              </Stack>

              <PlanDashboardCards lang={lang} />
            </>
          )}

          {appNavigation.currentPage === 'role-play' && <RolePlayBoard />}
          {appNavigation.currentPage === 'profile' && (
            <>
              <MyProfile lang={lang} />
              <UsageStatsCards />
              <Stack
                sx={{
                  gap: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                }}
              >
                <ProgressBoard />
              </Stack>
            </>
          )}
        </Stack>
        <DashboardBlur />
      </Stack>
    </>
  );
}
