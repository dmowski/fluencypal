"use client";

import { useAiConversation } from "@/hooks/useAiConversation";

export default function Home() {
  const aiConversation = useAiConversation();
  const bg = "https://cdn.midjourney.com/ffabd88c-c5ac-43bc-ab09-e966eb1402d2/0_2.png";

  return (
    <main className="flex flex-col items-center pt-[200px] gap-10 min-h-screen">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "130vw",
          height: "120vh",
          zIndex: -1,
          pointerEvents: "none",
          backgroundImage: `url('${bg}')`,
          backgroundSize: "cover",
          opacity: 0.4,
        }}
      ></div>
      <div className="flex flex-col items-center justify-center w-full gap-2">
        {aiConversation.isStarted ? (
          <div className="flex flex-col items-center justify-center  gap-2">
            <p>Ready to talk..</p>

            <button
              onClick={() => aiConversation.stopConversation()}
              className="py-2 px-8 rounded-xl  border-neutral-700 border-2"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center ">
            {aiConversation.isInitializing ? (
              <p>Loading...</p>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => aiConversation.startConversation("analyze")}
                  className="py-4 px-12 rounded-xl border bg-blue-50 border-blue-700 text-2xl text-blue-900"
                >
                  Start
                </button>
                {!!aiConversation.errorInitiating && (
                  <p className="text-sm text-red-500 text-center">
                    {aiConversation.errorInitiating}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {aiConversation.conversation.length > 2 && (
          <button
            onClick={() => aiConversation.analyzeMe()}
            className="py-2 px-8 rounded-xl  border border-neutral-700"
          >
            Review my speech
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-full gap-10">
        <div className="w-full max-w-[600px] bg-white border border-neutral-300 rounded-xl px-8 py-6">
          <h2 className="text-2xl font-semibold">Areas to improve:</h2>
          <div className="flex flex-col justify-center gap-2">
            {!aiConversation.areasToImprove ? (
              <p className="text-neutral-600 text-sm">No notes yet</p>
            ) : (
              <p>{aiConversation.areasToImprove}</p>
            )}
          </div>
        </div>
        <div className="w-full max-w-[600px] bg-white border border-neutral-300 rounded-xl px-8 py-6">
          <h2 className="text-2xl font-semibold">Conversation:</h2>
          <div className="">
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
