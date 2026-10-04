import { fetchGroupConversationSchedule } from '@/features/Feature/safeGroupCalls';

export async function GET() {
  try {
    const calls = await fetchGroupConversationSchedule();
    return Response.json(
      { calls },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch {
    return Response.json({ calls: [] }, { status: 502 });
  }
}
