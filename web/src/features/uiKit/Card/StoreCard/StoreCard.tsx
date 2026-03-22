import { Stack, Typography } from '@mui/material';
import Image from 'next/image';

import { StoreCardRowItem } from './StoreCardRowItem';
import type { StoreCardProps } from './types';

export const StoreCard = (props: StoreCardProps) => {
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: props.backgroundColor,
        borderRadius: '16px',

        boxSizing: 'border-box',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {props.badge && (
        <Stack
          sx={{
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 10,
            backgroundColor: props.backgroundColor,
            padding: '10px 25px 10px 20px',

            borderRadius: '0 0 28px 0',
            color: props.textColor,
          }}
        >
          <Typography
            variant="body2"
            color={props.textColor}
            sx={{
              fontWeight: 500,
            }}
          >
            {props.badge}
          </Typography>
        </Stack>
      )}

      <Stack
        sx={{
          boxShadow: props.borderSize
            ? `inset 0px 0px 0px ${props.borderSize} ${props.backgroundColor}`
            : `inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)`,
          position: 'absolute',
          borderRadius: '16px',

          pointerEvents: 'none',
          zIndex: 4,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />

      <Stack
        sx={{
          width: '100%',
          position: 'relative',
          borderRadius: '12px 12px 0 0',

          minHeight: '350px',
          overflow: 'hidden',
          justifyContent: 'flex-end',
          padding: '0px',
          zIndex: 3,
          cursor: props.onClick ? 'pointer' : 'default',
        }}
        onClick={() => {
          props.onClick?.();
        }}
      >
        <Stack
          sx={{
            position: 'relative',
            zIndex: 3,
            padding: '20px',
            color: props.textColor,
          }}
        >
          {props.label && (
            <Typography
              variant="body2"
              color={props.textColor}
              sx={{
                fontWeight: 500,
              }}
            >
              {props.label}
            </Typography>
          )}
          <Typography
            variant="h4"
            color={props.textColor}
            sx={{
              fontWeight: 800,
            }}
          >
            {props.title}
          </Typography>
          {props.subTitle && (
            <Typography
              variant="subtitle1"
              color={props.textColor}
              sx={{
                opacity: 0.9,
              }}
            >
              {props.subTitle}
            </Typography>
          )}
        </Stack>

        <Stack
          sx={{
            position: 'absolute',
            width: '100%',
            height: '60%',
            bottom: 0,
            left: 0,
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, ${props.backgroundColor} 55%, ${props.backgroundColor} 100%)`,
            zIndex: 1,
            opacity: 1,
          }}
        ></Stack>

        {props.previewImageUrl && (
          <Image
            src={props.previewImageUrl}
            alt="Preview"
            loading="eager"
            sizes="(max-width: 600px) 100vw, 50vw"
            fill
            style={{
              objectFit: 'cover',
              backgroundColor: props.backgroundColor,
              zIndex: 0,
            }}
          />
        )}

        {props.previewVideoUrl && (
          <Stack
            component={'video'}
            src={props.previewVideoUrl}
            autoPlay
            controls={false}
            muted
            loop
            playsInline
            sx={{
              objectFit: 'cover',
              backgroundColor: props.backgroundColor,
              zIndex: 0,
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
          />
        )}
      </Stack>

      {!!props.items.length && (
        <Stack
          sx={{
            width: '100%',
            backgroundColor: props.itemsBackgroundColor,
            position: 'relative',
            padding: '10px 0 10px 0',
            zIndex: 5,
          }}
        >
          {props.items.map((item, index) => (
            <StoreCardRowItem key={index} data={item} />
          ))}
        </Stack>
      )}
      {!props.items.length && props.emptyItemsStateText && (
        <Stack
          sx={{
            width: '100%',
            backgroundColor: props.itemsBackgroundColor,
            position: 'relative',
            padding: '20px',
            zIndex: 5,
            gap: '10px',
          }}
        >
          <Typography variant="body2" color={'#fff'} sx={{ opacity: 0.9 }}>
            {props.emptyItemsStateText}
          </Typography>
        </Stack>
      )}
      {props.children && <Stack>{props.children}</Stack>}
    </Stack>
  );
};
