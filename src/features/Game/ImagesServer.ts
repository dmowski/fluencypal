interface ImageDescriptionShort {
  shortDescription: string;
  fullImageDescription: string;
}

interface ImageDescription {
  shortDescription: string;
  fullImageDescription: string;
  url: string;
  id: string;
}

const imageDescriptionsRaw: ImageDescriptionShort[] = [
  {
    shortDescription: "A cup of coffee on a table",
    fullImageDescription:
      "A steaming cup of black coffee on a wooden table near a window, soft morning light, cozy atmosphere",
  },
  {
    shortDescription: "A backpack with school supplies",
    fullImageDescription:
      "An open backpack filled with colorful notebooks, pens, and a calculator, placed on a classroom desk",
  },
  {
    shortDescription: "A bicycle leaning on a wall",
    fullImageDescription:
      "A classic vintage bicycle with a basket, leaning on a brick wall on a sunny day, slight shadows",
  },
  {
    shortDescription: "A pair of sunglasses on the sand",
    fullImageDescription:
      "Stylish black sunglasses resting on golden beach sand, sunlit, ocean blurred in the background",
  },
  {
    shortDescription: "A set of keys with a keychain",
    fullImageDescription:
      "A set of metallic house keys attached to a leather keychain, lying on a marble countertop",
  },
  {
    shortDescription: "A person brushing their teeth",
    fullImageDescription:
      "A person standing in front of a bathroom mirror, brushing their teeth with a blue toothbrush, foam around the mouth, morning routine setting",
  },
  {
    shortDescription: "Someone cooking in the kitchen",
    fullImageDescription:
      "A person cooking a meal in a modern kitchen, stirring a pot on the stove, fresh vegetables on the counter, warm lighting",
  },
  {
    shortDescription: "A man reading a newspaper",
    fullImageDescription:
      "A man sitting at a breakfast table with a cup of coffee, reading a large folded newspaper, wearing glasses, sunlight through the window",
  },
  {
    shortDescription: "A woman writing in a notebook",
    fullImageDescription:
      "A woman sitting at a desk writing notes in a spiral-bound notebook, surrounded by books and a laptop, focused expression",
  },
  {
    shortDescription: "A child tying their shoelaces",
    fullImageDescription:
      "A small child sitting on a doorstep tying the laces of their sneakers, wearing a backpack, ready for school",
  },
];

const convertNameIntoId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const getPublicUrl = (name: string): string => {
  const id = convertNameIntoId(name);
  return `https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2F${id}.webp?alt=media`;
};

export const imageDescriptions: ImageDescription[] = imageDescriptionsRaw.map((desc) => ({
  ...desc,
  id: convertNameIntoId(desc.shortDescription),
  url: getPublicUrl(desc.shortDescription),
}));
