"use client";

import { AuthProvider } from "@/features/Auth/useAuth";
import { Conversation } from "@/features/Conversation/Conversation";
import { Header } from "@/features/Header/Header";

export default function Home() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Conversation />
      </main>
    </AuthProvider>
  );
}
