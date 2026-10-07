import { ImageResponse } from 'next/og';
import { getLearnLandingCopy } from './copy';
import { loadOgFonts, ogFontFamily } from './ogFonts';
import { LearnPageLocale, LearnTarget, learnTargetAccent, learnTargetFlagIso } from './targets';

const flagCache = new Map<string, Promise<string | null>>();

const flagDataUrl = (iso: string): Promise<string | null> => {
  const cached = flagCache.get(iso);
  if (cached) return cached;

  const pending = fetch(`https://flagcdn.com/w640/${iso}.png`)
    .then(async (response) => {
      if (!response.ok) return null;
      const bytes = Buffer.from(await response.arrayBuffer());
      return `data:image/png;base64,${bytes.toString('base64')}`;
    })
    .catch(() => null);

  flagCache.set(iso, pending);
  return pending;
};

const headlineSize = (text: string, ui: LearnPageLocale): number => {
  if (ui === 'zh' || ui === 'ja' || ui === 'ko') return text.length > 8 ? 62 : 76;
  if (ui === 'th') return text.length > 16 ? 60 : 72;
  if (ui === 'ar') return text.length > 18 ? 64 : 76;
  if (text.length > 26) return 54;
  if (text.length > 20) return 64;
  if (text.length > 15) return 74;
  return 86;
};

export const learnOgImageResponse = async (ui: LearnPageLocale, target: LearnTarget) => {
  const copy = getLearnLandingCopy(ui, target);
  const accent = learnTargetAccent[target];
  const [fonts, flag] = await Promise.all([
    loadOgFonts(ui),
    flagDataUrl(learnTargetFlagIso[target]),
  ]);
  const direction = ui === 'ar' ? 'rtl' : 'ltr';
  const size = headlineSize(copy.headline, ui);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#070b14',
        color: '#ffffff',
        fontFamily: ogFontFamily(ui),
        direction,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '22px',
          height: '100%',
          background: accent,
        }}
      />
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 40px 48px 56px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: 3,
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          FLUENCYPAL
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: ui === 'ar' ? 0 : -1.5,
            }}
          >
            {copy.headline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 16,
              fontSize: 40,
              fontWeight: 700,
              color: '#ffffff',
              background: accent,
              padding: '8px 18px',
              borderRadius: 14,
              alignSelf: 'flex-start',
            }}
          >
            {copy.imageLine2}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#cbd5e1',
          }}
        >
          {copy.label}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          width: '430px',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(160deg, ${accent} 0%, #070b14 78%)`,
        }}
      >
        {flag ? (
          <img
            src={flag}
            width={300}
            height={200}
            style={{
              borderRadius: 28,
              border: '10px solid #ffffff',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              width: 300,
              height: 200,
              borderRadius: 28,
              background: accent,
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 700,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {target.toUpperCase()}
          </div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
    },
  );
};
