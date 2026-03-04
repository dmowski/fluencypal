'use client';

import { AdvancedUserRecord } from '@/common/userInfo';
import { useExtractKnowledge } from '@/features/AiKnowledge/useExtractKnowledge';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import { Axe, Loader } from 'lucide-react';
import { useState } from 'react';

export const TestInfo = () => {
  const [result, setResult] = useState<AdvancedUserRecord[]>([]);
  const extractInfo = useExtractKnowledge();
  const [loading, setLoading] = useState(false);

  const onExtract = async () => {
    setResult([]);
    setLoading(true);
    const result = await extractInfo.extractUserRecords(
      'John is a software engineer who loves coding and has 5 years of experience in web development.',
    );

    setResult(result);
    setLoading(false);
  };
  return (
    <Stack
      sx={{
        padding: '30px',
        alignItems: 'flex-start',
      }}
    >
      <Button variant="contained" onClick={onExtract} startIcon={loading ? <Loader /> : <Axe />}>
        Extract Info
      </Button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
};
