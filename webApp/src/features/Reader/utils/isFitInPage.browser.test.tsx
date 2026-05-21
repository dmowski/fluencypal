import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Stack, ThemeProvider } from '@mui/material';
import { ReaderParagraph } from '../components/Paragraph/ReaderParagraph';
import { lightTheme } from '@/features/uiKit/theme';
import { ReaderSettings } from '../model/types';
import { measurePageColumnHeight } from './isFitInPage';

const settings: ReaderSettings = {
  language: 'en-US',
  selectedVoiceURI: null,
  translateToLanguage: null,
  fontSize: 20,
  lineHeight: 1.5,
  justifyText: false,
  translateOnHover: false,
  voiceOverSelectedText: false,
  contentWidth: 420,
  contentHeight: 260,
  paragraphGap: 16,
  columns: 1,
  columnGap: 40,
};

const LI_WORDS = ['-', '**Finally,', 'experiment.**', 'Tell', 'a', 'joke.'];
const LIST_PARAGRAPH_TEXT = LI_WORDS.join(' ');

const readRenderedListBlockHeight = (root: ParentNode): number => {
  const list = root.querySelector('ul, ol');
  if (!list) {
    return 0;
  }

  const style = window.getComputedStyle(list);
  const marginTop = Number.parseFloat(style.marginTop) || 0;
  const marginBottom = Number.parseFloat(style.marginBottom) || 0;

  return list.getBoundingClientRect().height + marginTop + marginBottom;
};

const PageColumnFixture = ({ words }: { words: string[] }) => (
  <ThemeProvider theme={lightTheme}>
    <Stack
      data-testid="reader-content-measure"
      sx={{
        width: `${settings.contentWidth}px`,
        height: `${settings.contentHeight}px`,
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Stack
        data-testid="reader-page-column-measure"
        sx={{
          width: `${settings.contentWidth}px`,
          gap: `${settings.paragraphGap}px`,
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <ReaderParagraph
            paragraphIndex={0}
            paragraphStartCharOffset={0}
            words={words}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            justifyText={settings.justifyText}
            playText={() => {}}
            onSelection={() => {}}
            highlights={[]}
          />
        </Stack>
      </Stack>
    </Stack>
  </ThemeProvider>
);

test('imperative list measurement matches ReaderParagraph column height', async () => {
  const rendered = await render(<PageColumnFixture words={LI_WORDS} />);
  const renderedHeight = readRenderedListBlockHeight(rendered.container);

  const measuredHeight = measurePageColumnHeight({
    paragraphs: [{ text: LIST_PARAGRAPH_TEXT, sourceStartCharOffset: 0 }],
    settings,
  });

  expect(renderedHeight).toBeGreaterThan(0);
  expect(measuredHeight).toBeGreaterThan(0);
  expect(Math.abs(measuredHeight - renderedHeight)).toBeLessThanOrEqual(3);
});

test('imperative list measurement is taller than plain paragraph for same words', () => {
  const plainText = 'Finally, experiment. Tell a joke.';

  const listHeight = measurePageColumnHeight({
    paragraphs: [{ text: `- ${plainText}`, sourceStartCharOffset: 0 }],
    settings,
  });
  const plainHeight = measurePageColumnHeight({
    paragraphs: [{ text: plainText, sourceStartCharOffset: 0 }],
    settings,
  });

  expect(listHeight).toBeGreaterThan(plainHeight);
});
