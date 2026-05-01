'use client';
import { useUrlState } from '@/features/Url/useUrlState';
import { UploadTest } from './UploadTest';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TestForm } from './TestForm';
import { UiCards } from './UiCards';
import { TranscriptTest } from '@/features/Transcript/TranscriptTest';
import { ProgressStatTest } from './ProgressStatTest';
import { EssayTest } from './EssayTest';

export const TestPage = () => {
  const testPages: Record<string, React.ReactNode> = {
    upload: <UploadTest />,
    form: <TestForm />,
    uiCard: <UiCards />,
    transcript: <TranscriptTest />,
    progress: <ProgressStatTest />,
    essay: <EssayTest />,
  };

  const [page, setPage] = useUrlState<string>('testPage', 'upload', true);

  return (
    <Stack
      sx={{
        height: '100%',
        flex: '1 1 1',
      }}
    >
      <Stack
        sx={{
          borderBottom: '1px solid #333',
          height: '100%',
        }}
      >
        <Tabs value={page} onChange={(e, value) => setPage(value)}>
          {Object.keys(testPages).map((key) => (
            <Tab key={key} label={key} value={key} />
          ))}
        </Tabs>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        {testPages[page]}
      </Stack>
    </Stack>
  );
};
