"use client";
import { FirebaseError } from "@firebase/util";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Context, JSX, ReactNode, createContext, useContext, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/init";
import * as Sentry from "@sentry/react";

interface SignInResult {
  isDone: boolean;
  error: string;
}

export interface AuthContext {
  loading: boolean;
  uid: string;
  userInfo: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  isAuthorized: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<SignInResult | void>;
  getToken: () => Promise<string>;
}

export const authContext: Context<AuthContext> = createContext<AuthContext>({
  loading: true,
  uid: "",
  isAuthorized: false,
  userInfo: {
    email: "",
    photoURL: "",
    displayName: "",
  },
  logout: async () => void 0,
  signInWithGoogle: async () => ({ isDone: false, error: "" }),
  getToken: async () => "",
});

function useProvideAuth(): AuthContext {
  const [user, loading, errorAuth] = useAuthState(auth);

  const signInWithGoogle = async (): Promise<SignInResult | void> => {
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

  const isAuthorized = !!user?.uid && !errorAuth;

  const userInfo = useMemo(
    () => ({
      email: user?.email || "",
      photoURL: user?.photoURL || "",
      displayName: user?.displayName || "User",
      uid: user?.uid || "",
      phoneNumber: user?.phoneNumber || "",
      providerId: user?.providerId || "",
    }),
    [user]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    Sentry.setUser({
      id: user.uid,
      email: user?.email || "",
    });
  }, [user]);

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  const getToken = async () => {
    const token = await user?.getIdToken();
    return token || "";
  };

  return {
    signInWithGoogle,
    isAuthorized: isAuthorized,
    userInfo,
    uid: user?.uid || "",
    loading: loading,
    logout,
    getToken,
  };
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{props.children}</authContext.Provider>;
}

export const useAuth = (): AuthContext => useContext(authContext);
