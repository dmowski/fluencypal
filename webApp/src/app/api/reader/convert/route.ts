import { NextRequest, NextResponse } from 'next/server';
import { getBucket, getDB, validateAuthToken } from '@/app/api/config/firebase';
import { convertToEpub } from './converter';

const BOOKS_PREFIX = 'books/';
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  let userInfo: Awaited<ReturnType<typeof validateAuthToken>>;
  try {
    userInfo = await validateAuthToken(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { storagePath, fileName, bookId } = body as Record<string, unknown>;

  if (typeof storagePath !== 'string' || !storagePath.trim()) {
    return NextResponse.json({ error: 'storagePath is required' }, { status: 400 });
  }
  if (typeof fileName !== 'string' || !fileName.trim()) {
    return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
  }
  if (typeof bookId !== 'string' || !bookId.trim()) {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
  }

  // Security: path must be within the expected book namespace.
  const expectedPrefix = `${BOOKS_PREFIX}${bookId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Reject path traversal attempts.
  if (storagePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
  }

  // Security: verify the caller is the owner of this book in Firestore.
  try {
    const firestoreDb = getDB();
    const bookDoc = await firestoreDb.collection('books').doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const bookData = bookDoc.data() as { ownerUserId?: string } | undefined;
    if (bookData?.ownerUserId !== userInfo.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const bucket = getBucket();

    // Check file size via metadata before downloading.
    const [metadata] = await bucket.file(storagePath).getMetadata();
    const fileSize = Number((metadata as any).size ?? 0);
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 400 });
    }

    // Download original file from Firebase Storage.
    const [fileBuffer] = await bucket.file(storagePath).download();

    // Convert to EPUB via CloudConvert.
    const epubBuffer = await convertToEpub(fileBuffer, fileName);

    // Upload the converted EPUB back into the book's storage folder.
    // Do NOT use encodeURIComponent here — Firebase Storage paths are not URLs;
    // the SDK handles URI encoding internally. Using it creates a double-encoding
    // mismatch between the Admin SDK upload path and the client SDK download path.
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const epubPath = `${BOOKS_PREFIX}${bookId}/converted_${baseName}.epub`;

    await bucket.file(epubPath).save(epubBuffer, {
      contentType: 'application/epub+zip',
      resumable: false,
    });

    return NextResponse.json({ epubBlobPath: epubPath });
  } catch (error) {
    console.error('[reader/convert] error', error);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
