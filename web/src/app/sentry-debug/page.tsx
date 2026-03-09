import { ThrowClientErrorButton } from './ThrowClientErrorButton';

async function throwServerSideError() {
  'use server';

  throw new Error('Sentry test server error from /sentry-debug');
}

export default function SentryDebugPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <form action={throwServerSideError}>
            <button
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              type="submit"
            >
              Throw server side error
            </button>
          </form>

          <ThrowClientErrorButton />
        </div>
      </body>
    </html>
  );
}
