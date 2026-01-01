"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { GameBattle } from "./types";
import { useAuth } from "@/features/Auth/useAuth";
import { db } from "@/features/Firebase/firebaseDb";

interface BattleContextType {
  battles: GameBattle[];

  createBattle: (battle: GameBattle) => Promise<void>;
  updateBattle: (battleId: string, updates: Partial<GameBattle>) => Promise<void>;
  deleteBattle: (battleId: string) => Promise<void>;

  loading: boolean;
}

const BattleContext = createContext<BattleContextType | null>(null);

function useProvideBattle(): BattleContextType {
  const auth = useAuth();
  const userId = auth.uid || "anonymous";
  const battlesRef = db.collections.battle();
  const [battles, loading] = useCollectionData(battlesRef);

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

  return {
    battles: sortedBattles,
    loading,

    createBattle: addBattle,
    updateBattle: editBattle,
    deleteBattle,
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
