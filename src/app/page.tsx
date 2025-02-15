import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { GlassButton } from "@/features/Button/GlassButton";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center gap-10 min-h-screen">
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <TalkingWaves />

          <div
            className="flex flex-col items-center justify-center relative "
            style={{
              width: "min(88vh, 90vw)",
              height: "min(88vh, 90vw)",
            }}
          >
            <div
              className={[
                "opacity-0 animate-fade-in duration-[5s] delay-[10s]",
                "absolute top-[50px] left-0 right-0 bottom-0",
                "h-full w-full",
                "bg-contain",
                "-z-[1]",
              ].join(" ")}
              style={{
                backgroundImage: `url("./star.webp")`,
              }}
            />
            <div className="flex flex-col items-center justify-center gap-[20px] pt-[20px]">
              <img
                src="./logo.png"
                alt="logo"
                className={[
                  "h-auto pt-[0px] animate-fade-in duration-[5s] delay-[10s]",
                  "opacity-0",
                  `w-full max-w-[500px]`,
                ].join(" ")}
                style={{
                  animationDelay: "0.5s",
                }}
              />
              <div
                style={{
                  animationDelay: "0.5s",
                }}
                className={[
                  "absolute top-[30px] left-0 right-0 bottom-0",
                  "opacity-0",
                  `w-[20px] h-[23px]`,
                  "mx-auto",
                  "animate-fade-in duration-[5s] delay-[10s]",
                ].join(" ")}
              >
                <img src="/cross.png" alt="" className="opacity-50" />
              </div>
              <p
                className="font-light pb-[40px] animate-fade-in duration-[5s] delay-[10s] "
                style={{ opacity: "0", animationDelay: "1s" }}
              >
                AI TEACHER TO LEARN ENGLISH
              </p>
              <GlassButton href="/practice" animationDelay="1.5s">
                START
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
