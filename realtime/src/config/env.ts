import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REALTIME_PORT: z.coerce.number().int().min(1).max(65535).default(8081),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
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
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
