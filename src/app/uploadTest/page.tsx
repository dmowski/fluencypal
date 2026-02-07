'use client';

import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { UploadImageButton } from '@/features/Game/UploadImageButton';
import { UploadVideoButton } from '@/features/Video/UploadVideoButton';

export default function UploadTestPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Stack
          sx={{
            padding: '24px',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <Typography variant="h4">Upload Test</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Use these buttons to test image and video upload + conversion.
          </Typography>

          <Stack sx={{ gap: '12px' }}>
            <Typography variant="h6">Image</Typography>
            <UploadImageButton onNewUploadUrl={(url) => setImageUrl(url)} />
            {imageUrl && (
              <Stack sx={{ gap: '8px' }}>
                <Typography variant="caption">Image URL</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {imageUrl}
                </Typography>
                <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </Stack>
            )}
          </Stack>

          <Stack sx={{ gap: '12px' }}>
            <Typography variant="h6">Video</Typography>
            <UploadVideoButton onNewUploadUrl={(url) => setVideoUrl(url)} uploadMode="mock" />
            {videoUrl && (
              <Stack sx={{ gap: '8px' }}>
                <Typography variant="caption">Video URL</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {videoUrl}
                </Typography>
                <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8 }} />
              </Stack>
            )}
          </Stack>
        </Stack>
      </body>
    </html>
  );
}
