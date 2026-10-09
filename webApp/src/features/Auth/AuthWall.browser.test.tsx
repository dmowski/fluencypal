import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { AuthWall } from './AuthWall';

const { signInWithGoogle, signInWithEmail } = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(async () => ({ isDone: false, isRedirecting: false, error: '' })),
  signInWithEmail: vi.fn(async () => ({ isDone: true, error: '' })),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: '',
    loading: false,
    isIdentified: false,
    userInfo: null,
    signInWithGoogle,
    signInWithEmail,
  }),
}));

beforeEach(() => {
  window.localStorage.clear();
  signInWithGoogle.mockClear();
  signInWithEmail.mockClear();
  signInWithEmail.mockImplementation(async () => ({ isDone: true, error: '' }));
  signInWithGoogle.mockImplementation(async () => ({
    isDone: false,
    isRedirecting: false,
    error: '',
  }));
});

const AuthShotFrame = ({
  children,
  width = 600,
}: {
  children: React.ReactNode;
  width?: number;
}) => (
  <BrowserAppShell>
    <div
      data-testid="shot"
      style={{
        width,
        background: 'rgba(10, 18, 30, 1)',
      }}
    >
      {children}
    </div>
  </BrowserAppShell>
);

const renderAuth = (width?: number) =>
  render(
    <AuthShotFrame width={width}>
      <AuthWall startOnAuth singInSubTitle="So you can save your progress">
        <div>signed in</div>
      </AuthWall>
    </AuthShotFrame>,
  );

const expectAuthScreenshot = async (name: string) => {
  const shot = page.getByTestId('shot');
  await expect.element(shot).toBeVisible();
  await expect.element(shot).toMatchScreenshot(name);
};

test('auth screen shows email, send link, and Google', async () => {
  await renderAuth();

  await expect
    .element(page.getByRole('heading', { name: "Let's create an account" }))
    .toBeVisible();
  await expect.element(page.getByText('So you can save your progress')).toBeVisible();
  await expect.element(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect.element(page.getByText("We'll email you a sign-in link.")).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Send link' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  await expect.element(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  await expect.element(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
  const privacy = document.querySelector('a[href*="privacy"]') as HTMLAnchorElement;
  const terms = document.querySelector('a[href*="terms"]') as HTMLAnchorElement;
  expect(privacy.getAttribute('href')).toBe('https://www.fluencypal.com/privacy');
  expect(terms.getAttribute('href')).toBe('https://www.fluencypal.com/terms');
  await expectAuthScreenshot('auth-sign-in');

  await userEvent.click(page.getByRole('button', { name: 'Sign in with Google' }));
  expect(signInWithGoogle).toHaveBeenCalledOnce();
});

test('auth screen explains an invalid email', async () => {
  await renderAuth();

  await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'not-an-email');
  await userEvent.click(page.getByRole('button', { name: 'Send link' }));

  await expect.element(page.getByText('Please enter a valid email address')).toBeVisible();
  expect(signInWithEmail).not.toHaveBeenCalled();
  await expectAuthScreenshot('auth-sign-in-invalid-email');
});

test('auth screen confirms when the sign-in link is sent', async () => {
  await renderAuth();

  await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'Ada@Example.com');
  await userEvent.click(page.getByRole('button', { name: 'Send link' }));

  await expect.element(page.getByText('Check your email')).toBeVisible();
  await expect.element(page.getByText('ada@example.com')).toBeVisible();
  expect(signInWithEmail).toHaveBeenCalledWith('ada@example.com');
  await expectAuthScreenshot('auth-sign-in-link-sent');

  await userEvent.click(page.getByRole('button', { name: 'Send email again' }));
  await expect.element(page.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@example.com');
});

test('auth screen stays readable on a narrow phone', async () => {
  await renderAuth(360);
  await expect.element(page.getByRole('button', { name: 'Send link' })).toBeVisible();
  await expectAuthScreenshot('auth-sign-in-narrow');
});

test('auth screen marks the last used method', async () => {
  window.localStorage.setItem('authWall:lastMethod', 'google');
  await renderAuth();

  await expect
    .element(page.getByTestId('auth-wall-last-method-badge'))
    .toHaveTextContent('Last used');
  await expectAuthScreenshot('auth-sign-in-last-used-google');
});
