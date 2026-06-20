import { Link, Stack, Typography } from '@mui/material';

export const WelcomeScreenMinimal = () => {
  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        backgroundColor: '#111',
        zIndex: 99000,
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url(/landing/flowers.png) no-repeat center center',
          backgroundSize: 'cover',
          opacity: 0.5,
        }}
      />
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          justifyContent: 'space-between',
          height: '100%',
          margin: '40px',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row',
            boxSizing: 'border-box',
            position: 'relative',

            '.header-text': {
              fontSize: '18px',
              fontWeight: 500,
            },
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              gap: '30px',
            }}
          >
            <Link href="/" color="inherit" underline="none" className="header-text">
              How it works
            </Link>
            <Link href="/" color="inherit" underline="none" className="header-text">
              Contact us
            </Link>
            <Link href="/" color="inherit" underline="none" className="header-text">
              Price
            </Link>
            <Link href="/" color="inherit" underline="none" className="header-text">
              FAQ
            </Link>
          </Stack>
          <Typography
            className="header-text"
            component="span"
            color="#fff"
            sx={{
              width: 'max-content',
            }}
          >
            Fluency Pal
          </Typography>
        </Stack>

        <Stack sx={{}}>
          <Typography
            sx={{
              textTransform: 'uppercase',
              fontSize: '222px',
              fontWeight: 900,
              lineHeight: 1,
              marginLeft: '-10px',
            }}
          >
            Speaking Practice
          </Typography>
          <Typography
            sx={{
              fontSize: '24px',
              fontWeight: 500,
            }}
          >
            Improve yourself with AI
          </Typography>
        </Stack>

        <Stack sx={{}}>
          <Link
            href="/app"
            color="inherit"
            underline="none"
            sx={{
              fontSize: '122px',
              fontWeight: 200,
            }}
          >
            Start →
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};
