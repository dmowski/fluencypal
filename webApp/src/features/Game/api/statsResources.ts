import {
  GameAchievement,
  GameAvatars,
  GameLastVisit,
  GameQuestionType,
  GameUserNames,
  GameUsersAchievements,
  GameUsersPoints,
} from '@/features/Game/types';
import { getDB } from '../../../app/api/config/firebase';

import firebaseAdmin from 'firebase-admin';

export const getGameUsersPoints = async (): Promise<GameUsersPoints> => {
  const db = getDB();
  const userDoc = await db.collection('game2').doc('gamePoints').get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUsersPoints;
  return data;
};

export const getGameUsersAchievements = async (): Promise<GameUsersAchievements> => {
  const db = getDB();
  const userDoc = await db.collection('game2').doc('gameUserAchievements').get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUsersAchievements;
  return data;
};

export const getGameUsersAvatars = async (): Promise<GameAvatars> => {
  const db = getDB();
  const userDoc = await db.collection('game2').doc('gameAvatars').get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameAvatars;
  return data;
};

export const getGameUsersLastVisit = async (): Promise<GameLastVisit> => {
  const db = getDB();
  const userDoc = await db.collection('game2').doc('gameLastVisit').get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameLastVisit;
  return data;
};

export const getGameUsersUserNames = async (): Promise<GameUserNames> => {
  const db = getDB();
  const userDoc = await db.collection('game2').doc('gameUserNames').get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUserNames;
  return data;
};

export const setGameUsersPoints = async (points: GameUsersPoints): Promise<void> => {
  const db = getDB();
  await db.collection('game2').doc('gamePoints').set(points, { merge: true });
};

export const renameUserNameById = async ({
  userId,
  newUsername,
}: {
  userId: string;
  newUsername: string;
}): Promise<void> => {
  const db = getDB();

  await db
    .collection('game2')
    .doc('gameUserNames')
    .set(
      {
        [userId]: newUsername,
      },
      { merge: true },
    );
};

export const deleteAvatarByUserId = async (userId: string) => {
  const db = getDB();
  await db
    .collection('game2')
    .doc('gameAvatars')
    .set(
      {
        [userId]: firebaseAdmin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );
};

export const deleteUserLastVisitStatByUserId = async (userId: string) => {
  const db = getDB();
  await db
    .collection('game2')
    .doc('gameLastVisit')
    .set(
      {
        [userId]: firebaseAdmin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );
};

export const deleteGamePointsStatByUserId = async (userId: string) => {
  const db = getDB();
  await db
    .collection('game2')
    .doc('gamePoints')
    .set(
      {
        [userId]: firebaseAdmin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );
};
export const deleteGameUserNameById = async (userId: string) => {
  const db = getDB();
  await db
    .collection('game2')
    .doc('gameUserNames')
    .set(
      {
        [userId]: firebaseAdmin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );
};

export const deleteGameUserById = async (userId: string) => {
  await Promise.all([
    deleteGamePointsStatByUserId(userId),
    deleteAvatarByUserId(userId),
    deleteUserLastVisitStatByUserId(userId),
    deleteGameUserNameById(userId),
  ]);
};

export const isUserIsGameWinner = async (userId: string): Promise<boolean> => {
  const points = await getGameUsersPoints();
  const sortedUserIds = Object.keys(points).sort((a, b) => (points[b] || 0) - (points[a] || 0));

  const userIndex = sortedUserIds.indexOf(userId);
  const isTop5 = userIndex !== -1 && userIndex < 5;

  return isTop5;
};

interface increaseUserPointsProps {
  userId: string;
  points: number;
  gameAchievement: GameAchievement;
}
export const increaseUserPoints = async ({
  userId,
  points,
  gameAchievement,
}: increaseUserPointsProps) => {
  const db = getDB();

  const [stat, achievements] = await Promise.all([
    getGameUsersPoints(),
    getGameUsersAchievements(),
  ]);
  const oldValue = stat[userId] || 1;
  const newValue = oldValue + points;

  const usersAchievements = achievements[userId] || {};
  const oldAchievementPoints = usersAchievements?.[gameAchievement] || 0;
  const newAchievementPoints = oldAchievementPoints + points;
  const newUserAchievements = {
    ...usersAchievements,
    [gameAchievement]: newAchievementPoints,
  };

  await Promise.all([
    db
      .collection('game2')
      .doc('gameUserAchievements')
      .set({ [userId]: newUserAchievements }, { merge: true }),

    db
      .collection('game2')
      .doc('gamePoints')
      .set({ [userId]: newValue }, { merge: true }),
  ]);

  stat[userId] = newValue;
  return stat;
};
