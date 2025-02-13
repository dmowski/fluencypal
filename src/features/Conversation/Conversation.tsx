"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import talkingAnimationVerticalLines from "../Animations/verticalLines.json";
import microAnimation from "../Animations//micro.json";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Keyboard, LogOut, SendHorizontal } from "lucide-react";
import { useAuth } from "../Auth/useAuth";
import { Google } from "iconsax-react";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

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
      <img
        src="./logo.png"
        alt="logo"
        className=""
        style={{
          width: "100px",
          height: "auto",
          position: "fixed",
          left: "10px",
          top: "20px",
          zIndex: 100,
        }}
      />

      {auth.isAuthorized && (
        <button
          onClick={() => auth.logout()}
          className={[
            `text-[#eef6f9] hover:text-white`,
            `hover:shadow-[0_0_0_2px_rgba(255,255,255,1)]`,
            `font-[350] text-[16px]`,
            `opacity-90 hover:opacity-100`,
            "flex items-center justify-center gap-2",
          ].join(" ")}
          style={{
            padding: "15px 20px",
            backgroundSize: "cover",
            boxSizing: "border-box",
            borderRadius: "4px",
            width: "auto",
            maxWidth: "90%",
            position: "fixed",
            top: "10px",
            right: "10px",
          }}
        >
          <LogOut size="20" color="#fff" />
          Logout
        </button>
      )}

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
            <Lottie animationData={talkingAnimationVerticalLines} play />
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
            <Lottie animationData={talkingAnimationVerticalLines} play />
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

            {aiConversation.conversation.length > 0 && aiConversation.isShowUserInput && (
              <div
                style={{
                  position: "fixed",
                  bottom: "190px",
                  left: "0",
                  right: "0",
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  animationDelay: "0s",
                  animationDuration: "0.1s",
                  opacity: 0,
                  zIndex: 100,
                }}
                className="animate-fade-in"
              >
                <div className="flex flex-row items-start gap-4 ml-[20px]">
                  <textarea
                    className={[
                      `rounded`,
                      `border`,
                      `px-3 py-3`,
                      `border outline-none`,
                      `text-black`,
                      `w-[600px] min-h-[60px]`,
                    ].join(" ")}
                    value={userMessage}
                    // @ts-expect-error - New prop fieldSizing
                    style={{ fieldSizing: "content", maxHeight: "200px" }}
                    placeholder="Type your message here..."
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => {
                      const isEnter = e.key === "Enter";
                      const isCtrl = e.ctrlKey;
                      const isCommand = e.metaKey;
                      if (isEnter && (isCtrl || isCommand)) {
                        e.preventDefault();
                        submitMessage();
                      }
                    }}
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
                  position: "fixed",
                  bottom: "60px",
                  left: "0",
                  right: "0",
                  width: "100%",
                  height: "auto",

                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",

                  animationDelay: "0.5s",
                  opacity: 0,
                  zIndex: 100,
                  gap: "10px",
                }}
                className="animate-fade-in"
              >
                <button
                  className="animate-fade-in"
                  style={{
                    width: "80px",
                    height: "80px",
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
                    animationData={microAnimation}
                    play={aiConversation.isUserSpeaking && !aiConversation.isMuted}
                  />
                </button>

                <button
                  className="animate-fade-in"
                  style={{
                    width: "60px",
                    height: "60px",
                    cursor: "pointer",
                    position: "relative",
                    borderRadius: "100px",
                    backgroundColor: aiConversation.isShowUserInput ? "#0f4564" : "transparent",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
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
                  <button
                    onClick={() =>
                      auth.isAuthorized
                        ? aiConversation.startConversation()
                        : auth.signInWithGoogle()
                    }
                    className={[
                      `transition-all duration-100`,
                      `text-[#eef6f9] hover:text-white`,
                      `shadow-[0_0_0_1px_rgba(255,255,255,0.9)] hover:shadow-[0_0_0_2px_rgba(255,255,255,1)]`,
                      `font-[250] text-[18px]`,
                      `opacity-90 hover:opacity-100`,
                      `animate-fade-in`,
                      "flex items-center justify-center gap-5",
                    ].join(" ")}
                    style={{
                      padding: "20px 40px",
                      backgroundImage: `url("./button_bg.png")`,
                      backgroundSize: "cover",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      width: "340px",
                      maxWidth: "90%",
                      opacity: "0",
                      animationDelay: "0.1s",
                    }}
                  >
                    {auth.isAuthorized ? (
                      "Start Conversation"
                    ) : (
                      <>
                        <Google size="22" color="#fff" variant="Bold" />
                        <p className="pt-[1px]">Continue with google</p>
                      </>
                    )}
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
    </div>
  );
}
