import { useRouter } from 'next/navigation';
import { useUrlState } from '../Url/useUrlState';
import { sleep } from '@/libs/sleep';

export const useGlobalModals = () => {
  const [isShowPublicChat, setIsShowPublicChat] = useUrlState('publicChat', false, false);
  const [openProgressStatModal, setOpenProgressStatModal] = useUrlState(
    'progressStatModal',
    false,
    false,
  );
  const [isShowDailyQuestions, setIsShowDailyQuestions] = useUrlState(
    'dailyQuestions',
    false,
    false,
  );

  const [isShowEssay, setIsShowEssay] = useUrlState('essay', false, false);

  const router = useRouter();

  const closeAllModels = async () => {
    if (isShowPublicChat) setIsShowPublicChat(false);
    if (isShowDailyQuestions) setIsShowDailyQuestions(false);

    await sleep(400);

    const newUrl = `${window.location.pathname}`;
    router.push(newUrl, {
      scroll: false,
    });
  };

  return {
    openPublicChat: () => setIsShowPublicChat(true),
    isShowPublicChat,

    openDailyQuestions: () => setIsShowDailyQuestions(true),
    isShowDailyQuestions,

    openProgressStatModal: () => setOpenProgressStatModal(true),
    isShowProgressStatModal: openProgressStatModal,

    closeAllModels,

    openEssay: () => setIsShowEssay(true),
    isShowEssay,
  };
};
