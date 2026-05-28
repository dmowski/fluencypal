import { NewsItem, NewsItemSummary } from '@/features/News/types';
import { validateAuthToken } from '@/app/api/config/firebase';

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Validates the auth token and parses the JSON body in one step.
 * Throws an HttpError(401) on auth failure, which `withRoute` maps to a 401 response.
 */
export const parseAuthenticatedJson = async <T>(request: Request): Promise<Partial<T>> => {
  try {
    await validateAuthToken(request);
  } catch {
    throw new HttpError(401, 'Unauthorized');
  }
  return request.json() as Promise<Partial<T>>;
};

/**
 * Wraps a route handler so that HttpErrors become their corresponding status responses
 * and any other thrown error becomes a 500.
 */
export const withRoute =
  (handler: (request: Request) => Promise<Response>) =>
  async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return new Response(error.message, { status: error.status });
      }
      return new Response('Internal Server Error', { status: 500 });
    }
  };

export const toNewsItemSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  languageCode: item.languageCode,
  category: item.category ?? 'general',
  tags: item.tags ?? [],
});
