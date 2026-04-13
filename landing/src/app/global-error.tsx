'use client';
import { CONTACTS } from '@/features/Landing/Contact/data';
import NextError from 'next/error';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
            }}
          >
            <span
              style={{
                opacity: 0.6,
              }}
            >
              Error:
            </span>
            <h1
              style={{
                padding: '0 0 10px 0',
                margin: 0,
              }}
            >
              Something went wrong
            </h1>
            <p>Try to clear cache and login again. If error persists, please contact me</p>
            <h3
              style={{
                padding: '0 0 20px 0',
              }}
            >
              {CONTACTS.email}
            </h3>

            <a
              style={{
                fontSize: '1.25rem',
                padding: '1rem 2rem',
                backgroundColor: '#0070f3',
                color: 'white',
                borderRadius: '5px',
                textDecoration: 'none',
              }}
              href="/reset"
            >
              Clear CACHE AND RELOAD
            </a>
            <span>{error?.digest}</span>
          </div>
        </div>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
