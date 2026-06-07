import { getImagePublicUrl } from '@/features/Game/ImagesDescriptions';
import { ExamSpeakingImage } from './examContentTypes';

const SHARED_IMAGE_URLS = {
  handshake:
    'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-handshake-between-two-businesspeople.webp?alt=media',
  doctor:
    'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-doctor-talking-to-a-patient.webp?alt=media',
  tourists:
    'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-group-of-tourists-taking-photos.webp?alt=media',
  map: 'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-person-looking-confused-at-a-map.webp?alt=media',
  teacher:
    'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-teacher-writing-on-a-whiteboard.webp?alt=media',
  cooking: getImagePublicUrl('Someone cooking in the kitchen'),
  market: getImagePublicUrl('A farmer’s market with vegetables and fruits'),
} as const;

const IMAGE_GROUND_TRUTH = {
  handshake:
    'Two business professionals in formal attire shake hands across a conference table in a bright modern office. One person holds a folder with documents while the other smiles and maintains eye contact. Laptops and notepads are visible on the table.',
  doctor:
    'A doctor wearing a white coat sits on a stool beside an examination bed, speaking calmly to a seated patient. The doctor gestures toward a clipboard with notes while medical equipment and a wall chart appear in the background.',
  tourists:
    'Four tourists stand in a historic city square, holding smartphones to photograph a landmark fountain. Stone buildings with balconies rise behind them, and other pedestrians walk through the sunny plaza.',
  map: 'A young traveler with a backpack stands on a busy sidewalk, unfolding a paper map with a puzzled expression. Pedestrians pass by, shop signs line the street, and a bus stop is visible nearby.',
  teacher:
    'A teacher stands at the front of a classroom, writing vocabulary terms on a whiteboard with a blue marker. Students sit at desks facing forward, notebooks open, while educational posters hang on the walls.',
  cooking:
    'A person cooks a meal in a modern kitchen, stirring a pot on the stove while fresh vegetables lie on the counter. Warm lighting fills the room and kitchen utensils hang nearby.',
  market:
    'A lively farmers market stall displays colourful vegetables and fruits arranged in wooden crates. Vendors talk with customers under canvas awnings on a city street.',
} as const;

export const ENGLISH_EXAM_SPEAKING_IMAGES: ExamSpeakingImage[] = [
  {
    imageUrl: SHARED_IMAGE_URLS.handshake,
    imageDescription: IMAGE_GROUND_TRUTH.handshake,
    promptText:
      'Describe the business meeting scene in detail. Mention who is present, what they are doing, and the setting.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.doctor,
    imageDescription: IMAGE_GROUND_TRUTH.doctor,
    promptText:
      'Describe what is happening in this medical consultation. Include the people, their actions, and the environment.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.tourists,
    imageDescription: IMAGE_GROUND_TRUTH.tourists,
    promptText:
      'Describe the travel scene. Say where the tourists are, what they are doing, and what you notice about the location.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.map,
    imageDescription: IMAGE_GROUND_TRUTH.map,
    promptText:
      'Describe the traveler and the situation. Explain what suggests they may be lost or uncertain.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.teacher,
    imageDescription: IMAGE_GROUND_TRUTH.teacher,
    promptText:
      'Describe the classroom lesson. Mention the teacher, the students, and what is happening during the class.',
  },
];

export const POLISH_EXAM_SPEAKING_IMAGES: ExamSpeakingImage[] = [
  {
    imageUrl: SHARED_IMAGE_URLS.cooking,
    imageDescription: IMAGE_GROUND_TRUTH.cooking,
    promptText:
      'Opisz scenę w kuchni. Powiedz, co robi osoba na zdjęciu, co znajduje się na blacie i jaka jest atmosfera.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.market,
    imageDescription: IMAGE_GROUND_TRUTH.market,
    promptText:
      'Opisz targ i ludzi na zdjęciu. Wymień produkty, które widzisz, i powiedz, co się dzieje.',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.tourists,
    imageDescription: IMAGE_GROUND_TRUTH.tourists,
    promptText: 'Opisz scenę turystyczną. Gdzie są ludzie, co robią i co widać w tle?',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.doctor,
    imageDescription: IMAGE_GROUND_TRUTH.doctor,
    promptText: 'Opisz wizytę lekarską. Kim są osoby na zdjęciu i co robi lekarz?',
  },
  {
    imageUrl: SHARED_IMAGE_URLS.teacher,
    imageDescription: IMAGE_GROUND_TRUTH.teacher,
    promptText:
      'Opisz lekcję w klasie. Co robi nauczyciel, jak wyglądają uczniowie i co dzieje się na tablicy?',
  },
];
