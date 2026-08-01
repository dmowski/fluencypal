import { ThemeProvider } from '@mui/material/styles';
import { type ReactNode } from 'react';
import { globalInlineCss } from '@/app/globalInlineCss';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { darkTheme } from '@/features/uiKit/theme';

const GLOBAL_CSS_MARKER = 'data-browser-app-shell-global-css';

function ensureGlobalCss() {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector(`style[${GLOBAL_CSS_MARKER}]`)) return;

  const style = document.createElement('style');
  style.setAttribute(GLOBAL_CSS_MARKER, 'true');
  style.textContent = globalInlineCss;
  document.head.appendChild(style);
}

/** Mirrors webApp/src/app/layout.tsx styling for browser screenshot tests. */
export function BrowserAppShell({ children }: { children: ReactNode }) {
  ensureGlobalCss();

  return (
    <ThemeProvider theme={darkTheme}>
      <I18nWrapper>{children}</I18nWrapper>
    </ThemeProvider>
  );
}
