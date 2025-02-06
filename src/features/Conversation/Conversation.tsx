"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";

export function Conversation() {
  const aiConversation = useAiConversation();
  const bg = "https://cdn.midjourney.com/ffabd88c-c5ac-43bc-ab09-e966eb1402d2/0_2.png";

  return (
    <div className="flex flex-col items-center py-10 gap-10 min-h-screen">
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
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex flex-col items-center justify-center gap-1">
              <p>Ready to talk..</p>
              {aiConversation.conversation.length === 0 && (
                <h2 className="text-3xl">To begin the conversation, say "Hello"</h2>
              )}
            </div>

            {aiConversation.conversation.length > 4 && (
              <h2 className="text-2xl">
                When you get tired, just say <b>"Let's finish the Lesson"</b>
              </h2>
            )}
            <button
              onClick={() => aiConversation.stopConversation()}
              className="py-2 px-8 rounded-xl border-neutral-700 border"
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
                  onClick={() => aiConversation.startConversation()}
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
      </div>
      <div className="flex flex-col items-center justify-center w-full gap-10">
        <div className="w-full max-w-[600px] bg-white border border-neutral-300 rounded-xl px-8 py-6">
          <h2 className="text-2xl font-semibold">Conversation:</h2>
          <div className="flex flex-col gap-2 py-4">
            {aiConversation.conversation.length === 0 && (
              <p className="text-neutral-600 text-sm">No conversation yet</p>
            )}
            {aiConversation.conversation
              .filter((message, index) => {
                return index >= aiConversation.conversation.length - 4;
              })
              .map((message, index) => {
                return (
                  <div
                    key={message.text + index}
                    className={`flex items-center gap-4 ${message.isBot ? "" : "pt-4"}`}
                  >
                    <div
                      className={` rounded-lg px-2 py-1 ${
                        message.isBot
                          ? "bg-blue-50 text-neutral-600"
                          : "bg-transparent text-neutral-600"
                      }`}
                    >
                      {message.isBot ? (
                        <Markdown>{message.text || ""}</Markdown>
                      ) : (
                        <p className="text-md">{message.text}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xl">{message.isBot ? "🤖" : "🤷🏼‍♂️"}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
