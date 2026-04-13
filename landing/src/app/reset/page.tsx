'use client';

import { auth, firestore } from '@/features/Firebase/init';
import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

type Step = { label: string; status: 'pending' | 'ok' | 'error'; error?: string };

export default function ResetPage() {
  const [steps, setSteps] = useState<Step[]>([
    { label: 'Sign out', status: 'pending' },
    { label: 'Clear localStorage', status: 'pending' },
    { label: 'Terminate Firestore & clear IndexedDB', status: 'pending' },
    { label: 'Clear Cache Storage', status: 'pending' },
  ]);
  const [done, setDone] = useState(false);

  const setStep = (index: number, status: Step['status'], error?: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status, error } : s)));
  };

  useEffect(() => {
    (async () => {
      // 1. Sign out
      try {
        await signOut(auth);
        setStep(0, 'ok');
      } catch (e: any) {
        setStep(0, 'error', e?.message);
      }

      // 2. Clear localStorage
      try {
        localStorage.clear();
        setStep(1, 'ok');
      } catch (e: any) {
        setStep(1, 'error', e?.message);
      }

      // 3. Terminate Firestore then clear IndexedDB persistence
      try {
        await terminate(firestore);
        await clearIndexedDbPersistence(firestore);
        setStep(2, 'ok');
      } catch (e: any) {
        setStep(2, 'error', e?.message);
      }

      // 4. Clear Cache Storage (service worker caches)
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        setStep(3, 'ok');
      } catch (e: any) {
        setStep(3, 'error', e?.message);
      }

      setDone(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <div style={{ fontFamily: 'monospace', padding: '2rem' }}>
          <h2>Reset</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {steps.map((s) => (
              <li key={s.label} style={{ margin: '0.5rem 0' }}>
                <span style={{ marginRight: '0.75rem' }}>
                  {s.status === 'pending' ? '⏳' : s.status === 'ok' ? '✅' : '❌'}
                </span>
                {s.label}
                {s.error && (
                  <span style={{ color: 'red', marginLeft: '0.5rem', fontSize: '0.85em' }}>
                    ({s.error})
                  </span>
                )}
              </li>
            ))}
          </ul>
          {done && (
            <p style={{ marginTop: '1.5rem' }}>
              Done.{' '}
              <a href="/practice" style={{ color: '#3aa3ff' }}>
                Go to home
              </a>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
