import { TalkingWaves } from "@/features/Animations/TalkingWaves";

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
              <a
                href="/practice"
                className={[
                  `transition-all duration-100`,
                  `text-[#eef6f9] hover:text-white`,
                  `shadow-[0_0_0_1px_rgba(255,255,255,0.9)] hover:shadow-[0_0_0_2px_rgba(255,255,255,1)]`,
                  `font-[250] text-[18px]`,
                  `opacity-0 hover:opacity-100`,
                  `animate-fade-in`,
                  "flex items-center justify-center gap-5",
                  `w-[340px] max-w-[90%] px-10 py-5`,
                  `rounded-md`,
                  `box-border`,
                  `bg-cover bg-center`,
                ].join(" ")}
                style={{
                  backgroundImage: `url("./button_bg.png")`,
                  animationDelay: "1.5s",
                }}
              >
                <p className="pt-[1px]">START</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
