'use client';

import { GameProvider, useGame } from './context/GameContext';
import { ModeSelection } from './components/ModeSelection';
import { PlayersSetup } from './components/PlayersSetup';
import { LanguageLevel } from './components/LanguageLevel';
import { CategorySelection } from './components/CategorySelection';

const AliasGameContent = () => {
  const { state } = useGame();

  // Render different screens based on game state
  switch (state.screen) {
    case 'mode-selection':
      return <ModeSelection />;
    case 'players-setup':
      return <PlayersSetup />;
    case 'language-level':
      return <LanguageLevel />;
    case 'category-selection':
      return <CategorySelection />;
    // TODO: Add other screens as we implement them
    default:
      return <ModeSelection />;
  }
};

export const AliasPage = () => {
  return (
    <GameProvider>
      <AliasGameContent />
    </GameProvider>
  );
};
