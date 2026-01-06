import { useMemo } from "react";
import { useGame } from "../Game/useGame";
import { UserProfileModal } from "../Game/UserProfileModal";

export const GlobalModals: React.FC = () => {
  const game = useGame();

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId]);

  return (
    <>
      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal("")} />
      )}
    </>
  );
};
