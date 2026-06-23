/**
 * Source catalog for `/public/examQuiz/` speaking photos.
 * Regenerate assets: `pnpm --dir webApp generate:exam-quiz-images`
 */
export interface ExamQuizImageSpec {
  id: string;
  fileName: string;
  /** OpenAI image generation prompt. */
  generationPrompt: string;
}

const EXAM_PHOTO_STYLE =
  'Photorealistic candid photograph taken on a real camera for a B1 language exam. Natural daylight, eye-level framing, authentic textures and imperfections, everyday European city setting, documentary feel, no text overlays, no logos, no watermarks, not illustrated, not CGI, not stylized.';

export const EXAM_QUIZ_IMAGE_SPECS: ExamQuizImageSpec[] = [
  {
    id: 'park',
    fileName: 'park-family.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A family walks along a tree-lined path in a city park. Children ride bicycles while adults push a stroller. Benches, flower beds, and a small pond with ducks in the background.`,
  },
  {
    id: 'cafe',
    fileName: 'cafe-friends.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Two friends sit at a small table in a cozy café, each holding a cup of coffee. Pastries on the table, warm lighting, potted plants, chalkboard menu in the background.`,
  },
  {
    id: 'train',
    fileName: 'train-platform.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Passengers wait on a regional train platform as a train approaches. A couple checks a timetable board, a student reads on a bench, suitcases near the yellow safety line.`,
  },
  {
    id: 'library',
    fileName: 'library-reading.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A quiet public library reading room. Two adults browse bookshelves while a student reads at a wooden table with a laptop and notebook open.`,
  },
  {
    id: 'pharmacy',
    fileName: 'pharmacy-customer.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Inside a modern pharmacy, a pharmacist in a white coat speaks with a customer at the counter. Medicine shelves and a green cross sign visible in the background.`,
  },
  {
    id: 'bakery',
    fileName: 'bakery-counter.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A bakery shop counter filled with fresh bread, rolls, and pastries under glass. A baker in an apron hands a paper bag to a smiling customer.`,
  },
  {
    id: 'postOffice',
    fileName: 'post-office.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A customer at a post office counter talks with a clerk while holding a small parcel. Mailboxes, scales, and queue ropes visible in a bright municipal office.`,
  },
  {
    id: 'gym',
    fileName: 'gym-class.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A small group fitness class in a gym. An instructor demonstrates an exercise while participants follow on yoga mats. Mirrors and exercise equipment in the background.`,
  },
  {
    id: 'swimmingPool',
    fileName: 'swimming-pool.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} An indoor swimming pool with lane dividers. A swim coach stands at the pool edge giving instructions to two adults in the water wearing caps.`,
  },
  {
    id: 'bicycle',
    fileName: 'city-cyclists.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Two cyclists ride along a dedicated bike lane in a European city on a sunny day. Trees, apartment buildings, and parked cars line the street.`,
  },
  {
    id: 'snowStreet',
    fileName: 'winter-street.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A snowy city street in winter. Pedestrians in warm coats walk past shop windows, light snow falling, bare trees and a bus in the distance.`,
  },
  {
    id: 'beach',
    fileName: 'beach-walkers.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A sandy beach on a mild summer day. A couple and a child walk near the shoreline with gentle waves, beach grass, and a distant pier.`,
  },
  {
    id: 'wedding',
    fileName: 'outdoor-wedding.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} An outdoor wedding ceremony in a garden. A small group of guests seated on white chairs facing the couple and officiant, flowers and string lights visible.`,
  },
  {
    id: 'birthday',
    fileName: 'birthday-party.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A home birthday party for a child. Colorful balloons, a cake with candles on a table, parents and children clapping in a bright living room.`,
  },
  {
    id: 'streetMusician',
    fileName: 'street-musician.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A street musician plays guitar on a cobblestone city square. An open case for tips, a few pedestrians stopping to listen, historic buildings behind.`,
  },
  {
    id: 'bikeRepair',
    fileName: 'bike-repair-shop.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A bicycle repair shop. A mechanic in work clothes fixes a bike on a stand while the owner watches. Tools, tires, and other bicycles on the wall.`,
  },
  {
    id: 'balconyGarden',
    fileName: 'balcony-garden.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} A woman tends potted herbs and flowers on an apartment balcony. Watering can, city rooftops and a church tower visible in the background.`,
  },
  {
    id: 'busStop',
    fileName: 'bus-stop.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} People waiting at a city bus stop shelter. A route map on the glass, one person checking a phone, another holding a shopping bag, bus approaching.`,
  },
  {
    id: 'museum',
    fileName: 'museum-visitors.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Visitors in a bright art museum gallery. Two adults and a teenager look at a large painting on a white wall, polished floor and bench nearby.`,
  },
  {
    id: 'football',
    fileName: 'kids-football.webp',
    generationPrompt: `${EXAM_PHOTO_STYLE} Children play football on a grassy school field. One child kicks the ball while teammates and a coach in a tracksuit watch on a mild afternoon.`,
  },
];

/** One unique photo per variant v01–v27; v28–v30 reuse the first three legacy images. */
export const SPEAKING_VARIANT_PHOTO_KEYS = [
  'cooking',
  'tourists',
  'market',
  'doctor',
  'teacher',
  'handshake',
  'map',
  'park',
  'cafe',
  'train',
  'library',
  'pharmacy',
  'bakery',
  'postOffice',
  'gym',
  'swimmingPool',
  'bicycle',
  'snowStreet',
  'beach',
  'wedding',
  'birthday',
  'streetMusician',
  'bikeRepair',
  'balconyGarden',
  'busStop',
  'museum',
  'football',
  'cooking',
  'market',
  'tourists',
] as const;

export type ExamQuizImageId = (typeof EXAM_QUIZ_IMAGE_SPECS)[number]['id'];

export type PolishB1SpeakingPhotoKey =
  | ExamQuizImageId
  | 'cooking'
  | 'market'
  | 'tourists'
  | 'doctor'
  | 'teacher'
  | 'handshake'
  | 'map';
