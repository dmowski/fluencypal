import { Stack } from '@mui/material';
import { landingDemoExcerpt } from '../landingData';
import { bookLandingMaxWidth } from '../landingSettings';
import { BodyText, H2, SubTitle } from './Typography';
import { ReaderDemoModal } from './ReaderDemoModal';

export const ReaderDemoSection = () => {
  return (
    <Stack
      id="demo"
      component="section"
      sx={{
        width: '100%',
        gap: '24px',
        alignItems: 'stretch',
        padding: { xs: '64px 0', md: '96px 0' },
        backgroundColor: '#ead7b8',
      }}
    >
      <Stack
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          margin: '0 auto',
          padding: { xs: '0 20px', md: '0 24px' },
          gap: '16px',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <H2>Try the real Reader</H2>
        <SubTitle>
          This is the same reading surface from the app — not a mockup. Open the demo, then click a
          word to translate it, drag to select text and highlight, or open settings to try
          text-to-speech.
        </SubTitle>
        <BodyText>
          Demo book: <strong>The Great Gatsby</strong> by F. Scott Fitzgerald (public domain
          excerpt).
        </BodyText>
        <Stack
          component="blockquote"
          sx={{
            maxWidth: '680px',
            margin: '8px 0 0',
            padding: '20px 24px',
            borderLeft: '4px solid rgba(139, 69, 19, 0.45)',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            borderRadius: '0 12px 12px 0',
            textAlign: 'left',
          }}
        >
          <BodyText>{landingDemoExcerpt}</BodyText>
        </Stack>
        <Stack
          component="picture"
          sx={{
            display: 'block',
            width: '100%',
            maxWidth: '920px',
            marginTop: '16px',
          }}
        >
          <source srcSet="/landing/books-reader-demo.webp" type="image/webp" />
          <Stack
            component="img"
            src="/landing/books-reader-demo.svg"
            alt="FluencyPal Books reader showing word translation and highlights while reading The Great Gatsby"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              border: '1px solid rgba(44, 24, 16, 0.12)',
              boxShadow: '0 12px 40px rgba(44, 24, 16, 0.12)',
            }}
          />
        </Stack>
        <ReaderDemoModal />
      </Stack>
    </Stack>
  );
};
