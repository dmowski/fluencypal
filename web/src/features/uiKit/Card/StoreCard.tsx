import { Stack, Typography } from '@mui/material';
import Image from 'next/image';

interface RowItem {
  imageUrl: string;
  title: string;
  subTitle: string;
  actionButtonTitle: string;
  onClick: () => void;
}

interface StoreCardProps {
  badge: string;
  textColor: string;
  backgroundColor: string;
  borderSize: string;
  previewImageUrl: string;

  label: string;
  title: string;
  subTitle: string;

  items: RowItem[];
  itemsBackgroundColor: string;
  onClick: () => void;
  itemsViewMode: 'list' | 'flow';
}
export const StoreCard = (props: StoreCardProps) => {
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: props.backgroundColor,
        border: `${props.borderSize} solid ${props.backgroundColor}`,
        borderRadius: '16px',
        boxSizing: 'border-box',
        padding: '0',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          position: 'relative',
          borderRadius: '16px 16px 0 0',
          minHeight: '350px',
          overflow: 'hidden',
          justifyContent: 'flex-end',
          padding: '0px',
          zIndex: 3,
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
          <Typography variant="body2" color={props.textColor}>
            {props.label}
          </Typography>
          <Typography
            variant="h4"
            color={props.textColor}
            sx={{
              fontWeight: 800,
            }}
          >
            {props.title}
          </Typography>
          <Typography
            variant="subtitle1"
            color={props.textColor}
            sx={{
              opacity: 0.9,
            }}
          >
            {props.subTitle}
          </Typography>
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

        <Stack>
          <Image
            src={props.previewImageUrl}
            alt="Preview"
            fill
            style={{
              objectFit: 'cover',
              backgroundColor: props.backgroundColor,
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
