"use client";

import { AuthProvider } from "@/features/Auth/useAuth";
import { Conversation } from "@/features/Conversation/Conversation";

export default function Home() {
  return (
    <AuthProvider>
      <main>
        <Conversation />
      </main>
    </AuthProvider>
  );
}
