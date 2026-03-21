import { useRouter } from 'next/navigation';
import { useUrlState } from '../Url/useUrlState';
import { sleep } from '@/libs/sleep';

export const useGlobalModals = () => {
  const [isShowPublicChat, setIsShowPublicChat] = useUrlState('publicChat', false, false);
  const [isShowDailyQuestions, setIsShowDailyQuestions] = useUrlState(
    'dailyQuestions',
    false,
    false,
  );
  const router = useRouter();

  const closeAllModels = async () => {
    if (isShowPublicChat) setIsShowPublicChat(false);
    if (isShowDailyQuestions) setIsShowDailyQuestions(false);

    await sleep(400);

    const searchParams = new URLSearchParams();
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl, {
      scroll: false,
    });
  };

  return {
    openPublicChat: () => setIsShowPublicChat(true),
    isShowPublicChat,
    closeAllModels,
    openDailyQuestions: () => setIsShowDailyQuestions(true),
    isShowDailyQuestions,
  };
};
