'use client';
import { Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { RolePlayCardApp } from './RolePlayCardApp';

import { VenetianMask } from 'lucide-react';
import { useRolePlay } from './useRolePlay';
import { useLingui } from '@lingui/react';

export const RolePlayBoard = () => {
  const {
    onSetTab,
    allCategoriesLabel,
    allTabs,
    selectedTab,
    visibleScenarios,
    selectScenario,
    isLimited,
    setIsLimited,
  } = useRolePlay();

  const { i18n } = useLingui();
  return (
    <Stack gap={'40px'}>
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
          maxWidth: 'calc(100dvw - 20px)',
        }}
      >
        <Tabs
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          value={selectedTab}
          onChange={(event, newId) => onSetTab(`${newId || allCategoriesLabel}`)}
        >
          {allTabs.map((tab, index) => {
            return <Tab key={index} label={tab} value={tab} />;
          })}
        </Tabs>

        <Stack gap="15px">
          <Stack
            sx={{
              gap: '20px',
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
          {selectedTab === allCategoriesLabel && (
            <Button
              startIcon={isLimited ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              onClick={() => setIsLimited(!isLimited)}
            >
              {isLimited ? i18n._(`Show more`) : i18n._(`Show less`)}
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
