import { Stack, Typography } from '@mui/material';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';

export const FeatureItem = ({
  iconName,
  title,
  subTitle,
  startColor,
  endColor,
}: {
  iconName: IconName;
  title: string;
  subTitle: string;
  startColor: string;
  endColor: string;
}) => {
  return (
    <Stack
      sx={{
        display: 'grid',
        gridTemplateColumns: '45px 1fr',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          height: '45px',
          width: '45px',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(120deg, ${startColor} 0%, ${endColor} 100%)`,
        }}
      >
        <DynamicIcon name={iconName} color="#fff" size={'21px'} />
      </Stack>
      <Stack>
        <Typography
          variant="h6"
          sx={{
            lineHeight: '24px',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
          }}
        >
          {subTitle}
        </Typography>
      </Stack>
    </Stack>
  );
};
