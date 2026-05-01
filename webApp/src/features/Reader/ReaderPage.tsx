'use client';

import { Stack } from '@mui/material';
import { Reader } from './Reader';
import { testData } from './testData';

export const ReaderPage = () => {
  return (
    <Stack
      sx={{
        padding: '0',
        alignItems: 'center',
        height: '100%',
        flex: '1 1 1',
        backgroundColor: '#F4E1C6',
      }}
    >
      <style>{`
        body {
          background-color: #F4E1C6;
        },
      `}</style>
      <Stack
        sx={{
          minHeight: '500px',
          flex: '1 1 1',
          width: '100%',
        }}
      >
        <Reader data={testData} />
      </Stack>
    </Stack>
  );
};
