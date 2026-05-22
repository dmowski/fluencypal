'use client';

import { useLingui } from '@lingui/react';
import { Box, Stack, Typography } from '@mui/material';
import { MoreVertical } from 'lucide-react';

import { appName } from '../SEO/appInfo';
import { iosInstallInstructionImages } from './iosInstallInstructionImages';
import type { ReactNode } from 'react';

import type { MobilePlatform } from './types';

interface InstallAppInstructionStepsProps {
  platform: MobilePlatform;
}

type InstructionStepContent = {
  title: string;
  imageUrl?: string;
  icon?: ReactNode;
};

const InstructionStep = ({
  step,
  title,
  imageUrl,
  icon,
}: {
  step: number;
  title: string;
  imageUrl?: string;
  icon?: React.ReactNode;
}) => (
  <Stack
    sx={{
      gap: '10px',
      alignItems: 'flex-start',
    }}
  >
    <Stack
      direction="row"
      sx={{
        gap: '14px',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          minWidth: '28px',
          height: '28px',
          borderRadius: '999px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
        }}
      >
        {step}
      </Stack>
      <Stack sx={{ gap: '6px', flex: 1 }}>
        <Typography sx={{ color: '#fff', lineHeight: 1.45 }}>{title}</Typography>
        {icon}
      </Stack>
    </Stack>

    {imageUrl ? (
      <Box
        component="img"
        src={imageUrl}
        alt=""
        sx={{
          width: '100%',
          maxWidth: '360px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'block',
        }}
      />
    ) : null}
  </Stack>
);

export const InstallAppInstructionSteps = ({ platform }: InstallAppInstructionStepsProps) => {
  const { i18n } = useLingui();

  const iosSteps: InstructionStepContent[] = [
    {
      title: i18n._('Click the Share button next to app.fluencypal.com in your browser.'),
      imageUrl: iosInstallInstructionImages[0],
    },
    {
      title: i18n._('Scroll down and tap "Add to Home Screen".'),
      imageUrl: iosInstallInstructionImages[1],
    },
    {
      title: i18n._('Tap "Add" in the top-right corner.'),
      imageUrl: iosInstallInstructionImages[2],
    },
  ];

  const androidSteps: InstructionStepContent[] = [
    {
      title: i18n._('Tap the menu button in the top-right corner of Chrome.'),
      icon: (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}
        >
          <MoreVertical size={18} />
          <Typography variant="caption">{i18n._('Menu')}</Typography>
        </Stack>
      ),
    },
    {
      title: i18n._('Tap "Install app" or "Add to Home screen".'),
    },
    {
      title: i18n._('Confirm the installation.'),
    },
  ];

  const otherSteps: InstructionStepContent[] = [
    {
      title: i18n._('Open your browser menu.'),
    },
    {
      title: i18n._('Look for "Install app" or "Add to Home screen".'),
    },
    {
      title: i18n._('Follow the prompts to add {appName} to your home screen.', { appName }),
    },
  ];

  const steps = platform === 'ios' ? iosSteps : platform === 'android' ? androidSteps : otherSteps;
  const platformLabel =
    platform === 'ios'
      ? i18n._('iPhone / iPad')
      : platform === 'android'
        ? i18n._('Android')
        : i18n._('Mobile browser');

  return (
    <Stack
      data-testid="install-app-instruction-steps"
      sx={{
        width: '100%',
        gap: '18px',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Typography sx={{ color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.4 }}>
        {i18n._(
          'Add the app to your home screen for quick access. Instructions for {platformLabel}:',
          {
            platformLabel,
          },
        )}
      </Typography>

      <Stack sx={{ gap: '20px' }}>
        {steps.map((step, index) => (
          <InstructionStep
            key={step.title}
            step={index + 1}
            title={step.title}
            imageUrl={step.imageUrl}
            icon={step.icon}
          />
        ))}
      </Stack>
    </Stack>
  );
};
