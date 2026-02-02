import { Stack, Typography } from '@mui/material';

import { maxContentWidth } from '../landingSettings';

import { Footer } from '../Footer';
import { ContactList } from './ContactList';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { ContactParagraph } from './ContactParagraph';

interface ContactsPageProps {
  lang: SupportedLanguage;
}
export const ContactsPage = ({ lang }: ContactsPageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{}}>
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
            paddingTop: '100px',
            paddingBottom: '40px',
            color: '#000',
            height: 'max-content',
            minHeight: '600px',
            maxHeight: '2000px',
            position: 'relative',
            '.contactIll': {
              width: '300px',
              height: 'auto',
              position: 'absolute',
              bottom: '-10px',
              right: '0px',
              '@media (max-width: 1000px)': {
                width: '200px',
              },
              '@media (max-width: 600px)': {
                width: '150px',
              },
              '@media (max-width: 400px)': {
                display: 'none',
              },
            },
          }}
        >
          <img src="/contactIll.jpg" alt="Contact" className="contactIll" />

          <Stack
            sx={{
              width: '100%',
              maxWidth: maxContentWidth,
              padding: '100px 20px 30px 20px',
              gap: '40px',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                alignItems: 'flex-start',
                gap: '20px',
              }}
            >
              <Typography
                align="left"
                variant="h2"
                component={'h1'}
                sx={{
                  fontWeight: 800,
                  fontSize: '6rem',
                  '@media (max-width: 1300px)': {
                    fontSize: '6rem',
                  },
                  '@media (max-width: 900px)': {
                    fontSize: '4rem',
                  },
                  '@media (max-width: 700px)': {
                    fontSize: '2rem',
                  },
                }}
              >
                FluencyPal
              </Typography>

              <Stack
                sx={{
                  gap: '20px',
                }}
              >
                <ContactParagraph>
                  {i18n._(
                    `Hi. My name is Alex. I built this site so I can practice English and other languages. You can too, by the way.`,
                  )}
                </ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `All the source code is open and publicly available. If you know how to code, you're welcome to improve it.`,
                  )}
                </ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `There are no subscriptions — and I hope there never will be. You buy access for a fixed period of time, and then you can extend it if you want.`,
                  )}
                </ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `There is a community here where you can talk about different topics and share what's on your mind.`,
                  )}
                </ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `There are no investors. In some ways, that's a disadvantage — with investor money, I could buy ads, for example. But I really like the feeling of freedom. I like that no one demands the service make money or "pay back" investments. So I hope there will never be investors. Freedom matters more.`,
                  )}
                </ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `I've been working on this project for about a year already, and I think I'll keep working on it for a long time. There's no risk of funding being cut or the project going bankrupt — because there is no funding. The project lives as long as there's money for servers. And if one day I'm poor enough that I can't afford them… well, I'll rent cheaper servers 🙂`,
                  )}
                </ContactParagraph>

                <ContactParagraph>{i18n._(`One more thing.`)}</ContactParagraph>

                <ContactParagraph>
                  {i18n._(
                    `The main idea is to build a service that lives for a long time and stays fun. A service where, on the About page, I can write to you like a friend — not like a "user."`,
                  )}
                </ContactParagraph>

                <Stack
                  sx={{
                    width: '100%',
                    gap: '10px',
                    padding: '70px 0 120px 0',
                  }}
                >
                  <Typography
                    align="left"
                    variant="h2"
                    component={'h2'}
                    sx={{
                      fontWeight: 800,
                      paddingTop: '40px',
                      fontSize: '4rem',
                      '@media (max-width: 1300px)': {
                        fontSize: '6rem',
                      },
                      '@media (max-width: 900px)': {
                        fontSize: '4rem',
                      },
                      '@media (max-width: 700px)': {
                        fontSize: '2rem',
                      },
                    }}
                  >
                    {i18n._(`Contacts`)}
                  </Typography>

                  <ContactParagraph>
                    {i18n._(`If you want to reach me, here are the ways:`)}
                  </ContactParagraph>
                  <Stack
                    gap={'30px'}
                    sx={{
                      width: '100%',
                      color: '#1f74be',

                      a: {
                        color: '#1f74be',
                      },
                    }}
                  >
                    <ContactList isShowGitHub />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
