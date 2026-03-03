'use client';
import { PracticeProvider } from '@/app/practiceProvider';
import { SubmitForm } from '@/features/Chat/SubmitForm';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Stack, Typography } from '@mui/material';
import { useState } from 'react';

export const TestForm = () => {
  const [message, setMessage] = useState('');
  return (
    <PracticeProvider>
      <Stack
        sx={{
          width: '100%',
          maxWidth: '800px',
          padding: '40px',
        }}
      >
        <Stack
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              padding: '10px',
              gap: '10px',
            }}
          >
            <Typography variant="caption">Test Form</Typography>
            <Stack
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Markdown variant="chat">{message}</Markdown>
            </Stack>
          </Stack>
          <SubmitForm
            onSubmit={async (e) => setMessage(e)}
            isLoading={false}
            recordMessageTitle={'recordMessageTitle'}
            setIsActiveRecording={function (isRecording: boolean): void {}}
            previousBotMessage={'previousBotMessage'}
          />
        </Stack>
      </Stack>
    </PracticeProvider>
  );
};
