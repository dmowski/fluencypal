import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { NextResponse } from 'next/server';

export class SpeakingClubError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'SpeakingClubError';
    this.status = status;
  }
}

export const speakingClubErrorResponse = (error: unknown): Response => {
  const authResponse = jsonIfAuthTokenError(error);
  if (authResponse) return authResponse;
  if (error instanceof SpeakingClubError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Speaking club request failed', error);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
};

export const readJson = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new SpeakingClubError('That request could not be read.');
  }
};

export const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SpeakingClubError('That request could not be read.');
  }
  return value as Record<string, unknown>;
};

export const readText = (value: unknown, max: number, label: string): string => {
  if (typeof value !== 'string') throw new SpeakingClubError(`${label} is missing.`);
  const text = value.trim();
  if (!text) throw new SpeakingClubError(`${label} is missing.`);
  if (text.length > max) throw new SpeakingClubError(`${label} is too long.`);
  return text;
};

export const readOptionalText = (value: unknown, max: number): string => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};
