"use client";
import { NotificationsProvider } from "@toolpad/core/useNotifications";

export const NotificationsProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <NotificationsProvider>{children}</NotificationsProvider>;
};
