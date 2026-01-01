"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { GameBattle } from "./types";
import { useAuth } from "@/features/Auth/useAuth";
import { db } from "@/features/Firebase/firebaseDb";
import { BATTLE_WIN_POINTS } from "./data";
import { useBattleQuestions } from "./useBattleQuestions";
import { uniq } from "@/libs/uniq";

interface BattleContextType {
  battles: GameBattle[];

  createBattle: (battle: GameBattle) => Promise<void>;
  updateBattle: (battleId: string, updates: Partial<GameBattle>) => Promise<void>;
  deleteBattle: (battleId: string) => Promise<void>;
  acceptBattle: (battleId: string) => Promise<void>;

  createBattleWithUser: (userId: string) => Promise<void>;

  loading: boolean;
}

const BattleContext = createContext<BattleContextType | null>(null);

function useProvideBattle(): BattleContextType {
  const auth = useAuth();
  const userId = auth.uid || "anonymous";
  const battlesRef = db.collections.battle();
  const { questions } = useBattleQuestions();
  const [battles, loading] = useCollectionData(battlesRef);

  const getRandomQuestionsIds = (count: number): string[] => {
    const questionsId = Object.keys(questions);
    const shuffledIds = [...questionsId].sort(() => 0.5 - Math.random());
    return shuffledIds.slice(0, count);
  };

  const sortedBattles = useMemo(() => {
    return battles ? [...battles].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso)) : [];
  }, [battles]);

  const addBattle = async (battle: GameBattle) => {
    const id = Date.now().toString();
    const newBattle: GameBattle = {
      ...battle,
    };
    const battleDoc = doc(battlesRef, id);
    await setDoc(battleDoc, newBattle);
  };

  const deleteBattle = async (battleId: string) => {
    const battleDoc = doc(battlesRef, battleId);
    await deleteDoc(battleDoc);
  };

  const editBattle = async (battleId: string, updates: Partial<GameBattle>) => {
    const battleDoc = doc(battlesRef, battleId);
    const updatedBattle: Partial<GameBattle> = {
      ...updates,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(battleDoc, updatedBattle, { merge: true });
  };

  const createBattleWithUser = async (opponentUserId: string) => {
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
      questionsIds: [...getRandomQuestionsIds(3)],
      answers: [],
      submittedUsersIds: [],
      winnerUserId: null,
      winnerDescription: "",
    };
    const battleDoc = doc(battlesRef, id);
    await setDoc(battleDoc, newBattle);
  };

  const acceptBattle = async (battleId: string) => {
    const battle = battles?.find((b) => b.battleId === battleId);
    if (!battle) return;

    const updatedApprovedUsersIds = uniq([...battle.approvedUsersIds, userId]);

    await editBattle(battleId, {
      approvedUsersIds: updatedApprovedUsersIds,
    });
  };

  return {
    battles: sortedBattles,
    loading,
    acceptBattle,

    createBattle: addBattle,
    updateBattle: editBattle,
    deleteBattle,
    createBattleWithUser,
  };
}

export function BattleProvider({ children }: { children: ReactNode }): JSX.Element {
  const battleData = useProvideBattle();
  return <BattleContext.Provider value={battleData}>{children}</BattleContext.Provider>;
}

export function useBattle(): BattleContextType {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error("useBattle must be used within a BattleProvider");
  }
  return context;
}
