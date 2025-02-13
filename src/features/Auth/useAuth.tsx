import { FirebaseError } from "@firebase/util";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Context, JSX, ReactNode, createContext, useContext, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/init";

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
});

function useProvideAuth(): AuthContext {
  const [user, loading, errorAuth] = useAuthState(auth);

  const signInWithGoogle = async (): Promise<SignInResult | void> => {
    const provider = new GoogleAuthProvider();
    try {
      const credentials = await signInWithPopup(auth, provider);
      console.log("credentials", credentials);
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

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  return {
    signInWithGoogle,
    isAuthorized: isAuthorized,
    userInfo,
    uid: user?.uid || "",
    loading: loading,
    logout,
  };
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{props.children}</authContext.Provider>;
}

export const useAuth = (): AuthContext => useContext(authContext);
