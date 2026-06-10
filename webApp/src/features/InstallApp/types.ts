export type MobilePlatform = 'ios' | 'android' | 'other';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
