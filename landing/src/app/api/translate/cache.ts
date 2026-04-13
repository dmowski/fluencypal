import { getHash } from '@/libs/hash';
import { TranslateCacheEntry, TranslateRequest, TranslateResponse } from './types';
import { getDB } from '../config/firebase';
import { sendTelegramMessageServer } from '../telegram/sendTelegramMessage';

export const getTranslateCacheHash = (request: TranslateRequest): string => {
  const partsToHash = [request.text, request.sourceLanguage, request.targetLanguage];
  const hash = partsToHash.map((part) => getHash(part ?? '-')).join('-');

  return hash;
};

export const getTranslateCache = async (
  request: TranslateRequest,
): Promise<TranslateResponse | null> => {
  try {
    const hash = getTranslateCacheHash(request);
    const db = getDB();
    const doc = db.collection('cache').doc('translate').collection('text').doc(hash);
    const docData = await doc.get();
    if (docData.exists) {
      const data = docData.data() as TranslateCacheEntry;
      if (data.request.text !== request.text) {
        // This should never happen if hashing is correct, but just in case
        sendTelegramMessageServer(
          `Translate cache hash collision detected! Request text: "${request.text}", Cached request text: "${data.request.text}". Hash: ${hash}`,
        );
        return null;
      }

      return data.response;
    }
    return null; // Return null if not found
  } catch (error) {
    sendTelegramMessageServer(`Error accessing translate cache: ${(error as Error).message}`);
    return null;
  }
};

export const saveTranslateCache = async (
  request: TranslateRequest,
  response: TranslateResponse,
): Promise<void> => {
  try {
    const hash = getTranslateCacheHash(request);
    const db = getDB();
    const doc = db.collection('cache').doc('translate').collection('text').doc(hash);
    const cacheEntry: TranslateCacheEntry = {
      request,
      response,
      createdAtIso: new Date().toISOString(),
    };
    await doc.set(cacheEntry);
  } catch (error) {
    sendTelegramMessageServer(`Error saving translate cache: ${(error as Error).message}`);
  }
};
