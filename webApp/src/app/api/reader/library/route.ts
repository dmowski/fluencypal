import { getReaderLibraryCategories } from '@/features/Reader/server/gutenberg';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  try {
    const categories = await getReaderLibraryCategories();
    return Response.json({ categories });
  } catch (error) {
    console.error('GET /api/reader/library failed', error);
    return Response.json({ error: 'Failed to load library.' }, { status: 502 });
  }
}
