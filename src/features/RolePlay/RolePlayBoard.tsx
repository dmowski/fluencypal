'use client';
import { Stack, Tab, Tabs, Typography } from '@mui/material';
import { RolePlayCardApp } from './RolePlayCardApp';
import { VenetianMask } from 'lucide-react';
import { useRolePlay } from './useRolePlay';
import { useLingui } from '@lingui/react';

export const RolePlayBoard = () => {
  const {
    selectedCategoryId,
    setSelectedCategoryId,

    allTabs,
    visibleScenarios,
    selectScenario,
  } = useRolePlay();

  const { i18n } = useLingui();
  return (
    <Stack
      gap={'40px'}
      sx={{
        maxWidth: '100dvw',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <Stack
          sx={{
            borderRadius: '50%',
            background: 'linear-gradient(45deg,rgb(230, 69, 182) 0%,rgb(109, 111, 209) 100%)',
            height: '60px',
            width: '60px',

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <VenetianMask size={'27px'} />
        </Stack>
        <Typography variant="h6">{i18n._(`Role Play`)}</Typography>
      </Stack>

      <Stack
        gap={'20px'}
        sx={{
          maxWidth: '100%',
        }}
      >
        <Tabs
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          value={selectedCategoryId}
          onChange={(event, newId) => setSelectedCategoryId(`${newId}`)}
        >
          {allTabs.map((tab, index) => {
            return <Tab key={index} label={tab.title} value={tab.id} />;
          })}
        </Tabs>

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
      </Stack>
    </Stack>
  );
};
