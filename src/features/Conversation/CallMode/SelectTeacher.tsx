import { Stack, Typography } from "@mui/material";
import { voiceAvatarMap } from "./voiceAvatar";
import { AiVoice } from "@/common/ai";
import { AiAvatarVideo } from "./AiAvatarVideo";
import { AiAvatar } from "./types";
import { AudioPlayIcon } from "@/features/Audio/AudioPlayIcon";
import { useConversationAudio } from "@/features/Audio/useConversationAudio";
import { useState } from "react";

export const SelectTeacher = ({
  selectedVoice,
  onSelectVoice,
}: {
  selectedVoice?: AiVoice | null;
  onSelectVoice: (voice: AiVoice) => void;
}) => {
  const voices = Object.keys(voiceAvatarMap) as AiVoice[];

  return (
    <Stack
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        aspectRatio: "4 / 3",
        gap: "15px",
      }}
    >
      {voices.map((voice) => {
        const aiAvatar = voiceAvatarMap[voice];
        const isSelected = selectedVoice === voice;
        return (
          <AvatarCard
            key={voice}
            aiAvatar={aiAvatar}
            isSelected={isSelected}
            onToggle={() => onSelectVoice(voice)}
            voice={voice}
          />
        );
      })}
    </Stack>
  );
};

export const AvatarCard = ({
  aiAvatar,
  isSelected,
  onToggle,
  voice,
}: {
  voice: AiVoice;
  aiAvatar: AiAvatar;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const audio = useConversationAudio();
  const [isPlayingThisVoice, setIsPlayingThisVoice] = useState(false);
  return (
    <Stack
      sx={{
        position: "relative",
        padding: "4px",
      }}
    >
      <Stack
        sx={{
          boxShadow: isSelected
            ? "0px 0px 0px 4px rgba(0, 0, 0, 1), 0px 0px 0px 7px rgba(0, 185, 252, 1)"
            : "0px 0px 0px 1px rgb(51, 51, 51, 0)",
          borderRadius: isSelected ? "3px" : 0,
          overflow: "hidden",
          cursor: "pointer",
          width: "100%",
          height: "100%",
          position: "relative",
          border: "none",
        }}
        component={"button"}
        onClick={onToggle}
      >
        <AiAvatarVideo aiVideo={aiAvatar} isSpeaking={audio.isPlaying && isPlayingThisVoice} />
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "15px",
          textTransform: "capitalize",
        }}
      >
        <Typography variant="body2">{voice}</Typography>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "50%",
          padding: "4px",
        }}
      >
        <AudioPlayIcon
          text={aiAvatar.helloPhrases[0]}
          voice={voice}
          instructions={aiAvatar.voiceInstruction}
          onChangeState={setIsPlayingThisVoice}
        />
      </Stack>
    </Stack>
  );
};
