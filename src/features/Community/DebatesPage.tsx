import { BattleSection } from '../Game/Battle/BattleSection';
import { useAccess } from '../Usage/useAccess';

export const DebatesPage = () => {
  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }
  return <BattleSection />;
};
