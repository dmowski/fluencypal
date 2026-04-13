'use client';
import { Stack, Typography } from '@mui/material';
import { GoalPlan, PlanElement } from '@/features/Plan/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlanPreviewProps {
  plan: GoalPlan;
}

export const InterviewPlanPreview = ({ plan }: PlanPreviewProps) => {
  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      <Stack
        sx={{
          gap: '20px',
        }}
      >
        {plan.elements.map((planElement, index) => {
          return <PlanCardPreview planElement={planElement} key={index} index={index} />;
        })}
      </Stack>
    </Stack>
  );
};

export const PlanCardPreview = ({
  planElement,
  index,
}: {
  planElement: PlanElement;
  index: number;
}) => {
  const videUrls = [
    '/interview/interviewWebPreview2.webm',
    '/interview/interviewWebPreview.webm',
    '/interview/camera/7261921-uhd_3840_2160_25fps.webm',
    '/interview/camera/7706641-uhd_4096_2160_25fps.webm',
    '/interview/camera/8814086-hd_1920_1080_25fps.webm',

    '/interview/camera/5977502-uhd_3840_2160_25fps.webm',
    '/interview/camera/854053-hd_1920_1080_25fps.webm',
    '/interview/camera/2516161-hd_1920_1080_24fps.webm',
    '/interview/camera/4435751-uhd_3840_2160_25fps.webm',
  ];

  const previewVideoUrl = videUrls[index % videUrls.length];

  const [isOpen, setIsOpen] = useState(false);
  return (
    <Stack
      sx={{
        border: `1px solid rgba(96, 165, 250, 0.3)`,
        borderRadius: '8px',
        textAlign: 'left',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        color: isOpen ? 'white' : 'rgba(255, 255, 255, 1)',
        flexDirection: 'column',
        padding: 0,
        gap: '0px',
        userSelect: 'text',
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      }}
      component={'button'}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 50px',

          '@media (max-width: 600px)': {
            gridTemplateColumns: '100px 1fr 30px',
          },

          '@media (max-width: 500px)': {
            gridTemplateColumns: '70px 1fr 30px',
          },
        }}
      >
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <Stack
            component={'video'}
            autoPlay
            loop
            playsInline
            controls={false}
            muted
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.2)',
            }}
            src={previewVideoUrl}
          />
        </Stack>

        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Stack
            sx={{
              height: '100%',
              justifyContent: 'center',
              padding: '3px 0 0 12px',
            }}
          >
            <Typography
              variant="h6"
              component={'span'}
              sx={{
                fontSize: '18px',
                lineHeight: '20px',
                '@media (max-width: 500px)': {
                  fontSize: '15px',
                  padding: '5px 0',
                },
              }}
            >
              {planElement.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                '@media (max-width: 500px)': {
                  display: 'none',
                },
              }}
            >
              {planElement.subTitle}
            </Typography>
            <Typography
              sx={{
                '@media (max-width: 500px)': {
                  display: 'none',
                },
              }}
              variant="caption"
            >
              {planElement.description}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Stack
            sx={{
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.041)',
              padding: '5px',
              border: `1px solid rgba(96, 165, 250, 0.2)`,
              '@media (max-width: 600px)': {
                padding: '0',
                backgroundColor: 'transparent',
              },
            }}
          >
            {isOpen ? <ChevronUp size={'18px'} /> : <ChevronDown size={'18px'} />}
          </Stack>
        </Stack>
      </Stack>

      {isOpen && (
        <Stack
          sx={{
            padding: '10px',
            boxShadow: ' 0 -1px 0 0 rgba(103, 101, 108, 0.2)',
          }}
        >
          <Typography
            sx={{
              padding: '10px 10px 10px 10px',
              fontSize: '18px',
            }}
          >
            {planElement.details}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
