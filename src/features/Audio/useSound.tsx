// useSound.ts
import { useRef } from "react";

const basePath = "/sounds/";

const soundsMap = {
  win1: `${basePath}mixkit-fantasy-game-success-notification-270.wav`,
  win2: `${basePath}mixkit-instant-win-2021.wav`,
  win3: `${basePath}mixkit-melodic-bonus-collect-1938.wav`,
  win4: `${basePath}mixkit-winning-notification-2018.wav`,
  lose1: `${basePath}mixkit-circus-lose-2030.wav`,
} as const;

type SoundKey = keyof typeof soundsMap;

type UseSoundReturn = {
  play: (key: SoundKey, volume: number) => void;
};

export function useSound(): UseSoundReturn {
  const audioCache = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());

  const play = (key: SoundKey, volume: number) => {
    const src = soundsMap[key];

    let audio = audioCache.current.get(key);
    if (!audio) {
      audio = new Audio(src);
      audioCache.current.set(key, audio);
    }

    const clonedAudio = audio.cloneNode() as HTMLAudioElement;
    clonedAudio.volume = volume;
    clonedAudio.play().catch((err) => {
      console.error("Error playing sound:", err);
    });
  };

  return { play };
}
