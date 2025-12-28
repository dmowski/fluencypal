import { useEffect, useState } from "react";
import { AvatarVideo } from "./types";

export const AiAvatarVideo = ({
  aiVideo,
  isSpeaking,
}: {
  aiVideo: AvatarVideo;
  isSpeaking: boolean;
}) => {
  const [sitIndex, setSitIndex] = useState(0);
  const [talkIndex, setTalkIndex] = useState(0);

  useEffect(() => {
    if (isSpeaking) {
      const nextSitIndex = (sitIndex + 1) % aiVideo.sitVideoUrl.length;
      setSitIndex(nextSitIndex);
    } else {
      const nextTalkIndex = (talkIndex + 1) % aiVideo.talkVideoUrl.length;
      setTalkIndex(nextTalkIndex);
    }
  }, [isSpeaking]);

  return (
    <>
      {aiVideo.sitVideoUrl.map((url, index) => {
        const isActive = index === sitIndex;
        return (
          <video
            key={url}
            src={url}
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isActive ? 1 : 0,
            }}
            autoPlay
            controls={false}
            muted
            loop
            playsInline
          />
        );
      })}

      {aiVideo.talkVideoUrl.map((url, index) => {
        const isActive = index === talkIndex;
        return (
          <video
            src={url}
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isSpeaking && isActive ? 1 : 0,
              transition: "opacity 0.7s ease-in-out",
            }}
            autoPlay
            controls={false}
            muted
            loop
            playsInline
          />
        );
      })}
    </>
  );
};
