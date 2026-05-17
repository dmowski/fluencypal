import type { ReaderLibraryCategory } from '@/features/Reader/model/library';
import categories from './categories.json';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  return Response.json({ categories: categories as ReaderLibraryCategory[] });
}
