import { useUrlState } from "@/features/Url/useUrlParam";

export const useTeacherSettings = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useUrlState(
    "teacherSettings",
    false,
    false,
  );

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return {
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
  };
};
