import { Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { StoreCardRowItem } from './StoreCardRowItem';
import type { StoreCardProps } from './types';

export const StoreCard = (props: StoreCardProps) => {
  const cardBorderRadius = '16px';
  const isOnlyImage = props.items.length === 0 && !props.emptyItemsStateText && !props.children;
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: props.backgroundColor,
        borderRadius: cardBorderRadius,
        position: 'relative',
      }}
    >
      <Stack
        sx={{
          boxShadow: props.borderSize
            ? `inset 0px 0px 0px ${props.borderSize} ${props.backgroundColor}`
            : `inset 0px 0px 0px 1px rgba(255, 255, 255, 0.08)`,
          position: 'absolute',
          borderRadius: cardBorderRadius,

          pointerEvents: 'none',
          zIndex: 11,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />

      {props.badge && (
        <Stack
          sx={{
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 10,
            backgroundColor: props.backgroundColor,
            padding: '10px 25px 10px 20px',

            borderRadius: `${cardBorderRadius} 0 ${cardBorderRadius} 0`,
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
          width: '100%',
          position: 'relative',
          borderRadius: isOnlyImage
            ? cardBorderRadius
            : `${cardBorderRadius} ${cardBorderRadius} 0 0`,

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
                textTransform: 'uppercase',
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
            borderRadius: `0 0 ${cardBorderRadius} ${cardBorderRadius}`,
          }}
        >
          {props.items.map((item, index, all) => (
            <StoreCardRowItem
              key={index}
              data={item}
              borderRadius={
                index === all.length - 1 ? `0 0 ${cardBorderRadius} ${cardBorderRadius}` : undefined
              }
            />
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
            borderRadius: `0 0 ${cardBorderRadius} ${cardBorderRadius}`,
            overflow: 'hidden',
          }}
        >
          <Typography variant="body2" color={'#fff'} sx={{ opacity: 0.9 }}>
            {props.emptyItemsStateText}
          </Typography>
        </Stack>
      )}

      {props.children && <Stack sx={{}}>{props.children}</Stack>}
    </Stack>
  );
};
