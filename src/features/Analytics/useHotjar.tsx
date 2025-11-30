"use client";
import { createContext, useContext, useEffect, ReactNode, useState, useRef } from "react";
import { isDev } from "./isDev";
import { useAuth } from "../Auth/useAuth";

interface HotjarContextType {
  isInitialized: boolean;
}

const HotjarContext = createContext<HotjarContextType | undefined>(undefined);

export const HotjarProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const isInitialized = useRef(false);
  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (isDev() || !auth.uid || isInitialized.current || !isWindow) {
      return;
    }
    console.log("Initializing Hotjar for user:", auth.uid);
    isInitialized.current = true;

    (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: 6370217, hjsv: 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script");
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
    isInitialized.current = true;
  }, [auth.uid]);

  return (
    <HotjarContext.Provider value={{ isInitialized: isInitialized.current }}>
      {children}
    </HotjarContext.Provider>
  );
};

export const useHotjar = () => {
  const context = useContext(HotjarContext);
  if (context === undefined) {
    throw new Error("useHotjar must be used within a HotjarProvider");
  }
  return context;
};
