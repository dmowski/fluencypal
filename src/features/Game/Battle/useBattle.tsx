'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { GameBattle, GameBattleAnswer } from './types';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { BATTLE_WIN_POINTS } from './data';
import { useBattleQuestions } from './useBattleQuestions';
import { uniq } from '@/libs/uniq';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useGame } from '../useGame';
import { increaseGamePointsRequest } from '../gameBackendRequests';

interface SubmitResult {
  isWinnerExists: boolean;
}

interface BattleContextType {
  battles: GameBattle[];

  createBattle: (battle: GameBattle) => Promise<void>;
  deleteBattle: (battleId: string) => Promise<void>;
  acceptBattle: (battleId: string) => Promise<void>;

  createBattleWithUser: (userId: string) => Promise<void>;

  updateAnswerTranscription: ({}: {
    battleId: string;
    questionId: string;
    transcription: string;
  }) => Promise<void>;

  submitAnswers: (battleId: string) => Promise<SubmitResult>;

  closeBattle: (battleId: string) => Promise<void>;

  loading: boolean;
  countOfBattlesNeedToAttention: number;
}

const BattleContext = createContext<BattleContextType | null>(null);

function useProvideBattle(): BattleContextType {
  const auth = useAuth();
  const userId = auth.uid;
  const battlesRef = db.collections.battle(userId);
  const { questions } = useBattleQuestions();
  const [battles, loading] = useCollectionData(battlesRef);

  const ai = useTextAi();
  const game = useGame();

  const getRandomQuestionsIds = (count: number): string[] => {
    const questionsId = Object.keys(questions);
    const shuffledIds = [...questionsId].sort(() => 0.5 - Math.random());
    return shuffledIds.slice(0, count);
  };

  const sortedBattles = useMemo(() => {
    return battles ? [...battles].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso)) : [];
  }, [battles]);

  const addBattle = async (battle: GameBattle) => {
    if (!battlesRef) return;
    const id = Date.now().toString();
    const newBattle: GameBattle = {
      ...battle,
    };
    const battleDoc = doc(battlesRef, id);
    await setDoc(battleDoc, newBattle);
  };

  const deleteBattle = async (battleId: string) => {
    if (!battlesRef) return;
    const battleDoc = doc(battlesRef, battleId);
    await deleteDoc(battleDoc);
  };

  const editBattle = async (battleId: string, updates: GameBattle) => {
    if (!battlesRef) return;
    const battleDoc = doc(battlesRef, battleId);
    const updatedBattle: GameBattle = {
      ...updates,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(battleDoc, updatedBattle);
  };

  const createBattleWithUser = async (opponentUserId: string) => {
    if (!battlesRef) return;
    const id = Date.now().toString();
    const newBattle: GameBattle = {
      usersIds: [userId, opponentUserId],
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
      battleId: id,
      authorUserId: userId,
      approvedUsersIds: [userId],
      rejectedUsersIds: [],
      betPoints: BATTLE_WIN_POINTS,
      questionsIds: [...getRandomQuestionsIds(2)],
      answers: [],
      submittedUsersIds: [],
      winnerUserId: null,
      hiddenByUsersIds: [],
      winnerDescription: '',
    };
    const battleDoc = doc(battlesRef, id);
    await setDoc(battleDoc, newBattle);
  };

  const acceptBattle = async (battleId: string) => {
    const battle = battles?.find((b) => b.battleId === battleId);
    if (!battle) return;

    const updatedApprovedUsersIds = uniq([...battle.approvedUsersIds, userId]);

    await editBattle(battleId, {
      ...battle,
      approvedUsersIds: updatedApprovedUsersIds,
    });
  };

  const closeBattle = async (battleId: string) => {
    // set hiddenByUsersIds to include current user
    const battle = battles?.find((b) => b.battleId === battleId);
    if (!battle) return;

    const updatedHiddenByUsersIds = uniq([...(battle.hiddenByUsersIds || []), userId]);

    await editBattle(battleId, {
      ...battle,
      hiddenByUsersIds: updatedHiddenByUsersIds,
    });
  };

  const updateAnswerTranscription = async ({
    battleId,
    questionId,
    transcription,
  }: {
    battleId: string;
    questionId: string;
    transcription: string;
  }) => {
    const battle = battles?.find((b) => b.battleId === battleId);
    if (!battle) return;

    const answer: GameBattleAnswer = {
      questionId,
      userId,
      answer: transcription,
      updatedAtIso: new Date().toISOString(),
    };
    const cleanAnswers = battle.answers.filter((a) => {
      const isCurrentAnswer = a.questionId === questionId && a.userId === userId;
      return !isCurrentAnswer;
    });
    const updatedAnswers = [...cleanAnswers, answer];

    await editBattle(battleId, {
      ...battle,
      answers: updatedAnswers,
    });
  };

  const submitAnswers = async (battleId: string): Promise<SubmitResult> => {
    const battle = battles?.find((b) => b.battleId === battleId);
    if (!battle) return { isWinnerExists: false };

    const updatedSubmittedUsersIds = uniq([...battle.submittedUsersIds, userId]);

    await editBattle(battleId, {
      ...battle,
      submittedUsersIds: updatedSubmittedUsersIds,
    });

    const isReadyToDecideWinner = battle.usersIds.every((id) =>
      updatedSubmittedUsersIds.includes(id),
    );

    const getUserUsername = (userId: string) => {
      return game.userNames?.[userId] || '-';
    };

    if (isReadyToDecideWinner) {
      // use ai to decide winner here
      const systemMessage = `You are an impartial judge for a debate competition. The participants have answered the same set of questions. Your task is to evaluate their answers and determine the winner based on the quality of their arguments, clarity, and relevance to the topic.

Here are the participants' answers:
${battle.usersIds
  .map((id, index) => {
    const username = getUserUsername(id);
    const participantHeader = `Participant ${username} (userId: ${id}):\n`;
    const participantAnswers = battle.answers
      .filter((a) => a.userId === id)
      .map((a) => {
        const question = questions[a.questionId];
        return `Question: ${question.topic}. ${question.description}\nAnswer: ${a.answer}\n`;
      })
      .join('\n');

    return participantHeader + participantAnswers;
  })
  .join('\n\n')}

Please provide your decision in the following JSON format:
{"winnerUserId": "userId", "reason": "A brief explanation of why the selected participant won. Do not mention userId in the reason."}`;

      console.log('systemMessage', systemMessage);

      const result = await ai.generateJson<{
        winnerUserId: string;
        reason: string;
      }>({
        systemMessage,
        userMessage: 'Decide the winner based on the provided answers.',
        attempts: 3,
        model: 'gpt-4o',
      });

      const winnerUserId = result.winnerUserId || battle.usersIds[0];
      const winnerDescription = result.reason;

      const updatedBattle = {
        ...battle,
        submittedUsersIds: updatedSubmittedUsersIds,
        winnerUserId,
        winnerDescription,
      };
      await editBattle(battleId, updatedBattle);

      await increaseGamePointsRequest(
        {
          battle: updatedBattle,
        },
        await auth.getToken(),
      );

      return { isWinnerExists: true };
    }
    return { isWinnerExists: false };
  };

  const countOfBattlesNeedToAttention = useMemo(() => {
    if (!battles) return 0;

    const myBattles = battles.filter((battle) => battle.usersIds.includes(userId));
    const activeBattles = myBattles.filter(
      (battle) => !battle.winnerUserId && !battle.hiddenByUsersIds.includes(userId),
    );

    const needMyApprovalIds = activeBattles
      .filter(
        (battle) =>
          !battle.approvedUsersIds.includes(userId) && !battle.rejectedUsersIds.includes(userId),
      )
      .map((b) => b.battleId);

    const uniqIds = uniq([...needMyApprovalIds]);

    return uniqIds?.length || 0;
  }, [battles, userId]);

  return {
    battles: sortedBattles,
    loading,
    acceptBattle,
    closeBattle,
    createBattle: addBattle,
    deleteBattle,
    createBattleWithUser,
    updateAnswerTranscription,
    submitAnswers,
    countOfBattlesNeedToAttention,
  };
}

export function BattleProvider({ children }: { children: ReactNode }): JSX.Element {
  const battleData = useProvideBattle();
  return <BattleContext.Provider value={battleData}>{children}</BattleContext.Provider>;
}

export function useBattle(): BattleContextType {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error('useBattle must be used within a BattleProvider');
  }
  return context;
}
