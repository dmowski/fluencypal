"use client";

import { useAiConversation } from "@/hooks/useAiConversation";

export default function Home() {
  const aiConversation = useAiConversation();

  return (
    <main className="">
      {aiConversation.isStarted ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <p>Ready.. Talk...</p>
          <button
            onClick={() => aiConversation.stopConversation()}
            className="px-10 rounded py-4 border"
          >
            Stop
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          {aiConversation.isInitializing ? (
            <p>Loading...</p>
          ) : (
            <>
              <button
                onClick={() => aiConversation.startConversation("analyze")}
                className="px-10 rounded py-4 border"
              >
                Analyze me
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
