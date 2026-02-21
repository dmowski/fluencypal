'use client';
import { Link, Stack, Typography } from '@mui/material';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';

export interface ListItem {
  title: string;
  iconName: IconName;
  href?: string;
}

export const IconTextList = ({ listItems, gap }: { listItems: ListItem[]; gap?: string }) => {
  if (listItems.length === 0) {
    return null;
  }
  return (
    <Stack
      sx={{
        gap: gap || '18px',
        width: '100%',
      }}
    >
      {listItems.map((item, index) => {
        const iconStyle = {
          opacity: 0.7,
        };

        const iconSize = 18;
        return (
          <Stack
            key={index}
            sx={{
              flexDirection: 'row',
              gap: '15px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {item.iconName && (
              <DynamicIcon name={item.iconName} size={iconSize} style={iconStyle} />
            )}
            <Typography
              variant="body2"
              target={item.href ? '_blank' : undefined}
              component={item.href ? Link : 'div'}
              href={item.href}
            >
              {item.title}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};
