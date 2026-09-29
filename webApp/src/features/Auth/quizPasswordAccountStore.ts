import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import {
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { firestore } from '@/features/Firebase/init';
import {
  AnonymousQuizSnapshot,
  pickQuizAccountSettings,
  QuizPasswordDeps,
} from './quizPasswordAccount';

export const readAnonymousQuiz = async (uid: string): Promise<AnonymousQuizSnapshot> => {
  const userSnap = await getDoc(doc(firestore, 'users', uid));
  const quizSnap = await getDocs(collection(firestore, 'users', uid, 'quiz2'));
  return {
    uid,
    settings: pickQuizAccountSettings(userSnap.data()),
    quiz2: quizSnap.docs.map((item) => ({ id: item.id, data: item.data() })),
  };
};

export const writeQuizOntoUser = async (
  uid: string,
  snapshot: AnonymousQuizSnapshot,
): Promise<void> => {
  if (snapshot.settings) {
    await setDoc(doc(firestore, 'users', uid), snapshot.settings, { merge: true });
  }
  await Promise.all(
    snapshot.quiz2.map((item) =>
      setDoc(doc(firestore, 'users', uid, 'quiz2', item.id), item.data, { merge: true }),
    ),
  );
};

export const quizPasswordDeps: QuizPasswordDeps = {
  linkWithCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  readAnonymousQuiz,
  writeQuizOntoUser,
};
