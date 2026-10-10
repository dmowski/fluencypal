// The glow at the bottom of the screen. Its colour says who is talking — cool blue/cyan while the
// learner speaks, warm violet/rose/amber while the teacher speaks — and its height follows the
// voice that is sounding. Drawn small (CSS blurs it), and paused while the tab is hidden.

export const AURORA_MODES = ['idle', 'listening', 'you', 'thinking', 'alex', 'muted'] as const;
export type AuroraMode = (typeof AURORA_MODES)[number];

type Rgb = [number, number, number];

const hex = (color: string): Rgb => [
  Number.parseInt(color.slice(1, 3), 16),
  Number.parseInt(color.slice(3, 5), 16),
  Number.parseInt(color.slice(5, 7), 16),
];

const PALETTES: Record<AuroraMode, readonly string[]> = {
  idle: ['#4F8BFF', '#8E6CFF', '#FF5C93', '#FFB14E'],
  listening: ['#4F8BFF', '#2EE6D6', '#4F8BFF', '#8E6CFF'],
  you: ['#2EE6D6', '#4F8BFF', '#2EE6D6', '#8E6CFF'],
  thinking: ['#4F8BFF', '#8E6CFF', '#2EE6D6', '#FF5C93'],
  alex: ['#8E6CFF', '#FF5C93', '#FFB14E', '#FF5C93'],
  muted: ['#3A3A52', '#4A4A66', '#3A3A52', '#4A4A66'],
};

// Resting energy, and how much a voice level adds, per mode.
const SHAPE: Record<AuroraMode, readonly [number, number]> = {
  idle: [0.34, 0],
  listening: [0.3, 0],
  you: [0.3, 0.85],
  thinking: [0.38, 0],
  alex: [0.32, 0.8],
  muted: [0.12, 0],
};

export type AuroraController = {
  /** idle | listening | you | thinking | alex | muted */
  setMode: (mode: AuroraMode) => void;
  /** Learner's mic RMS (0..~0.3). */
  mic: (rms: number) => void;
  /** A function returning the teacher's current output level, 0..1. */
  setOutputMeter: (read: (() => number) | null) => void;
  /** The start "whoosh": the glow surges up and settles. */
  burst: () => void;
  destroy: () => void;
};

export const startAurora = (canvas: HTMLCanvasElement): AuroraController => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      setMode() {},
      mic() {},
      setOutputMeter() {},
      burst() {},
      destroy() {},
    };
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mode: AuroraMode = 'idle';
  let micLevel = 0;
  let outMeter: (() => number) | null = null;
  let energy = 0.34;
  let burst = 0;
  let t = 0;
  let last = 0;
  let raf = 0;
  let colors: Rgb[] = PALETTES.idle.map(hex);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(64, Math.round(rect.width / 3));
    canvas.height = Math.max(32, Math.round(rect.height / 3));
  };

  const draw = (level: number) => {
    const width = canvas.width;
    const height = canvas.height;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const layers = 4;
    for (let i = 0; i < layers; i += 1) {
      const amp = height * (0.22 + 0.62 * level) * (1 - i * 0.14);
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      for (let k = 0; k < 4; k += 1) {
        const [red, green, blue] = colors[(k + i) % 4];
        grad.addColorStop(k / 3, `rgba(${red | 0},${green | 0},${blue | 0},${0.55 - i * 0.08})`);
      }
      ctx.beginPath();
      ctx.moveTo(0, height);
      const steps = 40;
      for (let s = 0; s <= steps; s += 1) {
        const u = s / steps;
        const wave =
          0.55 +
          0.25 * Math.sin(u * Math.PI * (1.6 + i * 0.5) + t * (0.9 + i * 0.35) + i * 1.7) +
          0.2 * Math.sin(u * Math.PI * (3.1 + i) - t * (1.3 + i * 0.2));
        const envelope = 0.55 + 0.45 * Math.sin(Math.PI * u);
        ctx.lineTo(u * width, height - amp * wave * envelope);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-in';
    const fade = ctx.createLinearGradient(0, 0, 0, height);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.3, 'rgba(0,0,0,0.7)');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
  };

  const frame = (now: number) => {
    raf = window.requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    t += dt * (reduced ? 0.15 : 1) * (mode === 'thinking' ? 1.8 : 1);
    const target = PALETTES[mode].map(hex);
    colors = colors.map((color, index) => {
      const next = target[index];
      const blend = Math.min(1, dt * 3);
      return [
        color[0] + (next[0] - color[0]) * blend,
        color[1] + (next[1] - color[1]) * blend,
        color[2] + (next[2] - color[2]) * blend,
      ];
    });
    const [rest, gain] = SHAPE[mode];
    const voice = mode === 'alex' ? (outMeter ? outMeter() : 0) : mode === 'you' ? micLevel : 0;
    const breathe = mode === 'thinking' ? 0.08 * Math.sin(t * 2.4) : 0.02 * Math.sin(t * 0.8);
    const want = Math.min(1.1, rest + gain * voice + breathe);
    energy += (want - energy) * Math.min(1, dt * (want > energy ? 10 : 3));
    burst = Math.max(0, burst - dt * 0.75);
    draw(Math.min(1.4, energy + burst * 1.1));
  };

  const resume = () => {
    if (raf) return;
    last = 0;
    raf = window.requestAnimationFrame(frame);
  };
  const pause = () => {
    window.cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVisibility = () => {
    if (document.hidden) pause();
    else resume();
  };

  const observer = new ResizeObserver(resize);
  document.addEventListener('visibilitychange', onVisibility);
  observer.observe(canvas);
  resize();
  resume();

  return {
    setMode(next) {
      if (PALETTES[next]) mode = next;
    },
    mic(rms) {
      micLevel = Math.min(1, rms * 7);
    },
    setOutputMeter(read) {
      outMeter = read;
    },
    burst() {
      burst = 1;
    },
    destroy() {
      pause();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
};
