import { getDB } from '@/app/api/config/firebase';

export const openAiLiveAccountRef = (userId: string) =>
  getDB().collection('users').doc(userId).collection('openAiLive').doc('account');

export const openAiLiveSessionRef = (userId: string, sessionId: string) =>
  getDB().collection('users').doc(userId).collection('openAiLiveSessions').doc(sessionId);

export const openAiLivePaymentRef = (userId: string, paymentId: string) =>
  getDB().collection('users').doc(userId).collection('openAiLivePayments').doc(paymentId);
