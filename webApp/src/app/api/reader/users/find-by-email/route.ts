import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, getUserByEmail } from '../../../config/firebase';

export async function GET(request: NextRequest) {
  try {
    await validateAuthToken(request);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const rawEmail = request.nextUrl.searchParams.get('email');
  if (!rawEmail) {
    return new Response('email query param is required', { status: 400 });
  }

  const email = rawEmail.toLowerCase().trim();

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ uid: null }, { status: 404 });
  }

  return NextResponse.json({ uid: user.uid });
}
