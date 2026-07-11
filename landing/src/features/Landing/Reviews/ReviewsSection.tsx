import { Button, Stack, Typography } from '@mui/material';
import { maxLandingWidth, subTitleFontStyle, titleFontStyle } from '../landingSettings';
import { LandingReview } from './reviewsData';
import { MoveRight } from 'lucide-react';

const avatarColors = ['#4338ca', '#6d28d9', '#7e22ce'];

interface ReviewsSectionProps {
  title: string;
  subTitle: string;
  reviews: LandingReview[];
  startPracticeButtonTitle: string;
  startPracticeButtonHref: string;
  checkReviewsButtonTitle: string;
  checkReviewsButtonHref: string;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <Stack direction="row" sx={{ gap: '2px' }} aria-label={`Rated ${rating} out of 5 stars`}>
    {[...Array(5)].map((_, index) => (
      <Typography
        key={index}
        component="span"
        aria-hidden="true"
        sx={{
          fontSize: '18px',
          lineHeight: 1,
          color: index < rating ? '#f59e0b' : 'rgba(245, 158, 11, 0.25)',
        }}
      >
        ★
      </Typography>
    ))}
  </Stack>
);

const ReviewCard: React.FC<{ review: LandingReview; index: number }> = ({ review, index }) => {
  const initials = review.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Stack
      sx={{
        padding: '32px 28px',
        gap: '20px',
        width: '100%',
        borderRadius: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        justifyContent: 'space-between',
        '@media (max-width: 600px)': {
          padding: '24px 20px',
        },
      }}
    >
      <Stack sx={{ gap: '16px' }}>
        <StarRating rating={review.rating} />

        <Typography
          component="h3"
          sx={{
            fontSize: '1.15rem',
            fontWeight: 650,
            color: '#111',
            lineHeight: 1.35,
          }}
        >
          {review.title}
        </Typography>

        <Typography
          sx={{
            fontSize: '1rem',
            color: '#333',
            lineHeight: 1.65,
            whiteSpace: 'pre-line',
          }}
        >
          {review.body}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
        <Stack
          component="span"
          sx={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: avatarColors[index % avatarColors.length],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            color: '#fff',
            fontSize: '15px',
            flexShrink: 0,
          }}
        >
          {initials}
        </Stack>

        <Stack sx={{ gap: '4px', minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#111',
            }}
          >
            {review.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '13px',
              color: 'rgba(0, 0, 0, 0.55)',
            }}
          >
            {review.countryCode} • {review.reviewCountLabel} • {review.dateLabel}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  title,
  subTitle,
  reviews,
  startPracticeButtonTitle,
  startPracticeButtonHref,
  checkReviewsButtonTitle,
  checkReviewsButtonHref,
}) => {
  return (
    <Stack
      id="reviews"
      sx={{
        width: '100%',
        padding: '80px 0 100px 0',
        alignItems: 'center',
        backgroundColor: 'rgb(255, 253, 249, 1)',
        '@media (max-width: 600px)': {
          padding: '60px 0 70px 0',
        },
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: maxLandingWidth,
          padding: '0 10px',
          boxSizing: 'border-box',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        <Stack sx={{ gap: '16px', alignItems: 'center', maxWidth: '810px' }}>
          <Typography
            align="center"
            variant="h3"
            component="h2"
            sx={{
              ...titleFontStyle,
              color: '#000',
            }}
          >
            {title}
          </Typography>
          <Typography
            align="center"
            sx={{
              color: '#000',
              ...subTitleFontStyle,
            }}
          >
            {subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '28px',
            '@media (max-width: 1100px)': {
              gridTemplateColumns: '1fr',
              maxWidth: '640px',
            },
          }}
        >
          {reviews.map((review, index) => (
            <ReviewCard key={review.name} review={review} index={index} />
          ))}
        </Stack>

        <Stack sx={{ alignItems: 'center', gap: '16px' }}>
          <Button
            href={startPracticeButtonHref}
            variant="contained"
            size="large"
            sx={{
              padding: '14px 45px 14px 48px',
              borderRadius: '48px',
              fontSize: '1.1rem',
              backgroundColor: 'rgb(43 35 88)',
              color: '#fff',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgb(33 25 68)',
                boxShadow: 'none',
              },
            }}
            endIcon={<MoveRight />}
          >
            {startPracticeButtonTitle}
          </Button>
          <Button
            href={checkReviewsButtonHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="large"
            sx={{
              fontSize: '1.1rem',
              borderRadius: '48px',
              color: '#111',
              textTransform: 'none',
              textDecoration: 'underline',
              textUnderlineOffset: '6px',
            }}
          >
            {checkReviewsButtonTitle}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
