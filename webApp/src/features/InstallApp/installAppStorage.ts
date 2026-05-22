const INSTALL_APP_INSTRUCTION_HIDDEN_KEY = 'fluencypal-install-app-instruction-hidden';

export const isInstallAppInstructionHiddenForever = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(INSTALL_APP_INSTRUCTION_HIDDEN_KEY) === 'true';
};

export const hideInstallAppInstructionForever = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(INSTALL_APP_INSTRUCTION_HIDDEN_KEY, 'true');
};
