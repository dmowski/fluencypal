import { NextRequest, NextResponse } from 'next/server';
import { getBucket, getDB, validateAuthToken } from '@/app/api/config/firebase';
import { sendEmail } from '@/app/api/email/sendEmail';
import { appName } from '@/features/SEO/appInfo';
import { ReaderBookDoc } from '@/features/Reader/server/readerBookDoc';

const BOOKS_PREFIX = 'books/';
// Kindle accepts up to 50 MB per email attachment.
const MAX_FILE_SIZE = 50 * 1024 * 1024;
// Basic kindle email pattern — must end in @kindle.com or @free.kindle.com
const KINDLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.kindle\.com$/i;

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

  const { bookId, kindleEmail } = body as Record<string, unknown>;

  if (typeof bookId !== 'string' || !bookId.trim()) {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
  }
  if (typeof kindleEmail !== 'string' || !KINDLE_EMAIL_RE.test(kindleEmail.trim())) {
    return NextResponse.json(
      { error: 'kindleEmail must be a valid Kindle address (e.g. yourname@kindle.com)' },
      { status: 400 },
    );
  }

  const sanitizedKindleEmail = kindleEmail.trim().toLowerCase();

  // Verify caller owns this book.
  let epubStoragePath: string;
  let bookTitle: string;
  try {
    const firestoreDb = getDB();
    const bookDoc = await firestoreDb.collection('books').doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const bookData = bookDoc.data() as ReaderBookDoc;

    const isOwner = bookData.ownerUserId === userInfo.uid;
    const isCollaborator = bookData.userIds?.includes(userInfo.uid) ?? false;
    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // The EPUB path is the canonical reading source in convertedFiles.
    const epubPath = bookData.convertedFiles?.epub || null;
    if (!epubPath) {
      return NextResponse.json({ error: 'No EPUB file available for this book' }, { status: 400 });
    }

    // Security: path must be within the book's storage namespace.
    const expectedPrefix = `${BOOKS_PREFIX}${bookId}/`;
    if (!epubPath.startsWith(expectedPrefix) || epubPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid storage path' }, { status: 403 });
    }

    epubStoragePath = epubPath;
    bookTitle = bookData.title ?? 'Book';
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const bucket = getBucket();

    const [metadata] = await bucket.file(epubStoragePath).getMetadata();
    const fileSize = Number((metadata as Record<string, unknown>).size ?? 0);
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'EPUB is too large to send via email (max 50 MB)' },
        { status: 400 },
      );
    }

    const [fileBuffer] = await bucket.file(epubStoragePath).download();

    const epubFileName = epubStoragePath.split('/').pop() ?? 'book.epub';
    let decodedFileName: string;
    try {
      decodedFileName = decodeURIComponent(epubFileName);
    } catch {
      decodedFileName = epubFileName;
    }
    // Ensure .epub extension.
    const attachmentName = decodedFileName.endsWith('.epub')
      ? decodedFileName
      : `${decodedFileName}.epub`;

    await sendEmail({
      emailTo: sanitizedKindleEmail,
      title: bookTitle,
      messageText: `Your book "${bookTitle}" from ${appName} is attached as an EPUB file.`,
      messageHtml: `<p>Your book <strong>${bookTitle}</strong> from ${appName} is attached as an EPUB file.</p>`,
      attachments: [{ filename: attachmentName, content: fileBuffer }],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[reader/sendToKindle] error', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
