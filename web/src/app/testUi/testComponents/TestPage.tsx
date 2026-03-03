'use client';
import { useUrlState } from '@/features/Url/useUrlState';
import { UploadTest } from './UploadTest';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TestForm } from './TestForm';

export const TestPage = () => {
  const testPages: Record<string, React.ReactNode> = {
    upload: <UploadTest />,
    form: <TestForm />,
  };

  const [page, setPage] = useUrlState<string>('testPage', 'upload', true);

  return (
    <Stack>
      <Stack
        sx={{
          borderBottom: '1px solid #333',
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
        }}
      >
        {testPages[page]}
      </Stack>
    </Stack>
  );
};
