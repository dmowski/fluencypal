import { Stack } from '@mui/material';
import { DynamicIcon } from 'lucide-react/dynamic';
import Image from 'next/image';

import type { CardItemIcon as CardItemIconProps } from './types';

export const CardItemIcon = ({ data }: { data: CardItemIconProps }) => {
  const cardIconSize = '50px';
  const cardIconSizeMobile = '50px';
  const iconBorderRadius = '10px';
  const iconsSize = 21;
  const iconsSizeMobile = 21;

  return (
    <Stack
      sx={{
        width: cardIconSize,
        minWidth: cardIconSize,
        height: cardIconSize,
        borderRadius: iconBorderRadius,

        overflow: 'hidden',

        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        '--icon-size': iconsSize,

        backgroundColor: data.iconBgColor || 'rgba(255, 255, 255, 0.05)',

        ':after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: iconBorderRadius,

          boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
        },

        '@media (max-width: 450px)': {
          width: cardIconSizeMobile,
          minWidth: cardIconSizeMobile,
          height: cardIconSizeMobile,
          '--icon-size': iconsSizeMobile,
        },
      }}
    >
      {data.iconName && (
        <DynamicIcon
          name={data.iconName}
          size={'var(--icon-size)'}
          style={{
            position: 'relative',
            zIndex: 3,
          }}
        />
      )}

      {!data.iconName && data.imageUrl && (
        <Image
          src={data.imageUrl}
          alt=""
          fill
          loading="eager"
          sizes={'(max-width: 600px) 100vw, 50vw'}
          style={{
            objectFit: 'cover',
            zIndex: 1,
          }}
        />
      )}

      <Stack
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          borderRadius: iconBorderRadius,

          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)',
          zIndex: 0,
        }}
      />
    </Stack>
  );
};
