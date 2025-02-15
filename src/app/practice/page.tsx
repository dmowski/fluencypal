"use client";

import { Conversation } from "@/features/Conversation/Conversation";
import { Header } from "@/features/Header/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Conversation />
      </main>
    </>
  );
}
