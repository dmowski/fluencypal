"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";

export function Conversation() {
  const aiConversation = useAiConversation();

  return (
    <div className="flex flex-col items-center justify-center gap-10 min-h-screen">
      <div className="flex flex-col items-center justify-center w-full gap-2">
        {aiConversation.isStarted ? (
          <div
            className="flex flex-col items-center justify-center relative "
            style={{
              width: "min(88vh, 90vw)",
              height: "min(88vh, 90vw)",
            }}
          >
            {aiConversation.conversation.length > 4 &&
              !aiConversation.isClosed &&
              !aiConversation.isClosing && (
                <h2 className="text-2xl">
                  When you get tired, just say <b>"Let's finish the Lesson"</b>
                </h2>
              )}

            {aiConversation.isClosing && !aiConversation.isClosed && (
              <>
                <h2>
                  <b>Finishing the Lesson...</b>
                </h2>
              </>
            )}

            <button
              onClick={() => aiConversation.stopConversation()}
              className="py-2 px-8 rounded-xl border-neutral-700 border"
            >
              Stop
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center relative "
            style={{
              width: "min(88vh, 90vw)",
              height: "min(88vh, 90vw)",
            }}
          >
            {aiConversation.isInitializing ? (
              <p className="font-[300] text-xl pt-[100px]">Loading...</p>
            ) : (
              <>
                <div
                  className="opacity-0 animate-fade-in duration-[5s] delay-[10s]"
                  style={{
                    position: "absolute",
                    top: "50px",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url("./star.webp")`,
                    backgroundSize: "contain",
                    zIndex: -1,
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-[20px] pt-[20px]">
                  <img
                    src="./logo.png"
                    alt="logo"
                    className="h-auto pt-[0px] animate-fade-in duration-[5s] delay-[10s]"
                    style={{
                      opacity: "0",
                      animationDelay: "0.5s",
                      width: "100%",
                      maxWidth: "500px",
                    }}
                  />
                  <div
                    style={{
                      width: "20px",
                      height: "23px",
                      position: "absolute",
                      top: "30px",
                      left: "0",
                      right: "0",
                      margin: "auto",
                      opacity: "0",
                      animationDelay: "0.5s",
                    }}
                    className="animate-fade-in duration-[5s] delay-[10s]"
                  >
                    <img src="/cross.png" alt="" className="opacity-50" />
                  </div>
                  <p
                    className="font-light pb-[40px] animate-fade-in duration-[5s] delay-[10s] "
                    style={{ opacity: "0", animationDelay: "1s" }}
                  >
                    AI TEACHER TO LEARN ENGLISH
                  </p>
                  <button
                    onClick={() => aiConversation.startConversation()}
                    className={[
                      `transition-all duration-100`,
                      `text-[#eef6f9] hover:text-white`,
                      `shadow-[0_0_0_1px_rgba(255,255,255,0.9)] hover:shadow-[0_0_0_3px_rgba(255,255,255,1)]`,
                      `font-[250] text-[24px]`,
                      `opacity-90 hover:opacity-100`,
                      `animate-fade-in duration-[5s] delay-[10s]`,
                    ].join(" ")}
                    style={{
                      padding: "20px 80px",
                      backgroundImage: `url("./button_bg.png")`,
                      backgroundSize: "cover",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      width: "300px",
                      maxWidth: "90%",
                      opacity: "0",
                      animationDelay: "1.5s",
                    }}
                  >
                    START
                  </button>
                  {!!aiConversation.errorInitiating && (
                    <p className="text-sm text-red-500 text-center">
                      {aiConversation.errorInitiating}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {aiConversation.isClosing ||
        (aiConversation.isClosed && (
          <>
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
          </>
        ))}
    </div>
  );
}
