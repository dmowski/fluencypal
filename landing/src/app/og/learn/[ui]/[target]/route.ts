import { learnOgImageResponse } from '@/features/LearnLanding/ogImage';
import { isLearnPageLocale, isLearnTarget } from '@/features/LearnLanding/targets';

interface RouteProps {
  params: Promise<{ ui: string; target: string }>;
}

export const runtime = 'nodejs';

export async function GET(_request: Request, props: RouteProps) {
  const { ui, target } = await props.params;
  if (!isLearnPageLocale(ui) || !isLearnTarget(target)) {
    return new Response('Not found', { status: 404 });
  }

  return learnOgImageResponse(ui, target);
}
