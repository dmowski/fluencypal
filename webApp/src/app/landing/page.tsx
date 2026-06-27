import type { Metadata, Viewport } from 'next';
import {
  BookLandingPageNext,
  generateBookLandingMetadata,
  generateBookLandingViewport,
} from '@/features/Reader/Landing/BookLandingPageNext';

export async function generateMetadata(): Promise<Metadata> {
  return generateBookLandingMetadata();
}

export function generateViewport(): Viewport {
  return generateBookLandingViewport();
}

export default function BookLandingRoutePage() {
  return <BookLandingPageNext />;
}
