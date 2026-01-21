import { Stack, Typography } from '@mui/material';
import { colorMap, ProgressGrid } from './ProgressGrid';
import { useSettings } from '../../Settings/useSettings';
import { useTasks } from '../../Tasks/useTasks';
import { useLingui } from '@lingui/react';
import { Calendar } from 'lucide-react';

export const ProgressBoard = () => {
  const settings = useSettings();
  const tasks = useTasks();
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        padding: '20px 0px 20px 30px',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          paddingRight: '20px',
          paddingBottom: '22px',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            width: '100%',
            paddingTop: '40px',
          }}
        >
          <Stack
            sx={{
              borderRadius: '50%',
              background: 'linear-gradient(45deg,rgb(69, 141, 230) 0%,rgb(109, 111, 209) 100%)',
              height: '60px',
              width: '60px',

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Calendar size={'27px'} />
          </Stack>
          <Typography variant="h6">{i18n._(`Progress Calendar`)}</Typography>

          <Stack
            sx={{
              flexDirection: 'row',
              gap: '10px',
            }}
          >
            <Typography
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Less`)}
            </Typography>
            {colorMap.map((color) => {
              return (
                <Stack
                  key={color}
                  sx={{
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                  }}
                />
              );
            })}
            <Typography
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`More`)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <ProgressGrid
        startDateTimeStamp={settings.userCreatedAt || Date.now()}
        currentDateTimeStamp={Date.now()}
        getDateStat={(date) => {
          const dayStat = tasks.daysTasks?.[date];
          return Object.keys(dayStat || {}).length;
        }}
      />
    </Stack>
  );
};
