"use client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { Context, JSX, ReactNode, createContext, useContext, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/init";
import * as Sentry from "@sentry/nextjs";
import { FirebaseError } from "firebase/app";

interface SignInResult {
  isDone: boolean;
  error: string;
}

export interface UserInfo {
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
  signInWithCustomToken: (backendToken: string) => Promise<SignInResult>;
  getToken: () => Promise<string>;

  signInWithEmail: (email: string) => Promise<SignInResult>;
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
  signInWithCustomToken: async () => {
    throw new Error("signInWithCustomToken not implemented");
  },
  getToken: async () => "",
  signInWithEmail: async () => {
    throw new Error("signInWithEmail not implemented");
  },
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

  const signInWithEmail = async (email: string): Promise<SignInResult> => {
    const url = window.location.href;
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: url,
      // This must be true.
      handleCodeInApp: true,
      //linkDomain: "custom-domain.com",
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      return { isDone: true, error: "" };
    } catch (error: any) {
      const errorCode = error.code;
      console.error("Email sign in error", error);
      if (errorCode === "auth/invalid-email") {
        return { isDone: false, error: "The email address is not valid." };
      } else if (
        errorCode === "auth/missing-android-pkg-name" ||
        errorCode === "auth/missing-continue-uri" ||
        errorCode === "auth/missing-ios-bundle-id" ||
        errorCode === "auth/invalid-continue-uri" ||
        errorCode === "auth/unauthorized-continue-uri"
      ) {
        return { isDone: false, error: "There is an issue with the sign-in link configuration." };
      } else {
        return { isDone: false, error: "Failed to send sign-in email. Please try again." };
      }
    }
  };

  const signInWithCustomToken = async (backendToken: string): Promise<SignInResult> => {
    try {
      if (!backendToken || typeof backendToken !== "string") {
        return { isDone: false, error: "No token provided" };
      }

      // If already signed in, Firebase will switch the user if token UID differs.
      const credentialUser = await firebaseSignInWithCustomToken(auth, backendToken);

      console.log("credentialUser", credentialUser);

      // Ensure an ID token is minted right away so getToken() works immediately.
      await credentialUser.user.getIdToken(true);

      return { isDone: true, error: "" };
    } catch (error: any) {
      let message = "Custom token sign-in failed. Please try again.";

      if (error?.code) {
        // Map common Firebase Auth errors to clearer messages
        switch (error.code as string) {
          case "auth/invalid-custom-token":
            message = "Invalid custom token.";
            break;
          case "auth/custom-token-mismatch":
            message = "The custom token is for a different Firebase project.";
            break;
          case "auth/network-request-failed":
            message = "Network error during sign-in.";
            break;
          case "auth/too-many-requests":
            message = "Too many requests. Please wait and try again.";
            break;
          case "auth/internal-error":
            message = "Internal auth error. Please retry.";
            break;
          default:
            message = error.message || message;
        }
      } else if (error?.message) {
        message = error.message;
      }

      console.error("signInWithCustomToken error:", error);
      return { isDone: false, error: message };
    }
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
    signInWithCustomToken,

    userInfo: userInfo || null,
    uid: userInfo?.uid || "",

    logout,
    getToken,
    signInWithEmail,
  };
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{props.children}</authContext.Provider>;
}

export const useAuth = (): AuthContext => useContext(authContext);
