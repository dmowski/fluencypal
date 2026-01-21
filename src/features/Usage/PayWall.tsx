import { Button, Stack, Typography } from '@mui/material';
import { useUsage } from './useUsage';
import { Swords, Wallet } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '../Lang/lang';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useRouter } from 'next/navigation';
import { usePayWall } from '../PayWall/usePayWall';
import { useAppNavigation } from '../Navigation/useAppNavigation';

interface NoBalanceBlockProps {
  lang: SupportedLanguage;
}

export const PayWall = ({ lang }: NoBalanceBlockProps) => {
  const usage = useUsage();
  const { i18n } = useLingui();
  const route = useRouter();
  const payWall = usePayWall();
  const appNavigation = useAppNavigation();

  const openGamePage = () => {
    const urlForGame = appNavigation.pageUrl('community');
    route.push(urlForGame);
  };

  return (
    <CustomModal isOpen={true} onClose={() => payWall.temporaryClosePayWall()}>
      <Stack
        sx={{
          width: '100%',

          padding: '30px 0px',
          boxSizing: 'border-box',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
        }}
      >
        <Stack
          sx={{
            padding: '20px 20px 20px 30px',
            gap: '60px',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 1,
            '@media (max-width: 700px)': {
              padding: '20px 15px',
            },
          }}
        >
          <Stack sx={{ width: '100%' }}>
            <Typography
              variant="h2"
              className="decor-text"
              align="center"
              sx={{
                '@media (max-width: 700px)': {
                  fontSize: '1.9rem',
                },
              }}
            >
              {i18n._('Subscription needed')}
            </Typography>
            <Typography
              align="center"
              sx={{
                opacity: 0.9,
                '@media (max-width: 700px)': {
                  fontSize: '0.9rem',
                  opacity: 0.8,
                },
              }}
            >
              {i18n._("You've made amazing progress. Let’s keep going.")}
            </Typography>
          </Stack>

          <Stack sx={{ width: '100%', gap: '5px', alignItems: 'center' }}>
            <Stack
              sx={{
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',

                '@media (max-width: 700px)': {
                  flexDirection: 'column',
                  alignItems: 'center',
                },
              }}
            >
              <Button
                variant="contained"
                size="large"
                color="info"
                sx={{
                  padding: '15px 30px',
                }}
                onClick={() => usage.togglePaymentModal(true)}
                startIcon={<Wallet />}
              >
                {i18n._('Buy a subscription')}
              </Button>
              <Typography>or</Typography>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  padding: '15px 30px',
                }}
                onClick={() => openGamePage()}
                startIcon={<Swords />}
              >
                {i18n._('Play the Game')}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            position: 'fixed',
            width: '100dvw',
            height: '100dvh',
            top: 0,
            left: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Stack
            sx={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#000022',
              height: '300px',
              width: '300px',
              borderRadius: '150px',
              filter: 'blur(200px)',
              zIndex: 0,
              opacity: 0.9,
              '@media (max-width: 700px)': {
                display: 'none',
              },
            }}
          ></Stack>

          <Stack
            sx={{
              position: 'absolute',
              top: '300px',
              right: '0',
              backgroundColor: '#ff0000',
              height: '300px',
              width: '300px',
              borderRadius: '150px',
              filter: 'blur(200px)',
              zIndex: 0,
              opacity: 0.4,
              '@media (max-width: 700px)': {
                filter: 'blur(100px)',
                opacity: 0.2,
                left: '150px',
              },
            }}
          ></Stack>

          <Stack
            sx={{
              position: 'absolute',
              top: '0px',
              left: '300px',
              backgroundColor: '#00FFFF',
              height: '200px',
              width: '300px',
              borderRadius: '150px',
              filter: 'blur(200px)',
              zIndex: 0,
              opacity: 0.61,
              '@media (max-width: 700px)': {
                filter: 'blur(100px)',
                opacity: 0.15,
              },
            }}
          ></Stack>

          <Stack
            sx={{
              position: 'absolute',
              top: '40vh',
              left: '0',
              backgroundColor: '#5533ff',
              height: '300px',
              width: '300px',
              borderRadius: '150px',
              filter: 'blur(300px)',
              zIndex: 0,
              opacity: 0.4,
              '@media (max-width: 700px)': {
                filter: 'blur(100px)',
                opacity: 0.3,
              },
            }}
          ></Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
