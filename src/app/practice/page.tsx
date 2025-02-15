"use client";

import { AuthProvider } from "@/features/Auth/useAuth";
import { Conversation } from "@/features/Conversation/Conversation";
import { Header } from "@/features/Header/Header";

export default function Home() {
  return (
    <AuthProvider>
      <main>
        <Header />
        <Conversation />
      </main>
    </AuthProvider>
  );
}
