'use client';

import { Stack } from '@mui/material';

import { ProgressBoard } from './Progress/ProgressBoard';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';
import { UsageStatsCards } from '../Usage/UsageStatsCards';
import { PlanDashboardCards } from './PlanDashboardCards';
import { SupportedLanguage } from '@/features/Lang/lang';
import { MyProfile } from '../Settings/MyProfile';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { DashboardBlur } from './DashboardBlur';
import { RolePlayModal } from '../RolePlay/RolePlayModal';
import { usePlan } from '../Plan/usePlan';
import { LessonStartModal } from '../Plan/LessonStartModal';
import { JustTalkCard } from './JustTalkCard';
import { GrammarImprovesCard } from './Grammar/GrammarImprovesCard';
import {
  PracticeCustomConversationsDashboardCard,
  RolePlayDashboardCard,
} from './RolePlayDashboardCard';
import { SimpleNavigationBar } from '../Navigation/SimpleNavigationBar';
import { BackHomeNavButton } from '../Navigation/BackHomeNavButton';
import { DailyQuestionDashboardCard } from './DailyQuestionDashboardCard';
import { PublicChatDashboardCard } from './PublicChatDashboardCard';
import { GameDashboardCard } from './GameDashboardCard';
import { DailyTasksDashboardCard } from './DailyTasksDashboardCard';
import { ExperimentalDashboardCard } from './ExperimentalDashboardCard';
import { ProgressDashboardCard } from '../ProgressStat/ProgressDashboardCard';
import { NewsDashboardCard } from '../News/NewsDashboardCard';

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

                  '@media (max-width:350px)': {
                    padding: '0 5px',
                  },
                }}
              >
                <DailyTasksDashboardCard />
                <PracticeCustomConversationsDashboardCard />
                <ProgressDashboardCard />
                <ExperimentalDashboardCard />
                <JustTalkCard />
                <GrammarImprovesCard />
                <PlanDashboardCards lang={lang} />
                <RolePlayDashboardCard />
                <PublicChatDashboardCard />
                <GameDashboardCard />

                <DailyQuestionDashboardCard />
                <NewsDashboardCard />
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
