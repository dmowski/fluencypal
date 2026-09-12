export const logoutThenGoToLanding = async (
  logout: () => Promise<void>,
  landingUrl: string,
  assignLocation: (url: string) => void = (url) => {
    window.location.assign(url);
  },
): Promise<void> => {
  await logout();
  assignLocation(landingUrl);
};
