"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import talkingAnimationVerticalLines from "./animations/verticalLines.json";
import microAnimation from "./animations/micro.json";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
});

export function Conversation() {
  const aiConversation = useAiConversation();

  return (
    <div className="flex flex-col items-center justify-center gap-10 min-h-screen">
      <div className="flex flex-col items-center justify-center w-full gap-2">
        <div
          className={[
            `animate-fade-in`,
            `pointer-events-none h-[110vh] fixed w-[500px] left-0 -bottom-[50px]`,
          ].join(" ")}
          style={{
            animationDelay: "0.9s",
            opacity: "0",
          }}
        >
          <div
            style={{
              opacity: aiConversation.isAiSpeaking ? 0.6 : 0.1,
              transition: "opacity 0.3s ease",
            }}
          >
            <Lottie
              key={"lottie-left-waves"}
              options={{ animationData: talkingAnimationVerticalLines }}
            />
          </div>
        </div>

        <div
          className={[
            `animate-fade-in`,
            `pointer-events-none h-[110vh] fixed w-[500px] right-[0px] -bottom-[0px]`,
            "opacity-[0.1]",
          ].join(" ")}
          style={{
            transform: "scaleX(-1)",
            animationDelay: "0.8s",
            opacity: "0",
          }}
        >
          <div
            style={{
              opacity: aiConversation.isAiSpeaking ? 0.6 : 0.1,
              transition: "opacity 0.3s ease",
            }}
          >
            <Lottie
              key={"lottie-right-waves"}
              options={{ animationData: talkingAnimationVerticalLines }}
            />
          </div>
        </div>

        {aiConversation.isStarted ? (
          <div
            className="flex flex-col items-center justify-center relative gap-[40px] "
            style={{
              width: "100vw",
              height: "min(88vh, 90vw)",
            }}
          >
            {aiConversation.isClosing && !aiConversation.isClosed && (
              <>
                <h2>
                  <b>Finishing the Lesson...</b>
                </h2>
              </>
            )}

            {aiConversation.conversation
              .filter((message, index) => message.isBot)
              .filter((message, index, arr) => {
                return index >= arr.length - 1;
              })
              .map((message, index) => {
                return (
                  <div
                    key={message.text + index}
                    className="flex flex-col items-center gap-4 text-white"
                    style={{
                      maxWidth: "400px",
                      textAlign: "center",
                      color: "#c8e2f2",
                      transform: "scale(1.1)",
                    }}
                  >
                    <Markdown>{message.text || ""}</Markdown>
                  </div>
                );
              })}

            {aiConversation.conversation.length > 0 && (
              <div
                style={{
                  position: "fixed",
                  bottom: "60px",
                  left: "0",
                  right: "0",
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  animationDelay: "0.5s",
                  opacity: 0,
                  zIndex: 100,
                }}
                className="animate-fade-in"
              >
                <button
                  className="animate-fade-in"
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "auto",
                    filter: aiConversation.isMuted ? "grayscale(100%)" : "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => aiConversation.toggleMute(!aiConversation.isMuted)}
                >
                  {aiConversation.isMuted && (
                    <div
                      style={{
                        width: "40px",
                        borderRadius: "2px",
                        height: "2px",
                        backgroundColor: "#fff",
                        transform: "rotate(45deg)",
                        position: "absolute",
                        top: "calc(50% - 2px)",
                        left: "calc(50% - 20px)",
                        zIndex: 1,
                      }}
                    />
                  )}
                  <Lottie
                    key={"lottie-micro"}
                    options={{ animationData: microAnimation, autoplay: false }}
                    isPaused={!aiConversation.isUserSpeaking || aiConversation.isMuted}
                  />
                </button>
              </div>
            )}

            {aiConversation.conversation.length > 1 &&
              !aiConversation.isClosed &&
              !aiConversation.isClosing && (
                <h2
                  className={`animate-fade-in duration-[5s] delay-[10s]`}
                  style={{
                    color: "#c8e2f2",
                    fontWeight: 200,
                    fontSize: "13px",
                    paddingTop: "0px",
                    position: "fixed",
                    bottom: "25px",
                    left: "0",
                    right: "0",
                    textAlign: "center",
                  }}
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
                      //animationDelay: "1.5s",
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

      {(aiConversation.isClosing || aiConversation.isClosed) && (
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
      )}
    </div>
  );
}
