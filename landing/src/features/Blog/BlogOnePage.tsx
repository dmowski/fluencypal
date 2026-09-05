import { Button, Stack, Typography } from '@mui/material';

import { Footer } from '../Landing/Footer';

import {
  buttonStyle,
  maxLandingWidth,
  subTitleFontStyle,
  titleFontStyle,
} from '../Landing/landingSettings';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { BlogAuthors } from './BlogAuthors';
import { getBlogs } from './blogData';
import { getRolePlayScenarios } from '../RolePlay/rolePlayData';
import { RolePlayCard } from '../Landing/RolePlay/RolePlayCard';
import { HeaderStatic } from '../Header/HeaderStatic';
import Image from 'next/image';
import dayjs from 'dayjs';

const INTERVIEW_PHRASE_POST_IDS = new Set([
  'phrases-for-an-interview-in-english',
  '15-business-english-phrases-interview',
]);

const INTERVIEW_PRACTICE_HREF = 'practice?rolePlayId=job-interview';
const INTERVIEW_BLOG_CTA_ID = 'blog-interview-cta';

interface BlogOnePageProps {
  id?: string;
  lang: SupportedLanguage;
}

export const BlogOnePage = async ({ id, lang }: BlogOnePageProps) => {
  const i18n = getI18nInstance(lang);
  const { blogs } = await getBlogs(lang);
  const item = blogs.find((scenario) => scenario.id === id);
  if (!item) {
    return null;
  }

  const { rolePlayScenarios } = getRolePlayScenarios(lang);

  const relatedCards = rolePlayScenarios.filter((scenario) =>
    item.relatedRolePlays.includes(scenario.id),
  );

  return (
    <>
      <HeaderStatic lang={lang} />
      <div
        style={{
          width: '100%',
          margin: 0,
        }}
      >
        <Stack
          component={'main'}
          sx={{
            alignItems: 'center',
            width: '100%',
            backgroundColor: `#fff`,
          }}
        >
          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Stack
              sx={{
                maxWidth: maxLandingWidth,
                width: '100%',
                boxSizing: 'border-box',
                alignItems: 'center',
                padding: '110px 10px 20px 10px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <Stack
                gap={'0px'}
                sx={{
                  width: 'max-content',
                  maxWidth: '1000px',
                }}
              >
                <Typography
                  component={'h1'}
                  sx={{
                    ...titleFontStyle,
                    fontSize: '2rem',
                    color: '#000',
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: '810px',

                    ...subTitleFontStyle,
                    color: '#666',
                    fontSize: '1.1rem',
                  }}
                >
                  {item.subTitle}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: 'max-content',
                  flexDirection: 'row',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  '@media (max-width: 900px)': {
                    justifyContent: 'flex-start',
                  },
                }}
              >
                <Button
                  variant="outlined"
                  href={`${getUrlStart(lang)}blog`}
                  sx={{
                    ...buttonStyle,
                    borderRadius: '4px',
                    height: '3rem',

                    color: 'rgb(43 35 88)',
                    borderColor: 'rgb(43 35 88)',
                    borderWidth: '1px',

                    backgroundColor: '#fff',
                  }}
                >
                  {i18n._(`View all posts`)}
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            sx={{
              width: '100%',
              padding: '0px 0 90px 0',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              backgroundColor: `#fff`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Stack
              sx={{
                color: '#222',
                maxWidth: maxLandingWidth,
                width: '100%',
                padding: '10px',
                gap: '60px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: '3fr 1.3fr',
                '@media (max-width: 900px)': {
                  gridTemplateColumns: '1fr',
                },
              }}
            >
              <Stack
                sx={{
                  gap: '40px',
                }}
              >
                <Stack
                  sx={{
                    maxWidth: '800px',
                    boxSizing: 'border-box',
                    width: '100%',
                    color: `#222`,
                    padding: '0px 0px',
                    gap: '20px',
                    alignItems: 'flex-start',
                    h2: {
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      paddingBottom: '10px',
                      paddingTop: '30px',
                    },
                  }}
                >
                  <Stack
                    sx={{
                      maxHeight: '400px',
                      height: '400px',
                      width: '100%',
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '20px',
                      position: 'relative',
                      boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.15)',
                      '@media (max-width: 800px)': {
                        borderRadius: 0,
                        boxShadow: 'none',
                        height: 'max-content',
                        minHeight: '400px',
                      },

                      '@media (max-width: 500px)': {
                        minHeight: '300px',
                      },
                      '@media (max-width: 400px)': {
                        minHeight: '250px',
                      },
                    }}
                  >
                    <Image
                      src={item.imagePreviewUrl}
                      className="blog-image"
                      alt={`Illustration for ${item.title}`}
                      sizes="600px"
                      fetchPriority="high"
                      loading="eager"
                      fill
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </Stack>

                  <Markdown variant="blog">{`${item.content}`}</Markdown>
                  {item.contendElement && (
                    <Stack
                      sx={{
                        width: '100%',
                        maxWidth: '800px',
                      }}
                    >
                      {item.contendElement}
                    </Stack>
                  )}
                  {INTERVIEW_PHRASE_POST_IDS.has(item.id) && (
                    <Stack
                      sx={{
                        width: '100%',
                        maxWidth: '800px',
                        gap: '12px',
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(43, 35, 88, 0.06)',
                        border: '1px solid rgba(43, 35, 88, 0.15)',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#222',
                          fontWeight: 600,
                          fontSize: '1.15rem',
                        }}
                      >
                        {i18n._('Practice these phrases out loud')}
                      </Typography>
                      <Typography sx={{ color: '#444' }}>
                        {i18n._(
                          'Try a mock interview with AI using the phrases from this article.',
                        )}
                      </Typography>
                      <Button
                        href={`${getAppUrlStart(lang)}${INTERVIEW_PRACTICE_HREF}`}
                        id={INTERVIEW_BLOG_CTA_ID}
                        data-analytics={INTERVIEW_BLOG_CTA_ID}
                        variant="contained"
                        sx={{
                          ...buttonStyle,
                          alignSelf: 'flex-start',
                          height: '3rem',
                        }}
                      >
                        {i18n._('Start the interview')}
                      </Button>
                    </Stack>
                  )}
                </Stack>
                <Stack sx={{ gap: '10px' }}>
                  <BlogAuthors authors={item.authors} lang={lang} />
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      color: '#666',
                    }}
                  >
                    <Typography>
                      {i18n._('Published on')}: {dayjs(item.publishedAtIso).format('MMMM D, YYYY')}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            {relatedCards.length > 0 && (
              <Stack
                sx={{
                  color: '#222',
                  maxWidth: maxLandingWidth,
                  width: '100%',
                  padding: '10px',
                  gap: '20px',
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant="h6"
                  component={'h2'}
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {i18n._(`Practice speaking with AI`)}
                </Typography>

                <Stack
                  sx={{
                    display: 'grid',
                    width: '100%',
                    gap: '20px',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    justifyContent: 'space-between',
                    '@media (max-width: 1224px)': {
                      gridTemplateColumns: '1fr 1fr',
                    },

                    '@media (max-width: 724px)': {
                      gridTemplateColumns: '1fr',
                    },
                  }}
                >
                  {relatedCards.map((scenario, index) => {
                    return (
                      <RolePlayCard key={index} scenario={scenario} lang={lang} height="400px" />
                    );
                  })}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </div>
      <Footer lang={lang} />
    </>
  );
};
