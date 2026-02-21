import { Box, Stack, Typography } from '@mui/material';
import { TechStackGroup } from '../../types';

export interface TechStackSectionProps {
  id: string;
  title: string;
  subTitle: string;
  keyPoints: string[];
  techGroups: TechStackGroup[];
}

/** Interview Landing – Tech Stack Covered */
export const TechStackSection = (props: TechStackSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: '150px 0',
        backgroundColor: 'rgba(20, 0, 0, 0.2)',
        alignItems: 'center',
        width: '100%',
        position: 'relative',

        '@media (max-width: 600px)': {
          padding: '90px 0 50px 0',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '1300px',
          width: '100%',
          gap: '60px',
          padding: '0 20px',
          flexDirection: 'row',
          '@media (max-width: 900px)': {
            flexDirection: 'column',
            gap: '40px',
          },
        }}
      >
        <Stack
          sx={{
            flex: '0 0 45%',
            gap: '24px',

            height: 'max-content',
            '@media (max-width: 900px)': {
              flex: '1',
            },
          }}
        >
          <Stack sx={{ gap: '12px' }}>
            <H2 align="left">{props.title}</H2>
            <SubTitle align="left">{props.subTitle}</SubTitle>
          </Stack>

          <Stack sx={{ gap: '12px', marginTop: '8px' }}>
            {props.keyPoints.map((point, index) => (
              <Stack
                key={index}
                sx={{
                  flexDirection: 'row',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    marginTop: '8px',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    fontSize: '15px',
                    lineHeight: 1.6,
                  }}
                >
                  {point}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Right column: Tech groups */}
        <Stack
          sx={{
            flex: '1',
            gap: '16px',
          }}
        >
          {props.techGroups.map((group, groupIndex) => (
            <Stack
              key={groupIndex}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px 24px',
                gap: '12px',

                '@media (max-width: 600px)': {
                  padding: '16px 20px',
                },
              }}
            >
              <Typography
                variant="subtitle2"
                component={'h3'}
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.6,
                }}
              >
                {group.groupTitle}
              </Typography>

              <Stack
                sx={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '15px',
                }}
              >
                {group.items.map((item, itemIndex) => (
                  <TechChip key={itemIndex} item={item} />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

import { TechItem } from '../../types';
import { H2, SubTitle } from './Typography';

export const TechChip = ({
  item,
  padding,
  imageSize,
}: {
  item: TechItem;
  padding?: string;
  imageSize?: string;
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '23px',
        gap: '10px',
        padding: padding || '10px 20px 10px 16px',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        {item.logoUrl && (
          <img
            src={item.logoUrl}
            alt={item.label}
            style={{ width: imageSize || '20px', height: 'auto' }}
          />
        )}
        <Typography variant="body2">{item.label}</Typography>
      </Stack>
    </Stack>
  );
};
