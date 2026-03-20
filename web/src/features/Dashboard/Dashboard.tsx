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
import { StreaksDaysBadge } from './StreaksDaysBadge';
import { Stories } from '../Sentence/Stories';
import { useAuth } from '../Auth/useAuth';
import { GrammarImprovesCard } from './Grammar/GrammarImprovesCard';
import { RolePlayDashboardCard } from './RolePlayDashboardCard';
import { CommunityDashboardCard } from './CommunityDashboardCard';
import { SimpleNavigationBar } from '../Navigation/SimpleNavigationBar';
import { BackHomeNavButton } from '../Navigation/BackHomeNavButton';
import { DailyQuestionDashboardCard } from './DailyQuestionDashboardCard';
import { PublicChatDashboardCard } from './PublicChatDashboardCard';
import { GameDashboardCard } from './GameDashboardCard';

interface DashboardProps {
  lang: SupportedLanguage;
}

export function Dashboard({ lang }: DashboardProps) {
  const appNavigation = useAppNavigation();
  const plan = usePlan();

  return (
    <>
      {appNavigation.currentPage === 'home' ? <SimpleNavigationBar /> : <BackHomeNavButton />}

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
              <Stack
                sx={{
                  gap: '80px',
                  '@media (max-width:600px)': {
                    padding: '0 10px',
                  },
                }}
              >
                <JustTalkCard />
                <GrammarImprovesCard />
                <PlanDashboardCards lang={lang} />
                <RolePlayDashboardCard />
                <CommunityDashboardCard />
                <DailyQuestionDashboardCard />
                <PublicChatDashboardCard />
                <GameDashboardCard />
              </Stack>
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
