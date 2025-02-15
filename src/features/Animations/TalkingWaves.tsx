"use client";
import dynamic from "next/dynamic";
import talkingAnimationVerticalLines from "./data/verticalLines.json";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

export const TalkingWavesAnimation = () => {
  return <Lottie animationData={talkingAnimationVerticalLines} play />;
};

interface TalkingWavesProps {
  inActive?: boolean;
}
export const TalkingWaves = ({ inActive }: TalkingWavesProps) => {
  return (
    <>
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
            opacity: inActive ? 0.6 : 0.1,
            transition: "opacity 0.3s ease",
          }}
        >
          <TalkingWavesAnimation />
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
            opacity: inActive ? 0.6 : 0.1,
            transition: "opacity 0.3s ease",
          }}
        >
          <TalkingWavesAnimation />
        </div>
      </div>
    </>
  );
};
