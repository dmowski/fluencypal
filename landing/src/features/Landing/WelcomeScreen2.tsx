import { Stack, SxProps, Typography } from '@mui/material';
import { WelcomeScreenButton } from './FirstEnterButton';
import { PageLabel2 } from '../Case/Landing/components/Typography';
import { MoveRight } from 'lucide-react';
import { maxLandingWidth } from './landingSettings';
import Image from 'next/image';
import { StarFieldBackground } from './StarField/StarFieldBackground';

interface PreviewCard {
  imageUrl?: string;
  videoUrl?: string;
  alt: string;
}

interface WelcomeScreenProps {
  label: string;
  title: string;
  title2?: string;
  subTitle1: string;
  subTitle2?: string;
  buttonTitle: string;
  buttonHref: string;
  buttonSubtitle?: string;
  openMyPracticeLinkTitle: string;
  cards: PreviewCard[];
}

export const WelcomeScreen2: React.FC<WelcomeScreenProps> = ({
  label,
  title,
  title2,
  subTitle1,
  subTitle2,
  buttonTitle,
  buttonHref,
  cards,
  openMyPracticeLinkTitle,
  buttonSubtitle,
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
        minHeight: '700px',
        boxSizing: 'border-box',
        padding: '30px 0 20px 0',
        backgroundColor: '#10131a',
        '@media (max-width: 1100px)': {
          height: 'auto',
          paddingBottom: '10px',
        },
        '@media (max-width: 600px)': {
          paddingTop: '0',
        },
      }}
    >
      <Stack
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: '#10131a',
          backgroundImage: `
            radial-gradient(ellipse at 72% 46%, rgba(80, 120, 180, 0.16), transparent 42%),
            radial-gradient(ellipse at 28% 18%, rgba(50, 70, 120, 0.1), transparent 38%)
          `,
        }}
      >
        <StarFieldBackground />
      </Stack>
      <Stack
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `
            linear-gradient(90deg, rgba(16, 19, 26, 0.72) 0%, rgba(16, 19, 26, 0.38) 34%, rgba(16, 19, 26, 0.08) 58%, transparent 72%),
            radial-gradient(ellipse at 18% 36%, rgba(16, 19, 26, 0.5) 0%, transparent 48%),
            linear-gradient(180deg, rgba(16, 19, 26, 0.22) 0%, rgba(16, 19, 26, 0) 18%, rgba(17, 19, 26, 0.14) 78%, #11131a 100%)
          `,
          '@media (max-width: 1100px)': {
            background: `
              linear-gradient(180deg, rgba(16, 19, 26, 0.7) 0%, rgba(16, 19, 26, 0.32) 30%, rgba(16, 19, 26, 0.06) 52%, transparent 64%),
              linear-gradient(180deg, rgba(16, 19, 26, 0.18) 0%, rgba(16, 19, 26, 0) 16%, rgba(17, 19, 26, 0.16) 80%, #11131a 100%)
            `,
          },
        }}
      />

      <Stack
        sx={{
          maxWidth: maxLandingWidth,
          padding: '10px 10px 0px 10px',
          height: '100%',
          width: '100%',

          boxSizing: 'border-box',
          alignItems: 'center',
          justifyContent: 'center',

          gap: '100px',
          position: 'relative',
          zIndex: 2,
          '@media (max-width: 1100px)': {
            paddingTop: '100px',
            justifyContent: 'flex-start',
          },
          '@media (max-width: 600px)': {
            gap: '20px',
            padding: '96px 0px 0 0px',
          },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            gap: '10px',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            '@media (max-width: 1100px)': {
              flexDirection: 'column',
              gap: '150px',
              paddingBottom: '100px',
            },
          }}
        >
          <Stack
            sx={{
              gap: '20px',

              alignItems: 'flex-start',

              '@media (max-width: 1100px)': {
                alignItems: 'center',
              },
            }}
          >
            <PageLabel2>{label}</PageLabel2>
            <Typography
              variant="h1"
              component={'h1'}
              sx={{
                fontWeight: 900,
                fontSize: title2 ? '64px' : '96px',
                lineHeight: title2 ? '72px' : '100px',
                maxWidth: title2 ? '100%' : '800px',
                '& .hero-title-line': title2
                  ? {
                      display: 'block',
                    }
                  : undefined,
                '@media (min-width: 1101px)': title2
                  ? {
                      fontSize: '48px',
                      lineHeight: '56px',
                      '& .hero-title-line': {
                        whiteSpace: 'nowrap',
                      },
                    }
                  : {},
                '@media (max-width: 1100px)': {
                  textAlign: 'center',
                  maxWidth: '100%',
                },
                '@media (max-width: 800px)': {
                  fontSize: title2 ? '36px' : '64px',
                  lineHeight: title2 ? '42px' : '70px',
                  padding: '0 20px',
                },
              }}
            >
              <span className="hero-title-line" style={{ display: 'block' }}>
                {title}
              </span>
              {title2 ? (
                <span className="hero-title-line" style={{ display: 'block' }}>
                  {title2}
                </span>
              ) : null}
            </Typography>
            <Stack
              sx={{
                gap: '5px',
              }}
            >
              <Typography
                sx={{
                  maxWidth: '560px',
                  padding: '10px 10px 0 0',
                  fontSize: '1.1rem',
                  textShadow: '0 0 5px rgba(0, 0, 0, 0.71)',
                  '@media (max-width: 600px)': {
                    fontSize: '0.9rem',
                  },
                  '@media (max-width: 1100px)': {
                    textAlign: 'center',
                    padding: '0px 10px 0 10px',
                  },
                  b: {
                    fontWeight: 600,
                  },
                }}
              >
                {subTitle2 ? (
                  <>
                    <b>{subTitle1}</b> {subTitle2}
                  </>
                ) : (
                  subTitle1
                )}
              </Typography>
            </Stack>

            <Stack
              sx={{
                paddingTop: '40px',
                gap: '10px',
                alignItems: 'flex-start',
                '@media (max-width: 1100px)': {
                  alignItems: 'center',
                },
              }}
            >
              <WelcomeScreenButton
                getStartedTitle={buttonTitle}
                practiceLink={buttonHref}
                openMyPracticeLinkTitle={openMyPracticeLinkTitle}
                endIcon={<MoveRight size={'27px'} />}
              />
              {buttonSubtitle && <Typography variant="body2">{buttonSubtitle}</Typography>}
            </Stack>
          </Stack>

          <Stack
            sx={{
              flexDirection: 'row',
            }}
          >
            {cards.map((card, index) => {
              const isCenter = index === 1;
              const borderRadius = '19px';
              const borderRadiusMobile = '12px';

              const contentStyle: SxProps = {
                height: '580px',
                borderRadius: borderRadius,
                position: 'relative',
                aspectRatio: '411 / 896',
                zIndex: 2,
                boxShadow: isCenter ? '0 3px 70px rgba(0, 0, 0, 1)' : '0 4px 85px rgba(0, 0, 0, 1)',

                '@media (max-width: 700px)': {
                  height: '400px',
                  borderRadius: borderRadiusMobile,
                },
              };

              return (
                <Stack
                  key={index}
                  sx={{
                    position: 'relative',
                    zIndex: isCenter ? 1 : 0,
                    transform: `scale(${isCenter ? 1.05 : 0.9})`,
                    marginLeft: index > 0 ? '-100px' : '0',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  {card.imageUrl && !card.videoUrl && (
                    <Stack sx={{ ...contentStyle, position: 'relative' }}>
                      <Stack
                        sx={{
                          ...contentStyle,
                          borderRadius: borderRadius,
                          '@media (max-width: 700px)': {
                            display: 'none',
                          },
                        }}
                      >
                        <Image
                          src={card.imageUrl}
                          alt={card.alt}
                          width={240}
                          height={522}
                          fetchPriority="high"
                          loading="eager"
                          style={{
                            borderRadius: 'inherit',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                        />
                      </Stack>

                      <Stack
                        sx={{
                          display: 'none',
                          borderRadius: borderRadius,
                          '@media (max-width: 700px)': {
                            display: 'flex',
                          },
                        }}
                      >
                        <Image
                          src={card.imageUrl}
                          alt={card.alt}
                          width={165}
                          height={360}
                          fetchPriority="high"
                          loading="eager"
                          style={{
                            borderRadius: 'inherit',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                        />
                      </Stack>
                    </Stack>
                  )}
                  {card.videoUrl && (
                    <>
                      {card.imageUrl && (
                        <Stack
                          sx={{
                            ...contentStyle,
                            aspectRatio: '411 / 896',
                            boxShadow: 'none',
                            width: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            '@media (max-width: 700px)': {
                              display: 'none',
                            },
                          }}
                        >
                          <Image
                            src={card.imageUrl}
                            alt={card.alt}
                            width={240}
                            height={522}
                            quality={40}
                            fetchPriority="high"
                            loading="eager"
                            style={{
                              borderRadius: 'inherit',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                            }}
                          />
                        </Stack>
                      )}
                      <Stack
                        component={'video'}
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                        muted
                        sx={{
                          ...contentStyle,
                          aspectRatio: '411 / 896',
                        }}
                        src={card.videoUrl}
                      />
                    </>
                  )}
                  <Stack
                    sx={{
                      background: 'rgba(10, 18, 30, 1)',
                      position: 'absolute',
                      '--padding': '0px',
                      width: 'calc(100% + var(--padding) * 2)',
                      height: 'calc(100% + var(--padding) * 2)',
                      top: 'calc(0px - var(--padding))',
                      left: 'calc(0px - var(--padding))',
                      boxShadow: '0 0 0 0px rgba(0, 0, 0, 1), 0 0 0 1px rgba(255, 255, 255, 1)',
                      borderRadius: borderRadius,
                      '@media (max-width: 700px)': {
                        borderRadius: borderRadiusMobile,
                      },
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
