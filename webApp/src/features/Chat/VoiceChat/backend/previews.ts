import { generateImageBuffer } from '@/app/api/images/generateImage';
import { uploadImage } from '@/app/api/images/uploadImage';
import { SpeakingClubError } from './http';

const promptForRoom = (title: string, subtitle: string, variant: number): string => {
  const moods = [
    'warm evening light, a small group talking around a table',
    'bright morning, friends sharing a story, soft colors',
    'cozy room with plants, people listening and smiling',
    'gentle outdoor meetup, conversation, no logos',
  ];
  return [
    `A friendly illustration for a speaking club called "${title}".`,
    subtitle,
    moods[variant % moods.length],
    'No text, no letters, no watermark. Inviting, calm, and easy to look at.',
  ].join(' ');
};

export const generateRoomPreviewUrls = async (params: {
  title: string;
  subtitle: string;
  count: number;
}): Promise<string[]> => {
  const count = Math.max(1, Math.min(4, Math.trunc(params.count) || 3));
  const results = await Promise.all(
    Array.from({ length: count }, async (_item, index) => {
      try {
        const buffer = await generateImageBuffer(
          promptForRoom(params.title, params.subtitle, Date.now() + index),
        );
        return await uploadImage({
          imageBuffer: buffer,
          extension: 'png',
          name: `speaking-club-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}.png`,
        });
      } catch (error) {
        console.error('Room preview image failed', error);
        return '';
      }
    }),
  );
  const urls = results.filter((url) => url.startsWith('https://') || url.startsWith('http://'));
  if (urls.length === 0) {
    console.error('Room preview urls were empty', results);
    throw new SpeakingClubError('Pictures could not be created. Try again in a moment.');
  }
  return urls;
};
