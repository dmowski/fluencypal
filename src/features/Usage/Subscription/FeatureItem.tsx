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
  const iconContainerSize = '52px';
  const iconSize = '21px';
  return (
    <Stack
      sx={{
        display: 'grid',

        gridTemplateColumns: `${iconContainerSize} 1fr`,
        gap: '20px',
        alignItems: 'flex-start',
        maxWidth: '700px',
      }}
    >
      <Stack
        sx={{
          height: iconContainerSize,
          width: iconContainerSize,
          borderRadius: '9px',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(120deg, ${startColor} 0%, ${endColor} 100%)`,
        }}
      >
        <DynamicIcon name={iconName} color="#fff" size={iconSize} />
      </Stack>
      <Stack
        sx={{
          gap: '6px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            lineHeight: '24px',
            fontSize: '22px',
            fontWeight: 650,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            opacity: 0.9,
            fontSize: '16px',
          }}
        >
          {subTitle}
        </Typography>
      </Stack>
    </Stack>
  );
};
