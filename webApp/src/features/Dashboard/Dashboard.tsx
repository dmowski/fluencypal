'use client';

import { ProgressBoard } from './Progress/ProgressBoard';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';
import { UsageStatsCards } from '../Usage/UsageStatsCards';
import { PlanDashboardCards } from './PlanDashboardCards';
import { SupportedLanguage } from '@/features/Lang/lang';
import { MyProfile } from '../Settings/MyProfile';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { RolePlayModal } from '../RolePlay/RolePlayModal';
import { usePlan } from '../Plan/usePlan';
import { LessonStartModal } from '../Plan/LessonStartModal';
import { JustTalkCard } from './JustTalkCard';
import { InteractiveLessonDashboardCard } from '../InteractiveLesson/InteractiveLessonDashboardCard';
import { GrammarImprovesCard } from './Grammar/GrammarImprovesCard';
import { RolePlayDashboardCard } from './RolePlayDashboardCard';
import { SimpleNavigationBar } from '../Navigation/SimpleNavigationBar';
import { BackHomeNavButton } from '../Navigation/BackHomeNavButton';
import { DailyQuestionDashboardCard } from './DailyQuestionDashboardCard';
import { GameDashboardCard } from './GameDashboardCard';
import { DailyTasksDashboardCard } from './DailyTasksDashboardCard';
import { ProgressDashboardCard } from '../ProgressStat/ProgressDashboardCard';
import { InstallAppInstruction } from '../InstallApp/InstallAppInstruction';
import { ExamsDashboardCard } from './Exams/ExamsDashboardCard';
import { DashboardSectionContainer, MainDashboardContainer } from './Layout';
import { LinkToStatsAdmin } from './LinkToStats';
import { NewPrivateMessageCard } from './NewPrivateMessageCard';

export function Dashboard({ lang }: { lang: SupportedLanguage }) {
  const appNavigation = useAppNavigation();
  const plan = usePlan();

  return (
    <>
      {appNavigation.currentPage === 'home' ? <SimpleNavigationBar /> : <BackHomeNavButton />}
      <RolePlayModal />

      {plan.activeGoalElementInfo && (
        <LessonStartModal onClose={plan.closeElementModal} goalInfo={plan.activeGoalElementInfo} />
      )}

      <DashboardSectionContainer>
        {appNavigation.currentPage === 'home' && (
          <MainDashboardContainer>
            <NewPrivateMessageCard />
            <DailyTasksDashboardCard />
            <JustTalkCard />
            <InteractiveLessonDashboardCard />
            <DailyQuestionDashboardCard />
            <GrammarImprovesCard />
            <InstallAppInstruction />
            <PlanDashboardCards lang={lang} />
            <RolePlayDashboardCard />

            <GameDashboardCard />
            <ExamsDashboardCard />

            <LinkToStatsAdmin />
          </MainDashboardContainer>
        )}

        {appNavigation.currentPage === 'role-play' && <RolePlayBoard />}

        {appNavigation.currentPage === 'profile' && (
          <>
            <MyProfile lang={lang} />
            <ProgressDashboardCard />
            <UsageStatsCards />
            <ProgressBoard />
          </>
        )}
      </DashboardSectionContainer>
    </>
  );
}
