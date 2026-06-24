import type { Metadata } from 'next';
import {
  BookLandingPageNext,
  generateBookLandingMetadata,
} from '@/features/Reader/Landing/BookLandingPageNext';

export async function generateMetadata(): Promise<Metadata> {
  return generateBookLandingMetadata();
}

export default function BookLandingRoutePage() {
  return <BookLandingPageNext />;
}
