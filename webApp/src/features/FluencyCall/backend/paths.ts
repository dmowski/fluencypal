import { getDB } from '@/app/api/config/firebase';

export const fluencyCallAccountRef = (userId: string) =>
  getDB().collection('users').doc(userId).collection('fluencyCall').doc('account');

export const fluencyCallPaymentRef = (userId: string, paymentId: string) =>
  getDB().collection('users').doc(userId).collection('fluencyCallPayments').doc(paymentId);
