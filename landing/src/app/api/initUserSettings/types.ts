import { UserSource } from '@/features/Analytics/analytics';

export interface InitUserSettingsRequest {
  currency: string | null;
  country: string | null;
  countryName: string | null;
  userSource: UserSource | null;
  photoUrl: string;
  displayName: string;
}

export interface InitUserSettingsResponse {
  status: 'initialized' | 'already_initialized';
}
