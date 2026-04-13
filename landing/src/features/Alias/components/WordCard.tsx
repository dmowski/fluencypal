'use client';

import { Card, CardContent, Typography } from '@mui/material';

interface WordCardProps {
  word: string;
}

export const WordCard = ({ word }: WordCardProps) => {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 520,
        textAlign: 'center',
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h3"
          fontWeight="bold"
          data-testid="word-card-text"
          sx={{ wordBreak: 'break-word' }}
        >
          {word}
        </Typography>
      </CardContent>
    </Card>
  );
};
