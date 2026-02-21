export const getAudioEl = (): HTMLAudioElement => {
  const audioId = 'audio_for_llm';
  let audioEl = document.getElementById(audioId) as HTMLAudioElement | null;
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.id = audioId;
    document.body.appendChild(audioEl);
  }
  return audioEl;
};
