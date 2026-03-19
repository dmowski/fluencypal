import { Button, Stack, Typography } from '@mui/material';
import { DraftingCompass } from 'lucide-react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import Image from 'next/image';
import { useState } from 'react';

export interface RowItem {
  imageUrl?: string;
  iconName?: IconName;
  bgColor?: string;

  title: string;
  subTitle: string;
  actionButtonTitle: string;
  onClick: () => void;
}

interface StoreCardProps {
  badge?: string;
  textColor: string;
  backgroundColor: string;
  borderSize?: string;
  previewImageUrl: string;

  label?: string;
  title: string;
  subTitle?: string;

  items: RowItem[];
  itemsBackgroundColor: string;
  onClick?: () => void;
  itemsViewMode: 'list' | 'flow';
  emptyItemsStateText?: string;
  children?: React.ReactNode;
}

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
      </Stack>

      {!!props.items.length && (
        <Stack
          sx={{
            width: '100%',
            backgroundColor: props.itemsBackgroundColor,
            position: 'relative',
            padding: '15px 0 12px 0',
            zIndex: 5,
          }}
        >
          {props.items.map((item, index) => (
            <StoreCardRowItem key={index} data={item} iconBorderRadius="12px" />
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

export const StoreCardRowItem = ({
  data,
  iconBorderRadius,
}: {
  data: RowItem;
  iconBorderRadius: string;
}) => {
  return (
    <Stack
      sx={{
        display: 'grid',
        gridTemplateColumns: 'min-content 1fr min-content',
        gap: '12px',
        alignItems: 'center',
        padding: '10px 20px',
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        data.onClick();
      }}
    >
      <RowIcon
        iconName={data.iconName}
        imageUrl={data.imageUrl}
        bgColor={data.bgColor}
        size={'59px'}
        iconSize="29px"
        iconBorderRadius={iconBorderRadius}
      />
      <Stack>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            lineHeight: '18px',
            //backgroundColor: 'red',

            fontSize: '15px',
            padding: 0,
            margin: 0,
            paddingTop: '2px',
          }}
        >
          {data.title}
        </Typography>
        <Typography
          variant="subtitle1"
          color={'text.secondary'}
          sx={{
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',

            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            opacity: 0.8,
            //backgroundColor: 'blue',
            width: '420px',
            '@media (max-width: 700px)': {
              width: '300px',
            },

            '@media (max-width: 550px)': {
              width: '200px',
            },
            '@media (max-width: 450px)': {
              width: '120px',
            },
            '@media (max-width: 350px)': {
              width: '100%',
              whiteSpace: 'normal',
              height: '21px',
            },
          }}
        >
          {data.subTitle}
        </Typography>
      </Stack>
      <Stack>
        <StoreButton onClick={data.onClick} title={data.actionButtonTitle} />
      </Stack>
    </Stack>
  );
};

const StoreButton = ({ title, onClick }: { title: string; onClick: () => void }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      sx={{
        padding: '6px 20px',
        minWidth: '32px',
        height: '32px',
        borderRadius: '36px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'none',
        ':hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      {title}
    </Button>
  );
};

export const RowIcon = ({
  iconName,
  imageUrl,
  bgColor,
  size,
  iconBorderRadius,
  iconSize,
}: {
  iconName?: IconName;
  bgColor?: string;
  imageUrl?: string;
  size: string;
  iconBorderRadius: string;
  iconSize?: string;
}) => {
  return (
    <Stack
      sx={{
        width: size,
        minWidth: size,
        height: size,
        borderRadius: iconBorderRadius,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: bgColor || 'rgba(255, 255, 255, 0.05)',

        ':after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: iconBorderRadius,
          boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      {iconName && (
        <DynamicIcon
          name={iconName}
          size={iconSize || '22px'}
          style={{
            position: 'relative',
            zIndex: 3,
          }}
        />
      )}

      {!iconName && imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          loading="eager"
          sizes={size}
          style={{
            objectFit: 'cover',
            zIndex: 1,
            borderRadius: iconBorderRadius,
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
