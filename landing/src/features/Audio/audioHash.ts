import { getHash } from '@/libs/hash';

const getTextHash = (text: string): string => {
  // For short texts, use the text itself as the hash to avoid unnecessary hashing overhead
  if (text.length < 4) {
    return getHash(text);
  }
  // split text into 4 chunks and hash each chunk, then combine the hashes
  const chunkSize = Math.ceil(text.length / 4);
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  const chunkHashes = chunks.map((chunk) => getHash(chunk));
  return chunkHashes.join('');
};

export const getAudioHash = (text: string, instructions: string, voice: string): string => {
  let textHash = getTextHash(text);

  const data = [instructions, voice]
    .filter(Boolean)
    .map((part) => getHash(part))
    .join('-');

  return textHash + '-' + data;
};
