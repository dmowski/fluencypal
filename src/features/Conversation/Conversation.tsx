"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import { useState } from "react";
import { Keyboard, SendHorizontal } from "lucide-react";
import { useAuth } from "../Auth/useAuth";
import { Google } from "iconsax-react";
import { TalkingWaves } from "../Animations/TalkingWaves";
import { MicroButton } from "../Button/MicroButton";
import { GlassButton } from "../Button/GlassButton";
import { Textarea } from "../Input/Textarea";

export function Conversation() {
  const auth = useAuth();

  const aiConversation = useAiConversation();
  const [userMessage, setUserMessage] = useState("");
  const submitMessage = () => {
    if (!userMessage) return;
    aiConversation.addUserMessage(userMessage);
    setUserMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 min-h-screen">
      <div className="flex flex-col items-center justify-center w-full gap-2">
        <TalkingWaves inActive={aiConversation.isAiSpeaking} />

        {aiConversation.isStarted ? (
          <div className="flex flex-col items-center justify-center relative gap-[40px] w-full">
            {aiConversation.isClosing && !aiConversation.isClosed && (
              <h2>Finishing the Lesson...</h2>
            )}

            {aiConversation.conversation
              .filter((message) => message.isBot)
              .filter((_, index, arr) => index >= arr.length - 1)
              .map((message, index) => {
                return (
                  <div
                    key={message.text + index}
                    className={[
                      "flex flex-col items-center gap-4 text-white",
                      "max-w-[400px]",
                      "text-center text-[#c8e2f2]",
                      "transform scale-110",
                    ].join(" ")}
                  >
                    <Markdown>{message.text || ""}</Markdown>
                  </div>
                );
              })}

            {aiConversation.conversation.length > 0 && aiConversation.isShowUserInput && (
              <div
                style={{
                  animationDelay: "0s",
                  animationDuration: "0.1s",
                  opacity: 0,
                }}
                className={[
                  "fixed bottom-[190px] left-0 right-0 w-full h-auto",
                  "flex justify-center items-center",
                  "z-[100] animate-fade-in",
                ].join(" ")}
              >
                <div className="flex flex-row items-start gap-4 ml-[20px]">
                  <Textarea
                    value={userMessage}
                    onChange={setUserMessage}
                    onSubmit={submitMessage}
                  />

                  <button
                    className={[
                      `animate-fade-in rounded-[40px]`,
                      !userMessage
                        ? `bg-[#aab3b7] cursor-not-allowed`
                        : `bg-[#8bc2d9] hover:bg-[#77a3b5]`,
                      `p-3 mt-1`,
                    ].join(" ")}
                    style={{
                      animationDelay: "0s",
                      animationDuration: "0.1s",
                    }}
                    disabled={!userMessage}
                    onClick={submitMessage}
                  >
                    <SendHorizontal color="#0f4564" size={"20px"} />
                  </button>
                </div>
              </div>
            )}

            {aiConversation.conversation.length > 0 && (
              <div
                style={{
                  animationDelay: "0.5s",
                }}
                className={[
                  "fixed bottom-[60px] left-0 right-0 w-full h-auto",
                  "flex flex-row justify-center items-center",
                  "z-[100] gap-[10px] animate-fade-in",
                  "opacity-0",
                ].join(" ")}
              >
                <MicroButton
                  isMuted={!!aiConversation.isMuted}
                  isPlaying={aiConversation.isUserSpeaking}
                  onClick={() => aiConversation.toggleMute(!aiConversation.isMuted)}
                />

                <button
                  style={{
                    backgroundColor: aiConversation.isShowUserInput ? "#0f4564" : "transparent",
                  }}
                  className={[
                    "w-[60px] h-[60px] relative cursor-pointer",
                    "rounded-full flex justify-center items-center",
                    "animate-fade-in",
                  ].join(" ")}
                  onClick={() => aiConversation.setIsShowUserInput(!aiConversation.isShowUserInput)}
                >
                  <Keyboard />
                </button>
              </div>
            )}

            {aiConversation.conversation.length > 3 &&
              !aiConversation.isClosed &&
              !aiConversation.isClosing && (
                <h2
                  className={[
                    "animate-fade-in duration-[5s] delay-[10s]",
                    "fixed bottom-[25px] left-0 right-0 text-center",
                    "text-[13px] font-extralight pt-0",
                    "text-[#c8e2f2]",
                  ].join(" ")}
                >
                  When you get tired, just say <b>"Let's finish the Lesson"</b>
                </h2>
              )}
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
              <p
                className="font-[300] text-xl pt-[100px] "
                style={{
                  color: "#c8e2f2",
                }}
              >
                Loading...
              </p>
            ) : (
              <>
                <div
                  style={{
                    backgroundImage: `url("./star.webp")`,
                  }}
                  className={[
                    "absolute top-[50px] left-0 w-full h-full",
                    "bg-contain z-[-1]",
                    "opacity-0 animate-fade-in duration-[5s] delay-[10s]",
                  ].join(" ")}
                />
                <div className="flex flex-col items-center justify-center gap-[20px] pt-[20px]">
                  {auth.isAuthorized ? (
                    <GlassButton
                      onClick={() => aiConversation.startConversation()}
                      animationDelay="0.2s"
                    >
                      Start Conversation
                    </GlassButton>
                  ) : (
                    <GlassButton onClick={() => auth.signInWithGoogle()} animationDelay="0.2s">
                      <Google size="22" color="#fff" variant="Bold" />
                      <p className="pt-[1px]">Continue with google</p>
                    </GlassButton>
                  )}

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
    </div>
  );
}
