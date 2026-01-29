'use client';

import { Stack } from '@mui/material';

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
import { useAccess } from '../Usage/useAccess';
import dayjs from 'dayjs';
import { AccessBadge } from './AccessBadge';
import { JustTalkCard } from './JustTalkCard';
import { PreviewCard } from '../Chat/PreviewCard';

interface DashboardProps {
  lang: SupportedLanguage;
}

export function Dashboard({ lang }: DashboardProps) {
  const appNavigation = useAppNavigation();

  const plan = usePlan();
  const { i18n } = useLingui();

  const access = useAccess();

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
                  subTitle={i18n._('The AI voice is disabled. Limited messages per conversation.')}
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

              <JustTalkCard />

              <PreviewCard />

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
