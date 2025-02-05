"use client";

import { useAiConversation } from "@/hooks/useAiConversation";

export default function Home() {
  const aiConversation = useAiConversation();

  return (
    <main className="flex flex-row items-center justify-center h-screen gap-10">
      <div className="flex flex-col items-center justify-center h-screen w-full">
        {aiConversation.isStarted ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <p>Ready.. Talk...</p>
            <button
              onClick={() => aiConversation.analyzeMe()}
              className="px-10 rounded py-4 border"
            >
              Review my speech
            </button>

            <br />
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
      </div>
      <div className="flex flex-col items-center justify-center h-screen w-full gap-10">
        <div className="flex flex-col  justify-center w-[500px]">
          <h2 className="text-2xl font-semibold">Conversation:</h2>
          <div className="max-h-[500px] overflow-y-scroll">
            {aiConversation.conversation.length === 0 && (
              <p className="text-neutral-400">No conversation yet</p>
            )}
            {aiConversation.conversation.map((message, index) => {
              return (
                <p key={message.text + index} className="text-neutral-400">
                  {message.isBot ? "🤖" : "🤷🏼‍♂️"}: {message.text}
                </p>
              );
            })}
          </div>
        </div>

        <div className="w-[500px]">
          <h2 className="text-2xl font-semibold">Areas to learn:</h2>
          <div className="flex flex-col justify-center gap-2">
            {aiConversation.areasToImprove.length === 0 && (
              <p className="text-neutral-400">No notes yet</p>
            )}
            {aiConversation.areasToImprove.map((rule, index) => {
              return <p key={rule + index}>{rule}</p>;
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
