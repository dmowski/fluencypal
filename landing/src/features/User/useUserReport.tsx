'use client';

import { Context, JSX, ReactNode, createContext, useContext, useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useLingui } from '@lingui/react';
import { CONTACTS } from '../Landing/Contact/data';

interface UserReportContext {
  openReportModal: (userId: string) => void;
  closeReportModal: () => void;
  activeUserIdModal: string;
  submitReport: (report: string) => Promise<void>;
}

const userReportContext: Context<UserReportContext> = createContext<UserReportContext>({
  openReportModal: () => void 0,
  closeReportModal: () => void 0,
  activeUserIdModal: '',
  submitReport: async () => void 0,
});

const useProvideUserReport = (): UserReportContext => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const [activeUserIdModal, setActiveUserIdModal] = useState('');

  const openReportModal = (userId: string) => {
    setActiveUserIdModal(userId);
  };

  const closeReportModal = () => {
    setActiveUserIdModal('');
  };

  const submitReport = async (report: string) => {
    const reportedUserId = activeUserIdModal;
    const reporterId = auth.uid;
    const reportText = report.trim();

    if (!reportText || !reportedUserId || !reporterId) {
      return;
    }

    const reportMessage = [
      '🚨 User report',
      `ReportedUserId: ${reportedUserId}`,
      `ReportedBy: ${reporterId}`,
      `Reason: ${reportText}`,
    ].join('\n');

    try {
      await auth.sendTgMessage(reportMessage);
      window.alert(i18n._('Report submitted, we will review it.'));
      closeReportModal();
    } catch (error) {
      console.error('Error submitting user report', error);
      window.alert(
        i18n._(
          'Failed to submit report. Please try to use support chat to report this user or send email with details to',
        ) + CONTACTS.email,
      );
      throw error;
    }
  };

  return {
    openReportModal,
    closeReportModal,
    activeUserIdModal,
    submitReport,
  };
};

export const UserReportProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const userReport = useProvideUserReport();

  return <userReportContext.Provider value={userReport}>{children}</userReportContext.Provider>;
};

export const useUserReport = (): UserReportContext => useContext(userReportContext);
