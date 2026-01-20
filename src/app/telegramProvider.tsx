"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { isTMA } from "@telegram-apps/sdk-react";
import { initTg } from "@/features/Telegram/init";

export function useDidMount(): boolean {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return didMount;
}

function TelegramProviderInner({ children }: PropsWithChildren) {
  return (
    <TonConnectUIProvider manifestUrl="https://www.fluencypal.com/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

export function TelegramProvider(props: PropsWithChildren) {
  const didMount = useDidMount();
  const isTelegramApp = isTMA();
  isTelegramApp && initTg();

  return didMount && isTelegramApp ? (
    <TelegramProviderInner {...props} />
  ) : (
    <>{props.children}</>
  );
}
