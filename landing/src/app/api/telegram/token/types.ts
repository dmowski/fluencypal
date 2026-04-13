export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

export interface TelegramAuthRequest {
  /** Raw Telegram.WebApp.initData string, e.g. "query_id=...&user=%7B...%7D&auth_date=...&hash=..." */
  initData: string;
}

export interface TelegramAuthResponse {
  error?: { code: string; message: string; reason?: string };

  token: string; // Firebase custom token
  uid: string; // Firebase UID (tg:<id>)
  profile: {
    displayName: string | null;
    photoURL: string | null;
    username: string | null;
    language_code: string | null;
    is_premium: boolean;
  };
}
