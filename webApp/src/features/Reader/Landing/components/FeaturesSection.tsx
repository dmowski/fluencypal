'use client';

import { Stack } from '@mui/material';
import {
  BookOpen,
  Cloud,
  Headphones,
  Highlighter,
  Languages,
  Library,
} from 'lucide-react';
import { bookLandingFeatures, BookLandingFeature } from '../landingData';
import {
  bookLandingAccentColor,
  bookLandingBgColor,
  bookLandingMaxWidth,
} from '../landingSettings';
import { BodyText, H2, SubTitle } from './Typography';

const iconMap = {
  book: BookOpen,
  translate: Languages,
  highlight: Highlighter,
  speech: Headphones,
  library: Library,
  sync: Cloud,
} satisfies Record<BookLandingFeature['icon'], typeof BookOpen>;

const FeatureCard = ({ feature }: { feature: BookLandingFeature }) => {
  const Icon = iconMap[feature.icon];

  return (
    <Stack
      sx={{
        gap: '14px',
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        border: '1px solid rgba(44, 24, 16, 0.08)',
        height: '100%',
      }}
    >
      <Stack
        sx={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(139, 69, 19, 0.12)',
          color: bookLandingAccentColor,
        }}
      >
        <Icon size={22} />
      </Stack>
      <Stack component="h3" sx={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
        {feature.title}
      </Stack>
      <BodyText>{feature.description}</BodyText>
    </Stack>
  );
};

export const FeaturesSection = () => {
  return (
    <Stack
      id="features"
      component="section"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: { xs: '64px 20px', md: '96px 20px' },
        backgroundColor: bookLandingBgColor,
      }}
    >
      <Stack sx={{ maxWidth: bookLandingMaxWidth, width: '100%', gap: '36px' }}>
        <Stack sx={{ gap: '12px', maxWidth: '760px' }}>
          <H2>Built for reading and learning</H2>
          <SubTitle>
            Everything you need in one calm, book-first interface — without leaving the page you are
            reading.
          </SubTitle>
        </Stack>
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: '20px',
          }}
        >
          {bookLandingFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
