'use client';
import { Stack, Tab, Tabs } from '@mui/material';
import { RolePlayCardApp } from './RolePlayCardApp';
import { useRolePlay } from './useRolePlay';

export const RolePlayBoard = () => {
  const {
    selectedCategoryId,
    setSelectedCategoryId,

    allTabs,
    visibleScenarios,
    selectScenario,
  } = useRolePlay();

  return (
    <Stack
      gap={'20px'}
      sx={{
        maxWidth: '100%',
      }}
    >
      <Stack
        gap="15px"
        sx={{
          width: '100%',
        }}
      >
        <Stack
          sx={{
            gap: '20px',
            width: '100%',
          }}
        >
          {visibleScenarios.map((scenario, index) => {
            return (
              <RolePlayCardApp
                key={index}
                scenario={scenario}
                onClick={() => selectScenario(scenario)}
              />
            );
          })}
        </Stack>
      </Stack>

      <Tabs
        scrollButtons={true}
        variant="scrollable"
        allowScrollButtonsMobile
        value={selectedCategoryId}
        onChange={(event, newId) => setSelectedCategoryId(`${newId}`)}
      >
        {allTabs.map((tab, index) => {
          return <Tab key={index} label={tab.title} value={tab.id} />;
        })}
      </Tabs>
    </Stack>
  );
};
