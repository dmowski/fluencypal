"use client";

import { ConversationPage } from "@/features/Conversation/ConversationPage";
import { Header } from "@/features/Header/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <ConversationPage />
      </main>
    </>
  );
}
