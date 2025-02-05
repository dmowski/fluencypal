"use client";

import { useAiConversation } from "@/hooks/useAiConversation";

export default function Home() {
  const aiConversation = useAiConversation();

  return (
    <main className="flex flex-row items-center justify-center h-screen gap-10">
      <div
        style={{
          position: "fixed",
          width: "130vw",
          height: "120vh",
          zIndex: -1,
          pointerEvents: "none",
          backgroundImage:
            "url('https://cdn.midjourney.com/ffabd88c-c5ac-43bc-ab09-e966eb1402d2/0_3.png')",
          backgroundSize: "cover",
          opacity: 0.2,
        }}
      ></div>
      <div className="flex flex-col items-center justify-center h-screen w-[400px]">
        {aiConversation.isStarted ? (
          <div className="flex flex-col items-center justify-center h-screen gap-2">
            <p>Ready to talk..</p>
            <button
              onClick={() => aiConversation.analyzeMe()}
              className="py-2 px-8 rounded-xl  border border-neutral-700"
            >
              Review my speech
            </button>

            <button
              onClick={() => aiConversation.stopConversation()}
              className="py-2 px-8 rounded-xl  border border-neutral-700"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            {aiConversation.isInitializing ? (
              <p>Loading...</p>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => aiConversation.startConversation("analyze")}
                  className="py-2 px-8 rounded-xl  border border-neutral-700"
                >
                  Start
                </button>
                {!!aiConversation.errorInitiating && (
                  <p className="text-sm text-red-500">{aiConversation.errorInitiating}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center h-screen w-full gap-10">
        <div className="w-full max-h-[500px] overflow-y-scroll">
          <h2 className="text-2xl font-semibold">Areas to improve:</h2>
          <div className="flex flex-col justify-center gap-2">
            {!aiConversation.areasToImprove ? (
              <p className="text-neutral-600 text-sm">No notes yet</p>
            ) : (
              <p>{aiConversation.areasToImprove}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col  justify-center w-full">
          <h2 className="text-2xl font-semibold">Conversation:</h2>
          <div className="max-h-[500px] overflow-y-scroll">
            {aiConversation.conversation.length === 0 && (
              <p className="text-neutral-600 text-sm">No conversation yet</p>
            )}
            {aiConversation.conversation
              .filter((message, index) => {
                return index >= aiConversation.conversation.length - 4;
              })
              .map((message, index) => {
                return (
                  <p key={message.text + index} className="text-neutral-600">
                    {message.isBot ? "🤖" : "🤷🏼‍♂️"}: {message.text}
                  </p>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
