'use client';

import { useAuth } from '../Auth/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { deleteCollectionDocs, firestore } from '../Firebase/init';
import { doc, DocumentReference, setDoc } from 'firebase/firestore';
import { UserSettings } from '@/common/user';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useLingui } from '@lingui/react';
import { isTMA } from '@telegram-apps/sdk-react';
import { sendDeleteMyAccountRequest } from '@/app/api/deleteAccount/sendDeleteMyAccountRequest';
import { sleep } from '@/libs/sleep';

export const useDeleteAccount = ({
  onClose,
  startPage,
}: {
  onClose?: () => void;
  startPage: string;
}) => {
  const auth = useAuth();

  const { i18n } = useLingui();
  const userId = auth.uid;
  const notifications = useNotifications();
  const userSettingsDoc = useMemo(() => {
    return userId ? (doc(firestore, `users/${userId}`) as DocumentReference<UserSettings>) : null;
  }, [userId]);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isTotalDelete, setIsTotalDelete] = useState(false);

  useEffect(() => {
    if (!auth.uid) return;

    const isDevAccount = auth.userInfo?.email?.includes('dmowski') || false;
    const isTelegramApp = isTMA();
    setIsTotalDelete(isTelegramApp || isDevAccount);
  }, [auth.uid]);

  const redirectToStartPage = () => {
    window.location.href = startPage;
  };

  const onDeleteAccount = async () => {
    if (isTotalDelete) {
      setIsDeletingAccount(true);
      try {
        await sendDeleteMyAccountRequest(await auth.getToken());
        await auth.logout();
        localStorage.clear();

        await sleep(100);

        redirectToStartPage();
      } catch (e) {
        console.log(e);
        alert('Error happened. Try again');
        setIsDeletingAccount(false);
      }
      return;
    }

    if (!userId || !userSettingsDoc) {
      redirectToStartPage();
      return;
    }
    const confirm = window.confirm(i18n._(`Are you sure you want to delete your account?`));
    if (!confirm) return;

    setIsDeletingAccount(true);

    try {
      await deleteCollectionDocs(`users/${userId}/conversations`);
      await deleteCollectionDocs(`users/${userId}/homeworks`);
      await deleteCollectionDocs(`users/${userId}/stats`);
      await deleteCollectionDocs(`users/${userId}/phraseCorrections`);
      await deleteCollectionDocs(`users/${userId}/goals`);
      await deleteCollectionDocs(`users/${userId}/quiz2`);
      await deleteCollectionDocs(`users/${userId}/interview`);
      await setDoc(userSettingsDoc, { languageCode: null }, { merge: true });

      notifications.show(
        i18n._(`Your account has been successfully deleted. We are sorry to see you go!`),
        {
          severity: 'success',
          autoHideDuration: 10_000,
        },
      );

      auth.logout();
      onClose?.();
      localStorage.clear();
      redirectToStartPage();
    } catch (error) {
      setIsDeletingAccount(false);
      notifications.show(
        i18n._(`Failed to delete your account. Please try again later, or contact the developers.`),
        {
          severity: 'error',
          autoHideDuration: 10_000,
        },
      );

      throw error;
    }

    setIsDeletingAccount(false);
  };

  return {
    onDeleteAccount,
    isDeletingAccount,
    isTotalDelete,
  };
};
