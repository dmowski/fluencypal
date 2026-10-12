const APP_ORIGIN = process.env.FLUENCY_APP_ORIGIN || 'https://app.fluencypal.com';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Add your interests and a way to reach you.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${APP_ORIGIN}/api/community-call/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      return Response.json(
        { error: payload?.error || 'Could not send that. Please try again.' },
        { status: response.status },
      );
    }
    return Response.json({ error: '' });
  } catch {
    return Response.json({ error: 'Could not send that. Please try again.' }, { status: 502 });
  }
}
