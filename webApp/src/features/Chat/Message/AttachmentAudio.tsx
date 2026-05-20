import { Stack } from '@mui/material';

export const AttachmentAudio = ({ url }: { url: string }) => {
  return (
    <Stack sx={{ paddingTop: '4px', paddingBottom: '4px' }}>
      <audio
        controls
        src={url}
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '8px',
        }}
      />
    </Stack>
  );
};
