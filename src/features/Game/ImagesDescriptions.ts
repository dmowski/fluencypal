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

  {
    shortDescription: "A surprised man opening a gift",
    fullImageDescription:
      "A man with wide eyes and open mouth, unwrapping a present in a cozy living room, expressive joyful reaction",
  },
  {
    shortDescription: "A crying child holding a teddy bear",
    fullImageDescription:
      "A small child with tears running down their face, hugging a worn teddy bear tightly while sitting on the floor",
  },
  {
    shortDescription: "A couple laughing together",
    fullImageDescription:
      "Two people sitting close together, laughing heartily, one with a hand on the other’s shoulder, warm and candid moment",
  },
  {
    shortDescription: "A person feeling bored at work",
    fullImageDescription:
      "A bored office worker slouched at a desk, head resting on one hand, looking at a computer screen with frustration",
  },
  {
    shortDescription: "A scared person watching a horror movie",
    fullImageDescription:
      "A person sitting on a couch covering their mouth in fear, eyes wide, illuminated only by the glow of the TV screen",
  },

  // Food and Eating
  {
    shortDescription: "A person eating spaghetti",
    fullImageDescription:
      "A person twirling spaghetti with a fork at a dinner table, tomato sauce on the plate, mid-bite moment",
  },
  {
    shortDescription: "A picnic with fruits and sandwiches",
    fullImageDescription:
      "A picnic blanket on the grass with a basket, plates of fresh fruits, sandwiches, and lemonade on a sunny day",
  },
  {
    shortDescription: "A chef cutting vegetables",
    fullImageDescription:
      "A chef in a kitchen cutting colorful vegetables on a wooden board, with knives and spices nearby, in action",
  },
  {
    shortDescription: "A table full of desserts",
    fullImageDescription:
      "A dessert table filled with cakes, cupcakes, macarons, and fruit tarts, decorated with flowers and candles",
  },
  {
    shortDescription: "A person drinking juice from a straw",
    fullImageDescription:
      "A person sipping orange juice through a straw from a tall glass, sitting at an outdoor café table",
  },

  // Travel and Transportation
  {
    shortDescription: "A person boarding an airplane",
    fullImageDescription:
      "A traveler walking up stairs into an airplane with a carry-on bag, sunset in the background, airport ground visible",
  },
  {
    shortDescription: "A taxi in a busy city street",
    fullImageDescription:
      "A yellow taxi stuck in traffic among cars and buses on a crowded city street, tall buildings around",
  },
  {
    shortDescription: "A group of tourists taking photos",
    fullImageDescription:
      "A group of excited tourists pointing cameras at a landmark, backpacks and sunglasses, joyful expressions",
  },
  {
    shortDescription: "A train station platform",
    fullImageDescription:
      "A wide train platform with people waiting, a train arriving in the background, digital signs above",
  },
  {
    shortDescription: "A family packing for vacation",
    fullImageDescription:
      "Parents and kids putting clothes and items into suitcases, travel bags open on the floor, excited energy",
  },

  // Weather and Seasons
  {
    shortDescription: "A snowy mountain with skiers",
    fullImageDescription:
      "Snow-covered mountains with several skiers descending the slopes under a blue sky, pine trees in the distance",
  },
  {
    shortDescription: "A person walking in the rain with an umbrella",
    fullImageDescription:
      "A person in a raincoat holding a colorful umbrella, walking on a wet city street with puddles reflecting lights",
  },
  {
    shortDescription: "A sunny beach with palm trees",
    fullImageDescription:
      "A tropical beach scene with golden sand, palm trees swaying, clear blue water and sunshine",
  },
  {
    shortDescription: "Autumn leaves falling from trees",
    fullImageDescription:
      "A park path covered in orange and red leaves, trees shedding foliage, a light breeze carrying leaves through the air",
  },
  {
    shortDescription: "A thunderstorm at night",
    fullImageDescription:
      "A dark sky lit up by a bolt of lightning, rain pouring down, city buildings silhouetted in the background",
  },

  // Animals and Nature
  {
    shortDescription: "A cat sleeping on a window sill",
    fullImageDescription:
      "A fluffy cat curled up and sleeping peacefully on a sunlit window sill with soft shadows",
  },
  {
    shortDescription: "A dog playing with a ball",
    fullImageDescription:
      "A happy dog running on grass with a ball in its mouth, ears flopping, tail wagging",
  },
  {
    shortDescription: "Birds flying over a lake",
    fullImageDescription:
      "A flock of birds soaring in the sky above a calm lake surrounded by trees, sunset reflections on the water",
  },
  {
    shortDescription: "A horse in a meadow",
    fullImageDescription:
      "A brown horse standing in a green meadow with wildflowers, mountains in the distance",
  },
  {
    shortDescription: "A fish swimming in a coral reef",
    fullImageDescription:
      "A colorful fish gliding through a coral reef with vibrant sea plants, underwater sunlight filtering through",
  },

  // City and Environment
  {
    shortDescription: "A street musician playing guitar",
    fullImageDescription:
      "A man playing an acoustic guitar on a city sidewalk, open case for tips, people passing by",
  },
  {
    shortDescription: "People crossing a busy intersection",
    fullImageDescription:
      "Crowds of people crossing a wide street at a city intersection, surrounded by traffic and tall buildings",
  },
  {
    shortDescription: "A farmer’s market with vegetables and fruits",
    fullImageDescription:
      "Stalls filled with colorful produce, handwritten signs, people browsing and chatting at a sunny farmer’s market",
  },
  {
    shortDescription: "A construction site with workers",
    fullImageDescription:
      "Construction workers in hard hats and vests operating equipment and building a structure, cranes in background",
  },
  {
    shortDescription: "A child playing in a park",
    fullImageDescription:
      "A child running near a playground, green grass, swings and slides visible in the background",
  },

  // Work and Professions
  {
    shortDescription: "A doctor talking to a patient",
    fullImageDescription:
      "A doctor in a white coat explaining something to a patient, sitting across from them in a bright office",
  },
  {
    shortDescription: "A firefighter spraying water on a fire",
    fullImageDescription:
      "A firefighter in full gear holding a hose, spraying water at a burning building with smoke rising",
  },
  {
    shortDescription: "A teacher writing on a whiteboard",
    fullImageDescription:
      "A teacher writing notes with a marker on a whiteboard in a classroom, students listening in the background",
  },
  {
    shortDescription: "A baker taking bread out of the oven",
    fullImageDescription:
      "A baker pulling freshly baked bread loaves from a hot oven with a wooden peel, flour dust in the air",
  },
  {
    shortDescription: "A photographer taking a picture",
    fullImageDescription:
      "A photographer kneeling with a camera, focused on capturing a subject, blurred background for depth",
  },

  // Abstract / Challenging Scenes
  {
    shortDescription: "A mirror showing a reflection of a messy room",
    fullImageDescription:
      "A mirror hanging on a clean wall reflecting a chaotic, messy room filled with clothes and books",
  },
  {
    shortDescription: "A person looking confused at a map",
    fullImageDescription:
      "A traveler standing on a street corner, scratching their head while holding a large paper map upside down",
  },
  {
    shortDescription: "A handshake between two businesspeople",
    fullImageDescription:
      "Two professionals in suits shaking hands across a table in a modern office, laptop and documents visible",
  },
  {
    shortDescription: "A person multitasking on a computer and phone",
    fullImageDescription:
      "A busy person typing on a laptop with one hand while talking on a smartphone, multiple screens open",
  },
  {
    shortDescription: "A group of friends taking a selfie",
    fullImageDescription:
      "A group of young friends posing and smiling as one holds a phone up for a selfie, city skyline in the background",
  },
  {
    shortDescription: "A person stretching after waking up",
    fullImageDescription:
      "A sleepy person stretching their arms in bed, early morning light coming through the window",
  },
  {
    shortDescription: "A child covering their ears",
    fullImageDescription:
      "A small child covering their ears tightly, with a loud vacuum cleaner or noise in the background",
  },
  {
    shortDescription: "A person whispering a secret",
    fullImageDescription:
      "Two people standing close, one whispering into the other’s ear with a playful or serious expression",
  },
  {
    shortDescription: "A person yawning in a meeting",
    fullImageDescription:
      "An office worker sitting at a meeting table, yawning with eyes half-closed, trying to stay awake",
  },
  {
    shortDescription: "Someone rolling their eyes",
    fullImageDescription:
      "A young adult rolling their eyes dramatically, arms crossed, sarcastic or annoyed expression",
  },
  {
    shortDescription: "A person sneezing into a tissue",
    fullImageDescription:
      "A person in casual clothes sneezing into a tissue, with watery eyes, in a home or office setting",
  },
  {
    shortDescription: "Someone holding their stomach in pain",
    fullImageDescription:
      "A person hunched slightly, holding their stomach with both hands, pained expression on their face",
  },
  {
    shortDescription: "A person pointing at a sign",
    fullImageDescription:
      "A tourist pointing at a large informational sign or map in a public area, curious or confused look",
  },
  {
    shortDescription: "Two people arguing loudly",
    fullImageDescription:
      "Two adults in a heated argument, raising their hands and voices, standing face to face",
  },
  {
    shortDescription: "A group hugging each other",
    fullImageDescription:
      "A group of friends or family members tightly hugging each other in a joyful reunion setting",
  },
  {
    shortDescription: "A person wearing a raincoat and boots",
    fullImageDescription:
      "A person standing in the rain wearing a yellow raincoat and rubber boots, holding a closed umbrella",
  },
  {
    shortDescription: "A teenager trying on clothes in a store",
    fullImageDescription:
      "A teenager looking in the mirror while trying on a jacket in a clothing store fitting room",
  },
  {
    shortDescription: "A person with mismatched socks",
    fullImageDescription:
      "A person sitting on a couch with clearly mismatched socks, one striped and one polka-dotted",
  },
  {
    shortDescription: "A man tying a necktie",
    fullImageDescription:
      "A man looking in the mirror while tying a blue necktie, dressed in a shirt and slacks",
  },
  {
    shortDescription: "A girl wearing a costume at a party",
    fullImageDescription:
      "A young girl dressed in a fairy or princess costume at a birthday party with balloons and streamers",
  },
  {
    shortDescription: "A person adjusting their glasses",
    fullImageDescription:
      "A person pushing up their glasses while reading or looking at something closely",
  },
  {
    shortDescription: "A group of friends in fancy evening wear",
    fullImageDescription:
      "A group of young adults dressed in elegant dresses and suits, posing for a formal event photo",
  },
  {
    shortDescription: "A child wearing oversized shoes",
    fullImageDescription:
      "A child walking around clumsily in shoes that are far too big, laughing or smiling",
  },
  {
    shortDescription: "A person wearing a hat and scarf in summer",
    fullImageDescription:
      "A person sweating and looking uncomfortable while wearing winter clothes in hot weather",
  },
  {
    shortDescription: "A fashion model walking on a runway",
    fullImageDescription:
      "A tall model confidently walking down a fashion runway in stylish high-end clothing",
  },
  {
    shortDescription: "A person meditating in silence",
    fullImageDescription:
      "A person sitting cross-legged with closed eyes, meditating in a peaceful, quiet room",
  },
  {
    shortDescription: "Someone looking confused at a puzzle",
    fullImageDescription:
      "A person frowning and scratching their head while looking at a half-finished jigsaw puzzle",
  },
  {
    shortDescription: "A person feeling proud holding a diploma",
    fullImageDescription:
      "A graduate in a cap and gown holding up a diploma with a big smile on their face",
  },
  {
    shortDescription: "A person daydreaming while staring out the window",
    fullImageDescription:
      "A person resting their chin on their hand, lost in thought, gazing out of a window",
  },
  {
    shortDescription: "A nervous student before an exam",
    fullImageDescription:
      "A student sitting at a desk, anxiously gripping a pencil and glancing at the clock",
  },
  {
    shortDescription: "Someone having a panic attack",
    fullImageDescription:
      "A person breathing rapidly with hands on their chest, sweating, overwhelmed in an indoor setting",
  },
  {
    shortDescription: "A person deeply focused on writing",
    fullImageDescription:
      "A writer intensely typing on a laptop, surrounded by notebooks and coffee mugs",
  },
  {
    shortDescription: "A person frustrated with a broken computer",
    fullImageDescription:
      "A person banging the keyboard or holding their head in frustration near a frozen laptop",
  },
  {
    shortDescription: "A person feeling lonely in a crowd",
    fullImageDescription:
      "A person sitting alone on a bench in a busy city square, looking isolated and distant",
  },
  {
    shortDescription: "Someone jumping with excitement",
    fullImageDescription:
      "A person mid-air with arms raised and a huge smile, celebrating something great",
  },
  {
    shortDescription: "A person painting on a large canvas",
    fullImageDescription:
      "An artist standing in front of a large colorful canvas, brush in hand, in a studio space",
  },
  {
    shortDescription: "A street artist spray painting a wall",
    fullImageDescription:
      "A street artist wearing a mask creating graffiti art with spray cans on an urban wall",
  },
  {
    shortDescription: "A kid building a Lego sculpture",
    fullImageDescription:
      "A child sitting on the floor assembling a detailed Lego building with scattered bricks around",
  },
  {
    shortDescription: "A dancer frozen mid-jump",
    fullImageDescription:
      "A ballet or contemporary dancer caught in the air, arms extended, spotlight on stage",
  },
  {
    shortDescription: "A person playing the violin in the subway",
    fullImageDescription:
      "A violinist busking in a subway station, case open for tips, blurred commuters in background",
  },
  {
    shortDescription: "A sculptor shaping a statue",
    fullImageDescription:
      "A sculptor chiseling stone or molding clay with tools in a dusty workshop",
  },
  {
    shortDescription: "A group of people doing karaoke",
    fullImageDescription:
      "A lively group of friends singing into microphones at a party or karaoke bar",
  },
  {
    shortDescription: "A writer surrounded by crumpled paper",
    fullImageDescription:
      "A stressed writer at a desk with a typewriter or laptop, paper balls all around",
  },
  {
    shortDescription: "A person editing photos on a computer",
    fullImageDescription:
      "A person focused on a large monitor, using editing software with photo thumbnails visible",
  },
  {
    shortDescription: "A child drawing on a foggy window",
    fullImageDescription:
      "A child using their finger to draw shapes on a fogged-up window on a cold day",
  },
  {
    shortDescription: "A person vacuuming the living room",
    fullImageDescription:
      "A person cleaning the floor with a vacuum, moving furniture aside, in a cozy living space",
  },
  {
    shortDescription: "A family decorating a Christmas tree",
    fullImageDescription:
      "Parents and children hanging ornaments on a large tree, twinkling lights and holiday mood",
  },
  {
    shortDescription: "Someone doing laundry and folding clothes",
    fullImageDescription:
      "A person folding clean clothes on a bed, laundry basket beside them, casual indoor setting",
  },
  {
    shortDescription: "A baby crawling across the floor",
    fullImageDescription:
      "A crawling baby in a onesie exploring the living room floor with toys around",
  },
  {
    shortDescription: "A couple assembling IKEA furniture",
    fullImageDescription:
      "Two people on the floor trying to assemble a flat-pack bookshelf, surrounded by tools and manuals",
  },
  {
    shortDescription: "A person watering houseplants",
    fullImageDescription:
      "A person carefully watering indoor plants near a sunny window with shelves full of greenery",
  },
  {
    shortDescription: "A messy bedroom with clothes everywhere",
    fullImageDescription:
      "A cluttered bedroom with clothes on the floor, unmade bed, and open wardrobe",
  },
  {
    shortDescription: "A grandmother baking cookies",
    fullImageDescription:
      "An elderly woman taking fresh cookies out of the oven with an apron and a warm smile",
  },
  {
    shortDescription: "Someone fixing a leaky faucet",
    fullImageDescription:
      "A person lying under a sink with a wrench, tightening pipes, water dripping slowly",
  },
  {
    shortDescription: "A father reading a bedtime story",
    fullImageDescription:
      "A dad sitting on a child's bed reading a picture book while the child listens under a blanket",
  },
  {
    shortDescription: "A gondola ride in Venice",
    fullImageDescription:
      "A traditional gondola gliding through narrow canals of Venice, with a gondolier rowing and old buildings on each side",
  },
  {
    shortDescription: "A camel ride in the desert",
    fullImageDescription:
      "A group of people riding camels across golden desert dunes under the blazing sun, with scarves blowing in the wind",
  },
  {
    shortDescription: "A street food vendor in Bangkok",
    fullImageDescription:
      "A busy street vendor cooking noodles on a hot wok surrounded by spices and ingredients, neon signs in the background",
  },
  {
    shortDescription: "A snow-covered temple in Japan",
    fullImageDescription:
      "A peaceful Japanese temple covered in snow, with red gates and white rooftops, trees surrounding the area",
  },
  {
    shortDescription: "People dancing salsa in Havana",
    fullImageDescription:
      "A lively couple dancing salsa on the street with a crowd watching, colonial buildings and Cuban flags in the background",
  },
  {
    shortDescription: "A festival parade in Rio de Janeiro",
    fullImageDescription:
      "Brightly dressed performers dancing in a crowded street during Carnival, colorful feathers and confetti everywhere",
  },
  {
    shortDescription: "A person hiking in the Himalayas",
    fullImageDescription:
      "A solo hiker climbing a rocky trail with snow-capped Himalayan peaks in the distance, blue sky above",
  },
  {
    shortDescription: "A surfer riding a wave in Hawaii",
    fullImageDescription:
      "A person balancing on a surfboard riding a large turquoise wave, with palm trees and beach in the background",
  },
  {
    shortDescription: "Tourists in front of the Eiffel Tower",
    fullImageDescription:
      "A group of tourists taking photos and smiling in front of the Eiffel Tower on a sunny afternoon",
  },
  {
    shortDescription: "A Maasai warrior standing in the savanna",
    fullImageDescription:
      "A Maasai warrior in traditional red shuka and beaded jewelry standing tall in the African savanna at sunset",
  },

  // Children and Learning
  {
    shortDescription: "Kids sitting in a classroom",
    fullImageDescription:
      "A group of young students sitting at desks, raising their hands and listening to a teacher at the blackboard",
  },
  {
    shortDescription: "A child reading a storybook",
    fullImageDescription:
      "A child sitting cross-legged on a rug, focused on a colorful storybook, surrounded by stuffed animals",
  },
  {
    shortDescription: "A toddler playing with alphabet blocks",
    fullImageDescription:
      "A toddler stacking colorful alphabet blocks on the floor, giggling and clapping when they fall",
  },
  {
    shortDescription: "Children learning to swim",
    fullImageDescription:
      "Kids wearing swim caps and floaties in a pool, following an instructor's guidance while splashing happily",
  },
  {
    shortDescription: "A teacher showing pictures to a preschool class",
    fullImageDescription:
      "A smiling teacher holding up flashcards with animals to a group of attentive preschoolers on a rug",
  },
  {
    shortDescription: "A child counting coins",
    fullImageDescription:
      "A focused child sitting at a table, sorting and counting coins into piles with a piggy bank nearby",
  },
  {
    shortDescription: "A child playing with flashcards",
    fullImageDescription:
      "A child laying flashcards out on the floor, matching pictures and words, deep in concentration",
  },
  {
    shortDescription: "A school group visiting a zoo",
    fullImageDescription:
      "A line of children in matching shirts watching animals behind glass enclosures, holding maps and snack bags",
  },
  {
    shortDescription: "A child using a tablet for homework",
    fullImageDescription:
      "A child sitting at a desk using a tablet, with a notebook and pencil beside them, focused on the screen",
  },
  {
    shortDescription: "Kids drawing on a chalkboard",
    fullImageDescription:
      "Several children drawing colorful pictures on a large chalkboard wall, covered in doodles and shapes",
  },

  // Leisure and Lifestyle
  {
    shortDescription: "A couple watching a movie at home",
    fullImageDescription:
      "A cozy couple cuddled on a couch under a blanket, watching a movie on a big screen with popcorn and dim lights",
  },
  {
    shortDescription: "A group playing board games",
    fullImageDescription:
      "Friends gathered around a table with snacks, focused on a board game, laughing and competing",
  },
  {
    shortDescription: "People doing yoga in a park",
    fullImageDescription:
      "A group of people in a grassy park doing yoga poses on mats, morning sunlight filtering through trees",
  },
  {
    shortDescription: "Someone getting a haircut",
    fullImageDescription:
      "A person sitting in a barber chair with a cape around them, a hairdresser trimming their hair with scissors",
  },
  {
    shortDescription: "A person relaxing in a hammock",
    fullImageDescription:
      "A person laying in a hammock strung between two palm trees, eyes closed, tropical beach in background",
  },
  {
    shortDescription: "Friends having a barbecue",
    fullImageDescription:
      "A group of friends gathered around a grill in a backyard, cooking food and smiling with drinks in hand",
  },
  {
    shortDescription: "A person browsing books at a library",
    fullImageDescription:
      "A quiet individual looking through books on a shelf in a large library with wooden tables and warm lighting",
  },
  {
    shortDescription: "A girl scrolling on her phone at a café",
    fullImageDescription:
      "A young woman sitting at an outdoor café table with coffee, scrolling on her phone with sunglasses on",
  },
  {
    shortDescription: "A person planting flowers in the garden",
    fullImageDescription:
      "A person on their knees planting colorful flowers in soil, wearing gardening gloves and surrounded by plants",
  },
  {
    shortDescription: "A man fishing by a lake",
    fullImageDescription:
      "A man standing on a dock or shore with a fishing rod, peaceful lake reflecting early morning fog",
  },

  // Technology and Tools
  {
    shortDescription: "A person using VR goggles",
    fullImageDescription:
      "A person wearing virtual reality goggles, hands raised interacting with an invisible interface in a modern room",
  },
  {
    shortDescription: "A kid assembling a robot kit",
    fullImageDescription:
      "A child at a table concentrating while assembling a robot from small parts and instructions",
  },
  {
    shortDescription: "A technician repairing a smartphone",
    fullImageDescription:
      "A technician using tools to fix a smartphone on a clean workbench with tiny components nearby",
  },
  {
    shortDescription: "A person typing on a mechanical keyboard",
    fullImageDescription:
      "A person’s hands typing on a colorful mechanical keyboard, soft lighting and focus on the keys",
  },
  {
    shortDescription: "Someone connecting wires on a circuit board",
    fullImageDescription:
      "A person using a soldering iron to attach wires to a green circuit board with precision",
  },
  {
    shortDescription: "A drone flying above a field",
    fullImageDescription:
      "A quadcopter drone hovering above a green field, with hills and blue sky in the background",
  },
  {
    shortDescription: "A person using voice assistant",
    fullImageDescription:
      "A person talking to a smart speaker or phone, giving a command, in a modern home kitchen",
  },
  {
    shortDescription: "A smartwatch showing a heart rate",
    fullImageDescription:
      "A wrist with a smartwatch displaying heart rate data, person possibly jogging or walking outdoors",
  },
  {
    shortDescription: "A mechanic changing a car tire",
    fullImageDescription:
      "A mechanic crouching beside a car using a wrench to remove a tire in a garage or service center",
  },
  {
    shortDescription: "A 3D printer in action",
    fullImageDescription:
      "A close-up of a 3D printer nozzle depositing filament as it builds a plastic object layer by layer",
  },

  {
    shortDescription: "A silhouette of a person behind a curtain",
    fullImageDescription:
      "A mysterious silhouette standing behind a sheer curtain, light casting a soft shadow on the fabric",
  },
  {
    shortDescription: "A reflection in a puddle",
    fullImageDescription:
      "A city building or person reflected clearly in a rain puddle on the street, shot from ground level",
  },
  {
    shortDescription: "A person standing at a crossroads",
    fullImageDescription:
      "A lone figure standing where two dirt roads meet, looking in both directions, surrounded by empty fields",
  },
  {
    shortDescription: "A hand holding a mysterious glowing object",
    fullImageDescription:
      "A hand in darkness holding a small glowing orb, casting dramatic light on fingers and face",
  },
  {
    shortDescription: "A person inside a transparent bubble",
    fullImageDescription:
      "A surreal image of a person floating inside a large clear bubble in an open field or sky",
  },
  {
    shortDescription: "A maze viewed from above",
    fullImageDescription:
      "A detailed top-down view of a hedge maze with someone walking inside, casting long shadows",
  },
  {
    shortDescription: "An empty chair in a spotlight",
    fullImageDescription:
      "A single chair in the center of a dark room illuminated by a bright spotlight, dramatic theater atmosphere",
  },
  {
    shortDescription: "A staircase leading into the clouds",
    fullImageDescription:
      "A fantasy staircase disappearing into the sky with fluffy white clouds, dreamlike and surreal",
  },
  {
    shortDescription: "A person walking upside-down (surreal style)",
    fullImageDescription:
      "A surreal scene where a person appears to be walking upside-down on a ceiling with gravity defied",
  },
  {
    shortDescription: "A shadow doing something different from the person",
    fullImageDescription:
      "A person standing still but their shadow reaching out or moving independently in an eerie scene",
  },
];

export const paintingVersionDescriptions: ImageDescriptionShort[] = [
  {
    shortDescription: "Mona Lisa by Leonardo da Vinci",
    fullImageDescription:
      "A portrait of a woman with a mysterious smile, sitting with folded hands against a hazy mountainous background",
  },
  {
    shortDescription: "The Starry Night by Vincent van Gogh",
    fullImageDescription:
      "A swirling night sky filled with stars over a small village and tall cypress trees, painted in vibrant blues and yellows",
  },
  {
    shortDescription: "The Persistence of Memory by Salvador Dalí",
    fullImageDescription:
      "A surreal landscape with melting clocks draped over branches and objects under a golden sky",
  },
  {
    shortDescription: "Girl with a Pearl Earring by Johannes Vermeer",
    fullImageDescription:
      "A young girl turning her head toward the viewer, wearing a blue and gold turban and a large pearl earring",
  },
  {
    shortDescription: "The Birth of Venus by Sandro Botticelli",
    fullImageDescription:
      "Venus, the goddess of love, standing on a seashell as she emerges from the ocean, surrounded by mythological figures",
  },
  {
    shortDescription: "The Last Supper by Leonardo da Vinci",
    fullImageDescription:
      "Jesus and his twelve apostles gathered at a long table during their final meal, with dramatic expressions and gestures",
  },
  {
    shortDescription: "The Scream by Edvard Munch",
    fullImageDescription:
      "A figure on a bridge holding its face and screaming under a swirling red-orange sky with a sense of existential panic",
  },
  {
    shortDescription: "American Gothic by Grant Wood",
    fullImageDescription:
      "A stern farmer holding a pitchfork stands next to a woman in front of a farmhouse with a pointed window",
  },
  {
    shortDescription: "The Creation of Adam by Michelangelo",
    fullImageDescription:
      "God reaching out to touch Adam’s hand with outstretched fingers, surrounded by angels on the ceiling of the Sistine Chapel",
  },
  {
    shortDescription: "The Night Watch by Rembrandt",
    fullImageDescription:
      "A dynamic scene of a militia group in action, with dramatic lighting highlighting key figures in elaborate 17th-century attire",
  },
  {
    shortDescription: "Water Lilies by Claude Monet",
    fullImageDescription:
      "A peaceful pond filled with floating water lilies, reflecting trees and sky in soft impressionist brushstrokes",
  },
  {
    shortDescription: "Las Meninas by Diego Velázquez",
    fullImageDescription:
      "A complex scene showing the Spanish princess and her entourage, with the artist himself painting in the background",
  },
  {
    shortDescription: "Whistler’s Mother by James McNeill Whistler",
    fullImageDescription:
      "An elderly woman in a long black dress sits in profile in a wooden chair beside a gray wall with a framed print",
  },
  {
    shortDescription: "Liberty Leading the People by Eugène Delacroix",
    fullImageDescription:
      "A woman holding the French flag leads a group of revolutionaries over fallen bodies, symbolizing freedom and resistance",
  },
  {
    shortDescription: "The Kiss by Gustav Klimt",
    fullImageDescription:
      "A couple locked in a passionate embrace, draped in golden, mosaic-like robes, with floral patterns surrounding them",
  },
  {
    shortDescription: "Impression, Sunrise by Claude Monet",
    fullImageDescription:
      "A hazy seascape at dawn with a glowing orange sun reflected on the water, boats drifting in the mist",
  },
  {
    shortDescription: "The Garden of Earthly Delights by Hieronymus Bosch",
    fullImageDescription:
      "A triptych painting showing a surreal world of paradise, temptation, and hell, filled with fantastical creatures",
  },
  {
    shortDescription: "Bal du moulin de la Galette by Pierre-Auguste Renoir",
    fullImageDescription:
      "A lively outdoor dance scene in Paris with elegantly dressed people socializing under dappled sunlight",
  },
  {
    shortDescription: "A Sunday on La Grande Jatte by Georges Seurat",
    fullImageDescription:
      "A park scene filled with people in Victorian attire relaxing by the river, painted in pointillist technique",
  },
  {
    shortDescription: "Café Terrace at Night by Vincent van Gogh",
    fullImageDescription:
      "A brightly lit outdoor café with yellow lanterns under a deep blue starry night, people seated at tables along a cobblestone street",
  },
  {
    shortDescription: "The Arnolfini Portrait by Jan van Eyck",
    fullImageDescription:
      "A man and woman standing in a richly decorated room, holding hands beside a convex mirror and a chandelier",
  },
  {
    shortDescription: "Nighthawks by Edward Hopper",
    fullImageDescription:
      "A quiet, late-night diner scene with three customers and a server under glowing fluorescent light, viewed from the street corner",
  },
  {
    shortDescription: "The Hay Wain by John Constable",
    fullImageDescription:
      "A horse-drawn cart moving through a shallow river in front of a rustic English cottage, surrounded by lush countryside",
  },
  {
    shortDescription: "Portrait of Adele Bloch-Bauer I by Gustav Klimt",
    fullImageDescription:
      "A woman in an elaborate golden robe adorned with geometric patterns, sitting with calm elegance and a distant gaze",
  },
  {
    shortDescription: "Christina’s World by Andrew Wyeth",
    fullImageDescription:
      "A woman lying in a vast field, looking toward a distant farmhouse, her body twisted with subtle tension",
  },
  {
    shortDescription: "The Great Wave off Kanagawa by Hokusai",
    fullImageDescription:
      "A giant blue wave towering over boats, with Mount Fuji in the background, captured in traditional Japanese woodblock style",
  },
  {
    shortDescription: "Ophelia by John Everett Millais",
    fullImageDescription:
      "A young woman floating in a stream surrounded by flowers and greenery, her face serene and lifeless",
  },
  {
    shortDescription: "Libyan Sibyl by Michelangelo",
    fullImageDescription:
      "A muscular woman with twisting posture, turning pages of a large book, painted on the Sistine Chapel ceiling",
  },
  {
    shortDescription: "The Sleeping Gypsy by Henri Rousseau",
    fullImageDescription:
      "A peaceful desert scene with a sleeping woman and a lion sniffing her, under a star-filled sky and glowing moon",
  },
  {
    shortDescription: "Dance at Le Moulin de la Galette by Renoir",
    fullImageDescription:
      "A joyful crowd of Parisians dancing and chatting at a shaded garden party with dappled light filtering through the trees",
  },
  {
    shortDescription: "Composition VIII by Wassily Kandinsky",
    fullImageDescription:
      "A colorful geometric abstraction with circles, lines, and angles intersecting on a pale background in rhythmic balance",
  },
  {
    shortDescription: "Portrait of Dora Maar by Pablo Picasso",
    fullImageDescription:
      "A cubist depiction of a woman with fragmented facial features, vibrant colors, and distorted perspective",
  },
  {
    shortDescription: "The Fighting Temeraire by J.M.W. Turner",
    fullImageDescription:
      "A majestic old warship being towed by a small steam tugboat during sunset, symbolizing the end of an era",
  },
  {
    shortDescription: "Saturn Devouring His Son by Francisco Goya",
    fullImageDescription:
      "A terrifying image of a wild-eyed god devouring his child in a dark and chaotic background",
  },
  {
    shortDescription:
      "Self-Portrait with Thorn Necklace and Hummingbird by Frida Kahlo",
    fullImageDescription:
      "A self-portrait of Kahlo with a thorn necklace, black cat and monkey behind her, and vibrant green foliage",
  },

  {
    shortDescription: "Woman with a Parasol by Claude Monet",
    fullImageDescription:
      "A woman holding a parasol and looking back, standing in a breezy field with soft green grass and blue sky",
  },
  {
    shortDescription: "The Card Players by Paul Cézanne",
    fullImageDescription:
      "Two peasant men focused on a game of cards at a wooden table, painted with heavy brushstrokes and earthy tones",
  },
  {
    shortDescription: "Titanic – Jack and Rose on the ship’s bow",
    fullImageDescription:
      "A couple standing at the front of a massive ship, arms stretched out in the wind, with the ocean and sunset behind them",
  },
  {
    shortDescription: "The Matrix – Bullet dodge scene",
    fullImageDescription:
      "A man in a long black coat leaning backwards in slow motion as bullets fly past him, with a green-tinted background",
  },
  {
    shortDescription: "Pulp Fiction – The dance scene",
    fullImageDescription:
      "A man and woman dancing barefoot in a 1950s-style diner, performing quirky moves under stage lights",
  },
  {
    shortDescription: "The Shining – 'Here’s Johnny!' moment",
    fullImageDescription:
      "A wild-eyed man peeking through a broken door with a sinister grin, splinters around his face",
  },
  {
    shortDescription: "Forrest Gump – Running across America",
    fullImageDescription:
      "A man with a long beard running alone on a highway through the desert, followed by a group of people",
  },
  {
    shortDescription: "Jurassic Park – T-Rex attack on the jeep",
    fullImageDescription:
      "A giant dinosaur roaring near a rain-soaked SUV at night, headlights illuminating terrified passengers",
  },
  {
    shortDescription: "Star Wars – Luke gazing at twin suns",
    fullImageDescription:
      "A young man in a tunic looking out over a desert with two glowing suns setting in the distance",
  },
  {
    shortDescription: "Rocky – Running up the Philadelphia steps",
    fullImageDescription:
      "A boxer jogging up stone steps and raising his arms in triumph, with a city skyline behind him",
  },
  {
    shortDescription: "E.T. – The bicycle flying across the moon",
    fullImageDescription:
      "A child on a bicycle flying through the night sky with an alien in the basket, silhouetted against a full moon",
  },
  {
    shortDescription: "Inception – Folding cityscape scene",
    fullImageDescription:
      "A surreal city skyline folding upward like a hinge, with characters walking calmly as buildings bend around them",
  },
  {
    shortDescription: "Breakfast at Tiffany’s – Holly with cigarette holder",
    fullImageDescription:
      "A woman in a black dress and tiara holding a long cigarette holder, standing in front of a luxury jewelry store",
  },
  {
    shortDescription: "The Lion King – Simba lifted on Pride Rock",
    fullImageDescription:
      "A lion cub held high above a cliff by a baboon as animals below cheer in a bright African sunrise",
  },
  {
    shortDescription: "The Godfather – Don Corleone in the dark office",
    fullImageDescription:
      "An older man in a tuxedo sitting in a dimly lit room, petting a cat and speaking softly to a nervous visitor",
  },
  {
    shortDescription: "Gladiator – 'Are you not entertained?' scene",
    fullImageDescription:
      "A gladiator standing in the center of a colosseum, arms outstretched, shouting toward the roaring crowd",
  },
  {
    shortDescription: "La La Land – Dance on the hill at sunset",
    fullImageDescription:
      "A man and woman dancing together in silhouette on a hillside with the Los Angeles skyline at dusk",
  },
  {
    shortDescription: "Avengers: Endgame – 'Avengers Assemble!' moment",
    fullImageDescription:
      "A group of superheroes charging into battle across a war-torn landscape, energy and power radiating around them",
  },
  {
    shortDescription: "Harry Potter – Expecto Patronum by the lake",
    fullImageDescription:
      "A young wizard casting a glowing white animal-shaped spell to drive away dark ghostly creatures by a lake at night",
  },
  {
    shortDescription: "The Lord of the Rings – Gandalf facing the Balrog",
    fullImageDescription:
      "A wizard standing on a stone bridge yelling 'You shall not pass!' at a massive fiery monster in a cave",
  },
  {
    shortDescription: "Spider-Man – Upside-down kiss in the rain",
    fullImageDescription:
      "A masked hero hanging upside-down, sharing a kiss in the pouring rain with a woman holding his mask halfway up",
  },
  {
    shortDescription: "Indiana Jones – Boulder chase scene",
    fullImageDescription:
      "An adventurer running down a cave tunnel while a giant stone boulder rolls after him, dust and debris flying",
  },
];

export const convertNameIntoId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const getImagePublicUrl = (name: string, index?: string): string => {
  const id = convertNameIntoId(name);
  return `https://firebasestorage.googleapis.com/v0/b/dark-lang.firebasestorage.app/o/publicImages%2F${id}${index ? `_` + index : ""}.webp?alt=media`;
};

export const openAiImageDescriptions: ImageDescription[] =
  imageDescriptionsRaw.map((desc) => ({
    ...desc,
    id: convertNameIntoId(desc.shortDescription),
    url: getImagePublicUrl(desc.shortDescription),
  }));

export const paintingImageDescriptions: ImageDescription[] =
  paintingVersionDescriptions
    .map((desc) => {
      return [0, 1, 2, 3].map((index) => ({
        ...desc,
        id: convertNameIntoId(desc.shortDescription),
        url: getImagePublicUrl(desc.shortDescription, `${index}`),
      }));
    })
    .flat();

export const imageDescriptions: ImageDescription[] = [
  ...openAiImageDescriptions,
  ...paintingImageDescriptions,
];
// https://chatgpt.com/c/683d9852-9a14-8007-892c-757a7c4ba29c
