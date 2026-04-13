'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useUserReport } from './useUserReport';

export const ReportModal = () => {
  const { i18n } = useLingui();
  const userReport = useUserReport();

  const [report, setReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    userReport.closeReportModal();
    setReport('');
  };

  const onSubmit = async () => {
    if (!report.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await userReport.submitReport(report);
      setReport('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userReport.activeUserIdModal) {
    return <></>;
  }

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack
        sx={{
          gap: '20px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '600px',
        }}
      >
        <Stack>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('Report User')}
          </Typography>

          <Typography variant="caption">
            {i18n._('Describe what happened and why you are reporting this user.')}
          </Typography>
        </Stack>

        <Stack
          component={'form'}
          sx={{
            width: '100%',
            gap: '10px',
          }}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <TextField
            sx={{
              width: '100%',
            }}
            value={report}
            required
            onChange={(e) => setReport(e.target.value)}
            placeholder={i18n._('Write your report here')}
            multiline
            rows={5}
          />

          <Stack
            sx={{
              width: '100%',
            }}
          >
            <Button
              variant="contained"
              type="submit"
              color="error"
              disabled={isSubmitting}
              sx={{
                minWidth: '300px',
              }}
            >
              {isSubmitting ? i18n._('Submitting...') : i18n._('Submit Report')}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
