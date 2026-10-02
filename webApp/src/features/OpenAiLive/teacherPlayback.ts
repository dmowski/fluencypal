const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let teacherAudio: HTMLAudioElement | null = null;

const getTeacherAudio = (): HTMLAudioElement => {
  if (!teacherAudio) {
    teacherAudio = document.createElement('audio');
    teacherAudio.autoplay = true;
    teacherAudio.setAttribute('playsinline', 'true');
    document.body.appendChild(teacherAudio);
  }
  return teacherAudio;
};

/** Must run inside the Start conversation click, before any await. */
export const unlockTeacherAudio = (): void => {
  const audio = getTeacherAudio();
  audio.muted = false;
  audio.volume = 1;
  if (!audio.srcObject) audio.src = SILENT_WAV;
  void audio.play().catch(() => undefined);
};

export const playTeacherStream = (stream: MediaStream): Promise<void> => {
  const audio = getTeacherAudio();
  audio.muted = false;
  audio.volume = 1;
  audio.removeAttribute('src');
  audio.srcObject = stream;
  return audio.play();
};

export const stopTeacherAudio = (): void => {
  if (!teacherAudio) return;
  teacherAudio.pause();
  teacherAudio.srcObject = null;
  teacherAudio.removeAttribute('src');
};
