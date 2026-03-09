'use client';

export function ThrowClientErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('Sentry test client error from /sentry-debug');
      }}
      style={{
        padding: '12px 16px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
      type="button"
    >
      Throw client side error
    </button>
  );
}
