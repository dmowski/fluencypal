export interface EnglishB2ExamImage {
  imageUrl: string;
  imageDescription: string;
  promptText: string;
}

export const ENGLISH_B2_EXAM_IMAGES: EnglishB2ExamImage[] = [
  {
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-handshake-between-two-businesspeople.webp?alt=media',
    imageDescription:
      'Two business professionals in formal attire shake hands across a conference table in a bright modern office. One person holds a folder with documents while the other smiles and maintains eye contact. Laptops and notepads are visible on the table.',
    promptText:
      'Describe the business meeting scene in detail. Mention who is present, what they are doing, and the setting.',
  },
  {
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-doctor-talking-to-a-patient.webp?alt=media',
    imageDescription:
      'A doctor wearing a white coat sits on a stool beside an examination bed, speaking calmly to a seated patient. The doctor gestures toward a clipboard with notes while medical equipment and a wall chart appear in the background.',
    promptText:
      'Describe what is happening in this medical consultation. Include the people, their actions, and the environment.',
  },
  {
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-group-of-tourists-taking-photos.webp?alt=media',
    imageDescription:
      'Three tourists stand in a historic city square, holding smartphones to photograph a landmark fountain. Stone buildings with balconies rise behind them, and other pedestrians walk through the sunny plaza.',
    promptText:
      'Describe the travel scene. Say where the tourists are, what they are doing, and what you notice about the location.',
  },
  {
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-person-looking-confused-at-a-map.webp?alt=media',
    imageDescription:
      'A young traveler with a backpack stands on a busy sidewalk, unfolding a paper map with a puzzled expression. Pedestrians pass by, shop signs line the street, and a bus stop is visible nearby.',
    promptText:
      'Describe the traveler and the situation. Explain what suggests they may be lost or uncertain.',
  },
  {
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2Fa-teacher-writing-on-a-whiteboard.webp?alt=media',
    imageDescription:
      'A teacher stands at the front of a classroom, writing vocabulary terms on a whiteboard with a blue marker. Students sit at desks facing forward, notebooks open, while educational posters hang on the walls.',
    promptText:
      'Describe the classroom lesson. Mention the teacher, the students, and what is happening during the class.',
  },
];
