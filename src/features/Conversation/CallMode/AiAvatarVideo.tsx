import { AvatarVideo } from "./types";

export const AiAvatarVideo = ({
  aiVideo,
  isSpeaking,
}: {
  aiVideo: AvatarVideo;
  isSpeaking: boolean;
}) => {
  return (
    <>
      <video
        src={aiVideo.sitVideoUrl}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 1,
        }}
        autoPlay
        controls={false}
        muted
        loop
        playsInline
      />
      <video
        src={aiVideo.talkVideoUrl}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isSpeaking ? 1 : 0,
          transition: "opacity 0.7s ease-in-out",
        }}
        autoPlay
        controls={false}
        muted
        loop
        playsInline
      />
    </>
  );
};
