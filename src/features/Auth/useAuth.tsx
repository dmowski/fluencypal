"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Context, JSX, ReactNode, createContext, useContext, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/init";
import * as Sentry from "@sentry/nextjs";
import { FirebaseError } from "firebase/app";

interface SignInResult {
  isDone: boolean;
  error: string;
}

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContext {
  loading: boolean;
  uid: string;
  userInfo: UserInfo | null;
  isAuthorized: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<SignInResult>;
  signInWithTelegramMiniApp: () => Promise<SignInResult>;
  getToken: () => Promise<string>;
}

export const authContext: Context<AuthContext> = createContext<AuthContext>({
  loading: true,
  uid: "",
  isAuthorized: false,
  userInfo: null,
  logout: async () => void 0,
  signInWithGoogle: async () => {
    throw new Error("signInWithGoogle not implemented");
  },
  signInWithTelegramMiniApp: async () => {
    throw new Error("signInWithTelegramMiniApp not implemented");
  },
  getToken: async () => "",
});

function useProvideAuth(): AuthContext {
  const [userInfo, loading, errorAuth] = useAuthState(auth);

  const signInWithGoogle = async (): Promise<SignInResult> => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);

      return { isDone: true, error: "" };
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") {
        return { isDone: false, error: "" };
      }
      console.error("Google sign in error", error);
      return {
        isDone: false,
        error: `Google sign-in was unsuccessful. Please try again.`,
      };
    }
  };

  const signInWithTelegramMiniApp = async (): Promise<SignInResult> => {
    throw new Error("signInWithTelegramMiniApp not implemented");
  };

  const isAuthorized = !!userInfo?.uid && !errorAuth;

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    Sentry.setUser({
      id: userInfo.uid,
      email: userInfo?.email || "",
    });
  }, [userInfo]);

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  const getToken = async () => {
    const token = await userInfo?.getIdToken();
    return token || "";
  };

  return {
    isAuthorized,
    loading,

    signInWithGoogle,
    signInWithTelegramMiniApp,

    userInfo: userInfo || null,
    uid: userInfo?.uid || "",

    logout,
    getToken,
  };
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{props.children}</authContext.Provider>;
}

export const useAuth = (): AuthContext => useContext(authContext);
