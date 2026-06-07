import { ExamSpeakingImage } from './examContentTypes';

const SHARED_IMAGE_URLS = {
  handshake:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824559642-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  doctor:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824572461-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  tourists:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824586105-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  map: 'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824598149-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  teacher:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824613170-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  cooking:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824624093-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
  market:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780824634502-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.webp',
} as const;

const IMAGE_GROUND_TRUTH = {
  handshake:
    'A man in a navy suit and a woman in a dark blazer are smiling and shaking hands across a glass-topped table in a modern, well-lit office with floor-to-ceiling windows showing a cityscape. The man holds a black clipboard with a document. The table has two laptops, open notepads with pens, a coffee mug, and a glass of water. Several other professionals are working in the glass-walled background.',
  doctor:
    'In a clean medical examination room, a doctor wearing a white coat and a stethoscope sits on a stool beside an examination bed. He points to notes on a clipboard while speaking calmly to a female patient seated on the bed. The patient listens attentively with her hands clasped in her lap. Medical instruments, cabinets, a sink, and a muscular-system chart are visible in the background.',
  tourists:
    'Four tourists stand beside a large ornate stone fountain in a sunny historic city square. Each person holds up a smartphone to photograph the fountain. The group includes two men and two women, some carrying backpacks and one wearing a straw hat. Warm-colored stone buildings with balconies and shuttered windows rise behind them, while crowds of pedestrians walk through the busy plaza. The scene appears to be in Rome, Italy.',
  map: 'A young traveler wearing a dark T-shirt, khaki shorts, and a large black backpack stands on a crowded city sidewalk, studying an unfolded paper map with a puzzled expression. Pedestrians walk past him in both directions, while coffee shops, souvenir stores, and other storefronts line the street. A bus stop with route information and a city bus are visible nearby, with tall buildings and a clock tower in the background.',
  teacher:
    'A teacher stands at the front of a bright classroom, writing vocabulary words and definitions on a large whiteboard with a blue marker. Four students sit at desks facing the board with notebooks and books open. Educational posters about classroom rules, parts of speech, and punctuation hang on the walls, creating an organized learning environment.',
  cooking:
    'A young woman cooks in a modern kitchen, stirring a large pot on a gas stove while holding its handle. Fresh carrots, tomatoes, bell peppers, and leafy greens are arranged on a cutting board in the foreground. Metal utensils and a frying pan hang beside the stove, while warm lighting and potted herbs create a cozy atmosphere.',
  market:
    'A busy farmers market stall is filled with colorful produce arranged in wooden crates, including tomatoes, peppers, carrots, leafy greens, apples, oranges, and berries. Two vendors wearing aprons smile and speak with customers standing in front of the display. Canvas awnings cover the stall, while more shoppers and market stands extend along the sunny city street.',
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
