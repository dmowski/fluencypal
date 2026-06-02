import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/$/, '');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REALTIME_PORT: z.coerce.number().int().min(1).max(65535).default(8081),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean),
    ),
  PUBLIC_APP_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().default('dark-lang'),
  FIREBASE_STORAGE_BUCKET: z.string().default('dark-lang.firebasestorage.app'),
  IS_FIREBASE_EMULATOR: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DEFAULT_STT_MODEL: z.string().default('gpt-4o-transcribe'),
  DEFAULT_LLM_MODEL: z.string().default('gpt-4o'),
  DEFAULT_TTS_MODEL: z.string().default('gpt-4o-mini-tts'),
  RATE_LIMIT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  /** Max HTTP requests per IP per window (excludes /health, /ready). */
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(200),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
  /** Stricter cap for token verification (brute-force protection). */
  RATE_LIMIT_AUTH_VERIFY_MAX: z.coerce.number().int().min(1).default(30),
  /** WebSocket upgrade attempts per IP per window. */
  RATE_LIMIT_WS_MAX: z.coerce.number().int().min(1).default(20),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.parse(process.env);

const mergedOrigins = new Set<string>(parsed.ALLOWED_ORIGINS);

if (parsed.PUBLIC_APP_URL) {
  mergedOrigins.add(normalizeOrigin(parsed.PUBLIC_APP_URL));
}

if (process.env.FLY_APP_NAME) {
  mergedOrigins.add(`https://${process.env.FLY_APP_NAME}.fly.dev`);
}

export const env: Env = {
  ...parsed,
  ALLOWED_ORIGINS: [...mergedOrigins],
};
