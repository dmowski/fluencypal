import { SupportedLanguage } from "@/features/Lang/lang";
import { RolePlayInstruction } from "./types";
import { getI18nInstance } from "@/appRouterI18n";
import { ResourceCategory } from "@/common/category";
import { AliasRolePlay } from "./fullArticles/AliasRolePlay";

export interface RolePlayScenariosInfo {
  rolePlayScenarios: RolePlayInstruction[];
  categoriesList: ResourceCategory[];
  allCategory: ResourceCategory;
}

export const getRolePlayScenarios = (lang: SupportedLanguage): RolePlayScenariosInfo => {
  const i18n = getI18nInstance(lang);
  const rolePlayScenarios: RolePlayInstruction[] = [
    {
      id: "alias-game",
      title: i18n._("Alias Word Guessing Game"),
      shortTitle: i18n._("Alias"),
      category: { categoryTitle: i18n._("Game"), categoryId: "game" },
      isCallModeByDefault: true,
      input: [
        {
          type: "options",
          id: "languageLevel",

          labelForAi: "Language level of user",
          placeholder: "",
          defaultValue: "Intermediate",
          options: ["Beginner", "Intermediate", "Advanced", "Fluent"],

          labelForUser: i18n._(`Your Language Level`),
          optionsAiDescriptions: {
            Beginner: `Basic vocabulary and simple sentences. Use greetings and common phrases.`,
            Intermediate:
              "Can hold conversations on familiar topics. Use idiomatic expressions and ask follow-up questions.",
            Advanced:
              "Comfortable with complex discussions. Use idiomatic expressions and ask open-ended questions.",
            Fluent:
              "Native or near-native proficiency. Use advanced vocabulary and ask for detailed opinions.",
          },
          required: false,
        },
      ],

      gameMode: "alias",
      subTitle: i18n._("Practice English vocabulary by creatively describing and guessing words"),
      contendElement: <AliasRolePlay lang={lang} />,
      contentPage: i18n._(
        `Boost your English vocabulary and fluency by creatively describing and guessing words in this interactive AI-powered Alias game.\n\n## Benefits of Playing *Alias Game*\n- Enhance your vocabulary by describing words in unique ways.\n- Improve listening skills as you interpret descriptions.\n- Practice rapid thinking and fluent speaking under playful pressure.\n- Receive instant, tailored feedback from your AI partner.\n\n## How to Play\nYou and your AI partner alternate turns describing and guessing words without directly naming them. This encourages creative thinking and fluent expression, adapting to your language proficiency.`
      ),

      instructionToAi: `Your role:
You are playing the Alias game.

The game consists of two phases:

Phase 1: Guessing the User’s Word  
- The user will describe a word or phrase without explicitly mentioning it or its variations.
- Listen carefully to their description and try to guess the correct word.
- If the description is unclear, politely ask for clarification.

Phase 2: User Guessing Your Word
- You will receive the words or phrases to describe.
- Clearly and creatively describe this word without explicitly mentioning it, its synonyms, antonyms, translations, or variations.
- Allow the user up to 3 attempts to guess your word.

Answer Confirmation:
- Always explicitly acknowledge correct guesses (e.g. "That's right!" or "Great, that's true!").
- If the guess is incorrect, politely inform the user (e.g. "That's not quite right, try the form again.")

Gameplay Sequence:
1. Explicitly invite the user to begin by describing their word.
2. After you successfully guess the user's word, ask the user if it's right

Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s tricky…”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.
`,
      exampleOfFirstMessageFromAi: `Hello, I'm your AI partner for the Alias game. I'm ready to guess your word. Please describe it to me.`,
      illustrationDescription: "",
      imageSrc: "/role/f0de782c-6f1a-4005-924d-02459308a4fa.webp",
      videoSrc: "/role/69e7165b-a597-4731-8def-3e0f2b09ec1d_1.mp4",
      voice: "shimmer",

      landingHighlight: `Improve your vocabulary and speaking skills while having fun! Alias is a dynamic word-guessing game where you'll practice explaining and guessing words creatively, expanding your linguistic confidence.`,
    },
    {
      id: "small-talk-with-a-stranger",
      title: i18n._("Small Talk Practice"),
      shortTitle: i18n._("Small Talk"),
      landingHighlight: `Engage in a casual conversation with a friendly stranger at a social event. Perfect for practicing how to break the ice and keep the chat going naturally.`,
      contentPage:
        i18n._(`Engage in a casual conversation with a friendly stranger at a social event. Perfect for practicing how to break the ice and keep the chat going naturally.

## Why You Should Play *Small Talk with a Stranger*
1. Develop the confidence to start conversations in unfamiliar social settings.  
2. Learn casual conversation starters about the weather, hobbies, or recent events.  
3. Practice being an active listener and responding with genuine interest.  
4. Overcome nervousness or hesitation by interacting with a supportive AI partner.  
5. Build comfortable, everyday communication skills you can apply anywhere.

## How the Scenario Works
In this scenario, you’ll step into the role of someone meeting a new acquaintance at a social event. The AI acts as a friendly stranger, prompting you to talk about casual topics like weather or shared interests. As you exchange pleasantries, the AI will adapt to your responses, helping you refine your small-talk abilities.`),
      category: { categoryTitle: i18n._("Social"), categoryId: "social" },
      input: [],

      subTitle: i18n._("Develop your conversational skills with casual small talk"),
      instructionToAi:
        "You are a friendly stranger meeting the user at a social event. Engage in small talk about the weather, hobbies, or recent events.",
      exampleOfFirstMessageFromAi:
        "Hey there, I'm Fable. This is my first time at an event like this. How about you? Enjoying yourself so far?",
      illustrationDescription:
        "Two people casually chatting at a coffee shop or park, both smiling and engaged in friendly conversation, while others are in the background enjoying the atmosphere.",
      imageSrc: "/role/c916a0f2-59d4-4d45-99c3-dda8a714cd6c.webp",
      videoSrc: "/role/c916a0f2-59d4-4d45-99c3-dda8a714cd6c_1.mp4",
      voice: "sage",
    },
    {
      id: "job-interview",
      title: i18n._("Practice Job Interview"),
      shortTitle: i18n._("Job Interview"),

      landingHighlight: `Step into a realistic interview environment and practice showcasing your professional strengths. This role-play helps you handle common interview questions, discuss your experience, and demonstrate why you’re the right candidate.`,

      contentPage:
        i18n._(`Step into a realistic interview environment and practice showcasing your professional strengths. This role-play helps you handle common interview questions, discuss your experience, and demonstrate why you’re the right candidate.

## Why You Should Play *Job Interview*  
1. Master the art of professional communication, from introducing yourself to highlighting key skills.  
2. Gain confidence navigating tricky interview questions and providing thoughtful, structured answers.  
3. Learn how to present your achievements clearly, whether you have extensive experience or are just starting out.  
4. Receive real-time feedback on tone, clarity, and overall presentation to refine your interview style.  
5. Develop the poise and readiness you need for any real-life interview scenario.

## How the Scenario Works  
In this scenario, you’ll take on the role of a job candidate while our AI acts as a professional recruiter. You’ll be asked about your experience, skills, and motivations for the role, with the AI adjusting difficulty based on your responses. Use the prompts to practice delivering concise, persuasive answers that help you stand out in any job interview.
`),
      category: { categoryTitle: i18n._("Professional"), categoryId: "professional" },
      analyzeResultAiInstruction: `Analyze the user's responses and provide constructive feedback on their interview performance. Highlight areas of strength and suggest improvements for future interviews.`,
      input: [
        {
          id: "cv",
          labelForUser: i18n._(`Your experience`),
          labelForAi: "User's CV text",
          placeholder: i18n._(
            `Paste your CV text here. You can also write a brief summary of your experience.`
          ),
          type: "textarea",
          defaultValue: "",
          lengthToTriggerSummary: 300,
          aiSummarizingInstruction:
            "Summarize the user's experience and skills. Return text no longer than 10 sentences.",
          required: false,
        },
        {
          id: "job-title",
          labelForUser: i18n._(`Desired Job Title`),
          labelForAi: "User's desired Job Title",
          placeholder: i18n._(
            `Your desired job title. Like Designer, Shop-Assistant, Fitness Trainer, etc.`
          ),
          type: "text-input",
          defaultValue: "",
          required: true,
        },
        {
          id: "vacancy",
          labelForUser: i18n._(`Vacancy description`),
          labelForAi: "Desired Job Vacancy Description",
          placeholder: i18n._(
            `Paste vacancy description if you have it. You can also write a brief summary of the job requirements.`
          ),
          type: "textarea",
          defaultValue: "",

          lengthToTriggerSummary: 10,
          requiredFieldsToSummary: ["cv"],
          aiSummarizingInstruction: `Summarize the vacancy description. Return vacancy description within 5 sentences.
And create list of 10 questions to candidate based on vacancy and use candidate's CV to make questions more candidate oriented (mention info from CV if applicable).

Response structure:
Job Description: [Vacancy description]
Questions to Candidate: [List of 10 questions]

------

Candidate's info below, don't include questions that are already answered by candidate in their CV.
`,
          required: false,
        },
      ],

      subTitle: i18n._("Master answering common interview questions with AI"),
      instructionToAi: `You are a professional recruiter conducting a job interview.
Ask the user about their experience, skills, and why they want the job.
Adjust difficulty based on responses.
Leave feedback after each user message, as well as examples of best responses, taking into account the user's resume.
Keep asking user different aspects of the job.
`,
      exampleOfFirstMessageFromAi:
        "Hi, my name is Alloy. I'm a recruiter at XYZ. Thank you for coming in today. I’d love to learn more about your professional background and experiences. Could you start by telling me a bit about yourself?",
      illustrationDescription:
        "A professional recruiter sitting at a desk, reviewing a candidate's resume, while the candidate sits across, looking slightly nervous but engaged in conversation.",
      imageSrc: "/role/07d20442-758f-42a9-81b2-3dc7bf4fe248.webp",
      videoSrc: "/role/090f7de1-91bd-4210-a99c-4eb077c9efd7_1.mp4",
      voice: "alloy",
    },

    /*{
      id: "instant-correction",
      category: { categoryTitle: i18n._("Speech"), categoryId: "speech" },
      title: i18n._("Instant Speech Correction"),
      subTitle: i18n._("Real-time feedback to improve your spoken English"),

      instructionToAi: `You are a polite speech corrector.

Choose a random topic from the provided list and politely ask the user to share their opinion or thoughts about it.

After the user responds, provide clear, friendly feedback on their grammar and overall speech. Offer a corrected version of their response and politely ask them to repeat this corrected version.

Do not spend too long on any single topic. Ask the user to repeat their corrected response a maximum of two times, then move to the next topic.

Continue this process, moving smoothly from one topic to the next.`,
      exampleOfFirstMessageFromAi: "Hello, I’m Ash, your polite speech corrector.",
      illustrationDescription: "",
      imageSrc: "/role/692781e2-a658-4a21-9dcb-5f10c7c35fe1.webp",
      voice: "ash",

      contentPage:
        i18n._(`Improve your speaking skills with immediate, personalized feedback. Instant Speech Correction helps you express yourself clearly and confidently by correcting grammar, vocabulary, and pronunciation errors as you speak.

## Why You Should Try *Instant Speech Correction*
1. Receive real-time, friendly corrections that immediately improve your speech.
2. Boost your confidence by practicing correct sentence structure and pronunciation.
3. Quickly identify and correct common mistakes in grammar and vocabulary.
4. Develop smoother and more fluent speaking abilities.
5. Learn to speak naturally through repeated, corrected practice.

## How the Scenario Works
You'll be prompted to express your thoughts or opinions on various engaging topics. After your initial response, you'll get clear, polite feedback highlighting corrections in your grammar and pronunciation. You'll then practice by repeating the corrected response. Each topic moves quickly, keeping the experience dynamic and effective for rapid language improvement.
`),
      input: [
        {
          type: "options",
          id: "languageLevel",

          labelForAi: "Language level of user",
          placeholder: "",
          defaultValue: "Intermediate",
          options: ["Beginner", "Intermediate", "Advanced", "Fluent"],
          lengthToTriggerSummary: 1,
          injectUserInfoToSummary: true,
          cacheAiSummary: false,
          aiSummarizingInstruction: `Generate 20 topics to discuss based on user's language level and info about user.

Return response in the following format:
User Level: [User's language level]
Topics to discuss: [List of topics to discuss]
`,

          labelForUser: i18n._(`Your Language Level`),
          optionsAiDescriptions: {
            Beginner: `Basic vocabulary and simple sentences. Use greetings and common phrases.

Example of topics: weather, hobbies, family, work, travel, food, music, movies, sports, books, technology, fashion, health, education, environment, culture, politics, history, art, science, relationships, social media, current events, personal experiences, future plans, daily routines, childhood memories, favorite things, etc.
`,
            Intermediate: `Can hold conversations on familiar topics. Use idiomatic expressions and ask follow-up questions.

Example of topics: weather, hobbies, family, work, travel, food, music, movies, sports, books, technology, fashion, health, education, environment, culture, politics, history, art, science, relationships, social media, current events, personal experiences, future plans, daily routines, childhood memories, favorite things, etc.`,
            Advanced: `Comfortable with complex discussions. Use idiomatic expressions and ask open-ended questions.

Example of topics: weather, hobbies, family, work, travel, food, music, movies, sports, books, technology, fashion, health, education, environment, culture, politics, history, art, science, relationships, social media, current events, personal experiences, future plans, daily routines, childhood memories, favorite things, etc.
`,
            Fluent: `Native or near-native proficiency. Use advanced vocabulary and ask for detailed opinions.

Example of topics: weather, hobbies, family, work, travel, food, music, movies, sports, books, technology, fashion, health, education, environment, culture, politics, history, art, science, relationships, social media, current events, personal experiences, future plans, daily routines, childhood memories, favorite things, etc.`,
          },
          required: false,
        },
      ],
    },*/

    {
      id: "in-the-restaurant",
      title: i18n._("In the Restaurant"),
      shortTitle: i18n._("Restaurant"),
      category: { categoryTitle: i18n._("Social"), categoryId: "social" },
      input: [],

      subTitle: i18n._("Practice ordering food and interacting with a waiter in a restaurant"),
      instructionToAi:
        "You are a polite restaurant waiter. Ask the user for their order, offer recommendations, and respond to any requests.",
      exampleOfFirstMessageFromAi:
        "Hello, I’m Ash, your server for today. Welcome to our restaurant! Is there anything in particular you’re craving, or would you like me to suggest some popular dishes?",
      illustrationDescription:
        "A cozy restaurant setting with a waiter holding a notepad, attentively taking an order from a customer seated at a table with a menu in hand.",
      imageSrc: "/role/acde68cd-1db6-4b69-be42-d2071b9ee1e8.webp",
      voice: "ash",

      contentPage:
        i18n._(`In this role-play, you’ll interact with a polite waiter, order food, and handle special requests—just like in a real restaurant. Perfect for practicing how to start conversations, ask about menu items, and address any dining-related concerns.  

## Why You Should Play *In the Restaurant*  
1. Hone your ordering skills and gain confidence speaking in a real-life dining situation.  
2. Practice conversational etiquette, from small talk with the server to politely handling mistakes or special requests.  
3. Learn key phrases and vocabulary related to dining, including menu items, dietary preferences, and payment options.  
4. Enhance your listening abilities by responding to recommendations and clarifying any questions about your meal.  
5. Build comfort in realistic interactions, making your next visit to a restaurant smoother and more enjoyable in any language.

## How the Scenario Works  
In this scenario, you’ll take on the role of a diner while the AI acts as your friendly waiter. You’ll be prompted to place an order, ask for recommendations, and respond to follow-up questions. As you converse, the AI adapts to your responses, creating an immersive experience that helps you practice practical dining interactions.
`),
    },

    {
      id: "buying-a-train-ticket",
      title: i18n._("Buying a Train Ticket"),
      shortTitle: i18n._("Ticket"),
      contentPage:
        i18n._(`Get comfortable purchasing travel tickets in a bustling train station scenario. Perfect for practicing how to ask about routes, departure times, and ticket types.

## Why You Should Play *Buying a Train Ticket*
1. Gain confidence asking about schedules, prices, and possible discounts.  
2. Learn essential travel vocabulary, including ticket options and train routes.  
3. Practice navigating public transportation systems in a realistic setting.  
4. Become better at clarifying details and handling unexpected changes.  
5. Build the practical language skills you need for smooth, stress-free travel.

## How the Scenario Works
In this scenario, you’ll step into the role of a traveler looking to buy a ticket. The AI takes on the role of a train station ticket agent, asking you where you’re headed, when you’re departing, and what type of ticket you need. By interacting with the AI, you’ll master the art of asking the right questions and understanding key information about your journey.
`),
      input: [],
      category: { categoryTitle: i18n._("Travel"), categoryId: "travel" },

      subTitle: i18n._("Practice asking about schedules, fares, and ticket options"),
      instructionToAi:
        "You are a train station ticket agent. Ask the user where they want to go, the departure time, and the type of ticket they need.",
      exampleOfFirstMessageFromAi:
        "Hi there, I’m Echo at Central Station. How can I help you with your travel plans today? Are you headed somewhere local or out of town?",
      illustrationDescription:
        "A busy train station with a ticket booth. A traveler with a backpack is talking to a ticket agent behind the counter, while a departure board shows various destinations.",
      imageSrc: "/role/36b7ea13-f429-46ae-a6c7-19d3206ab6b0.webp",
      voice: "echo",
    },

    {
      id: "talking-to-a-doctor",
      title: i18n._("Talking to a Doctor"),
      shortTitle: i18n._("Doctor"),
      contentPage:
        i18n._(`Discuss your health concerns in a realistic doctor’s office setting and practice explaining symptoms clearly. Perfect for gaining confidence in describing medical issues and understanding potential treatment options.

## Why You Should Play *Talking to a Doctor*
1. Learn to describe aches, pains, or concerns in a way that a healthcare professional can understand.  
2. Build confidence asking follow-up questions about tests, prescriptions, or alternative treatments.  
3. Gain exposure to medical vocabulary and common phrases used during consultations.  
4. Develop an awareness of how to communicate effectively about personal well-being.  
5. Strengthen your ability to clarify symptoms, ensuring you can advocate for your health in real-life situations.

## How the Scenario Works
You’ll take on the role of a patient visiting a doctor, played by the AI. The doctor will ask about your symptoms, provide advice, and suggest possible treatments. By conversing naturally, you’ll hone your communication skills in a professional healthcare context.
`),
      category: { categoryTitle: i18n._("Health"), categoryId: "health" },
      input: [
        {
          type: "checkbox",
          labelForAi: "",
          labelForUser: i18n._(
            "I aware that this is a simulation and not a real medical consultation."
          ),
          id: "aware",
          placeholder: "",
          defaultValue: "",
          required: true,
        },
      ],

      subTitle: i18n._("Learn to describe symptoms and ask for medical advice effectively"),
      instructionToAi:
        "You are a doctor. Ask the user about their symptoms, provide advice, and suggest treatment options.",
      exampleOfFirstMessageFromAi:
        "Good day, I’m Dr. Ash. Please make yourself comfortable. I understand you’ve come in with some concerns—could you describe your symptoms for me?",
      illustrationDescription:
        "A doctor in a white coat sitting at a desk, attentively listening to a patient who is describing their symptoms. A stethoscope and medical charts are visible in the background.",
      imageSrc: "/role/d853fe08-c7bc-431c-9eed-68c168a96ca0.webp",
      voice: "ash",
    },
    {
      id: "meeting-dog-owners-in-the-park",
      title: i18n._("Chat with a Fellow Dog Owner"),
      shortTitle: i18n._("Dog Owner"),
      contentPage:
        i18n._(`Strike up a conversation with a fellow dog owner in a friendly park setting. Compare tips, stories, and general dog-care experiences while bonding over your shared love of canine companions.

## Why You Should Play *Talk to the Dog Owner*
1. Practice engaging in lighthearted, social dialogue with someone who shares a common interest.  
2. Learn how to ask and answer questions about pets, routines, or dog-care tips.  
3. Build confidence initiating chat with strangers in casual environments.  
4. Explore using varying levels of complexity in speech, depending on your language proficiency.  
5. Experience a realistic scenario where you can refine conversational flow and friendly rapport.

## How the Scenario Works
In this scenario, you’ll portray a fellow dog owner meeting an AI-driven character at the park. The AI will greet you warmly, ask about your dog, and share pet stories or advice. Your goal is to respond naturally, keep the conversation flowing, and enjoy a fun exchange about your four-legged friends.
`),
      category: { categoryTitle: i18n._("Social"), categoryId: "social" },
      input: [
        {
          type: "options",
          id: "languageLevel",

          labelForAi: "Language level of user",
          placeholder: "",
          defaultValue: "Intermediate",
          options: ["Beginner", "Intermediate", "Advanced", "Fluent"],

          labelForUser: i18n._(`Your Language Level`),
          optionsAiDescriptions: {
            Beginner: `Basic vocabulary and simple sentences. Use greetings and common phrases.`,
            Intermediate:
              "Can hold conversations on familiar topics. Use idiomatic expressions and ask follow-up questions.",
            Advanced:
              "Comfortable with complex discussions. Use idiomatic expressions and ask open-ended questions.",
            Fluent:
              "Native or near-native proficiency. Use advanced vocabulary and ask for detailed opinions.",
          },
          required: false,
        },
      ],

      subTitle: i18n._("Engage in friendly small talk about pets and daily routines"),
      instructionToAi:
        "You are a friendly dog owner who meets the user at a park. Greet them warmly, ask about their dog, share experiences, and discuss tips or fun stories about caring for dogs.",
      exampleOfFirstMessageFromAi:
        "Hi there! I’m Jade, and this little guy is Milo. He’s always excited to meet new friends at the park. Your pup looks so energetic—do you two come here often?",
      illustrationDescription:
        "Two dog owners in a green park setting, each with a leashed dog, smiling and engaged in casual conversation while their dogs sniff around.",
      imageSrc: "/role/20897efe-6b4d-4f97-b8e9-164e35381d37.webp",
      voice: "sage",
    },
    {
      id: "hotel-check-in",
      title: i18n._("Hotel Check-In Conversation"),
      shortTitle: i18n._("Check-In"),
      contentPage:
        i18n._(`Check into a hotel and handle room arrangements in a realistic front-desk setting. Perfect for practicing how to provide reservation details, inquire about amenities, and address special requests.

## Why You Should Play *Hotel Check-in*
1. Gain confidence requesting the services you need while checking into a hotel.  
2. Learn to provide personal details and confirm reservations with clarity.  
3. Practice asking about amenities like breakfast, Wi-Fi, or late check-out.  
4. Discover how to handle unexpected issues, such as room availability or last-minute changes.  
5. Sharpen your ability to navigate professional, service-oriented conversations.

## How the Scenario Works
You’ll act as the guest arriving at the hotel, while our AI plays the role of a receptionist. The receptionist will ask for your name, reservation details, and any special requests you might have. By responding naturally, you’ll build the conversational skills necessary for a smooth hotel check-in experience.
`),
      category: { categoryTitle: i18n._("Travel"), categoryId: "travel" },
      input: [],

      subTitle: i18n._("Practice booking a room, requesting amenities, and checking in"),
      instructionToAi:
        "You are a hotel receptionist. Ask for the user's reservation details, offer room options, and answer their questions.",
      exampleOfFirstMessageFromAi:
        "Hello, I’m Onyx at the Grand Skyline Hotel. We’re delighted to have you here. May I have your name so I can check your reservation? Also, let me know if you have any special requests.",
      illustrationDescription:
        "A modern hotel lobby with a friendly receptionist behind the counter, smiling at a traveler who is checking in with a suitcase in hand.",
      imageSrc: "/role/4db47c61-ff6c-448b-8528-65f4d4fa5992.webp",
      voice: "verse",
    },

    {
      id: "at-the-grocery-store",
      title: i18n._("Shopping at the Grocery Store"),
      shortTitle: i18n._("Grocery Store"),
      contentPage:
        i18n._(`Get comfortable shopping in a real store setting by asking questions about product locations, prices, and deals. Perfect for building confidence in navigating aisles, comparing items, and checking out.

#### Why You Should Play *At the Grocery Store*
1. Practice finding specific items on your shopping list.  
2. Learn to ask questions about prices, promotions, and product details.  
3. Explore how to handle polite small talk with store employees.  
4. Improve your communication when making quick decisions or comparing options.  
5. Gain valuable experience in a common, everyday scenario.

#### How the Scenario Works
You’ll take the role of a customer shopping for groceries. The AI, as a store employee, will ask what you’re looking for, suggest deals, and guide you to the right products. This interactive role-play simulates a realistic shopping experience, helping you build essential communication skills.
`),
      category: { categoryTitle: i18n._("Shopping"), categoryId: "shopping" },
      input: [],

      subTitle: i18n._("Practice asking for product recommendations and making purchases"),
      instructionToAi:
        "You are a grocery store employee. Help the user find products, explain prices, and answer questions about promotions.",
      exampleOfFirstMessageFromAi:
        "Hi, I’m Nova here at FreshMart. Is there anything specific you’re looking for today, or would you like some help finding the best deals?",
      illustrationDescription:
        "A bright grocery store aisle with a friendly employee pointing towards shelves while a customer looks at a shopping list, searching for items.",
      imageSrc: "/role/a7e56489-d409-4b73-ad87-1473565975dc.webp",
      voice: "verse",
    },

    {
      id: "calling-technical-support",
      title: i18n._("Calling Customer Support"),
      shortTitle: i18n._("Technical Support"),
      contentPage:
        i18n._(`Work through a technical issue while speaking with a helpful support agent. Perfect for practicing how to explain a problem clearly and follow troubleshooting steps.

#### Why You Should Play *Calling Technical Support*
1. Learn to describe device or software issues in a concise way.  
2. Build confidence when interacting with customer support agents.  
3. Master troubleshooting terminology and instructions.  
4. Understand how to ask relevant questions and confirm details.  
5. Develop problem-solving skills in a technical context.

#### How the Scenario Works
You’ll act as a caller seeking help with a technical issue, while the AI plays the support agent. The agent will ask for details, guide you through possible solutions, and offer next steps. This scenario helps you get comfortable navigating tech problems and communicating solutions.
`),
      category: { categoryTitle: i18n._("Professional"), categoryId: "professional" },
      input: [],

      subTitle: i18n._("Practice troubleshooting a technical issue over the phone"),
      instructionToAi:
        "You are a technical support agent. Ask the user about their issue, guide them through troubleshooting steps, and provide solutions.",
      exampleOfFirstMessageFromAi:
        "Hello, you’ve reached TechEase Support. I’m Shimmer, and I’m here to help. Could you describe the issue you’re experiencing so I can guide you through some possible solutions?",
      illustrationDescription:
        "A person sitting at a desk, looking frustrated at a laptop or phone, while a headset-wearing customer support agent appears on a screen, offering assistance.",
      imageSrc: "/role/1c00497c-3d10-4dc8-bdaf-f83c888ce371.webp",
      voice: "shimmer",
    },

    {
      id: "making-a-doctors-appointment",
      title: i18n._("Booking a Doctor's Appointment"),
      shortTitle: i18n._("Appointment"),
      contentPage:
        i18n._(`Practice scheduling a doctor’s appointment over the phone by clearly stating your availability and reason for the visit. Perfect for improving clarity and confidence in professional medical settings.

#### Why You Should Play *Doctor's Appointment*
1. Learn to request appointments on specific dates and times.  
2. Develop clarity in explaining the purpose of your visit.  
3. Practice common phrases for medical scheduling.  
4. Build confidence in managing personal healthcare logistics.  
5. Prepare for real-world situations where time and details are crucial.

#### How the Scenario Works
You’ll take the role of a patient calling a doctor’s office to schedule an appointment. The AI, as a receptionist, will ask for your name, preferred date, and reason for the visit. By responding naturally, you’ll build essential communication skills for any medical context.
`),
      category: { categoryTitle: i18n._("Health"), categoryId: "health" },
      input: [
        {
          type: "checkbox",
          labelForAi: "",
          labelForUser: i18n._(
            "I aware that this is a simulation and not a real medical consultation."
          ),
          id: "aware",
          placeholder: "",
          defaultValue: "",
          required: true,
        },
      ],

      subTitle: i18n._("Learn how to schedule a medical visit over the phone"),
      instructionToAi:
        "You are a receptionist at a doctor's office. Ask the user for their name, preferred date, and reason for the appointment.",
      exampleOfFirstMessageFromAi:
        "Hello, you’ve reached Dr. Avery’s office. This is Ash speaking. May I have your name, and what’s the reason for your appointment? Also, let me know if you have any date preferences.",
      illustrationDescription:
        "A person sitting at a desk, talking on the phone while checking a calendar on their laptop, looking focused as they schedule a doctor's appointment.",
      imageSrc: "/role/8226d079-3d2c-4122-81bc-dd1f9850603b.webp",
      voice: "ash",
    },
    {
      id: "returning-an-item-in-a-store",
      title: i18n._("Returning an Item to a Store"),
      shortTitle: i18n._("Return"),
      contentPage:
        i18n._(`Handle a return at a customer service desk by describing what went wrong and exploring options for a refund or exchange. Perfect for practicing calm, clear communication in a shopping context.

#### Why You Should Play *Returning an Item in a Store*
1. Understand how to explain an issue or defect politely.  
2. Learn to provide necessary details for a smooth return process.  
3. Practice receiving instructions about refunds or exchanges.  
4. Explore different scenarios, such as missing receipts or store policies.  
5. Build confidence handling a common retail interaction.

#### How the Scenario Works
You’ll step into the role of a customer returning a product, while the AI acts as the store employee. The AI will ask why you’re returning the item and discuss available options. This practical scenario helps you master polite, efficient communication in retail situations.
`),
      category: { categoryTitle: i18n._("Shopping"), categoryId: "shopping" },
      input: [],

      subTitle: i18n._("Practice explaining product issues and requesting refunds or exchanges"),
      instructionToAi:
        "You are a store employee handling returns. Ask the user why they are returning the item and offer solutions like exchange or refund.",
      exampleOfFirstMessageFromAi:
        "Hi, I’m Sage at the Customer Service desk. I’m sorry to hear you need to return something. Could you tell me what went wrong with the item?",
      illustrationDescription:
        "A customer holding a shopping bag, talking to a cashier at the returns counter, explaining why they need to return an item while the cashier processes the request.",
      imageSrc: "/role/2ac841c8-3569-45e0-a8aa-fe98e15ea5e2.webp",
      voice: "sage",
    },
    {
      id: "meeting-with-psychologist",
      title: i18n._("Speaking with a Psychologist"),
      shortTitle: i18n._("Psychologist"),
      category: { categoryTitle: i18n._("Health"), categoryId: "health" },
      input: [
        {
          type: "options",
          id: "languageLevel",
          labelForAi: "Language level of user",
          placeholder: "",
          defaultValue: "Intermediate",
          options: ["Beginner", "Intermediate", "Advanced", "Fluent"],
          labelForUser: i18n._(`Your Language Level`),
          optionsAiDescriptions: {
            Beginner: `Use simple, reassuring language. Ask short, direct questions.`,
            Intermediate: `Use clear language with supportive and open-ended questions.`,
            Advanced: `Use nuanced language, and engage in deeper discussions with insightful reflections.`,
            Fluent: `Use sophisticated language and detailed psychological concepts.`,
          },
          required: false,
        },

        {
          type: "checkbox",
          labelForAi: "",
          labelForUser: i18n._(
            "I aware that this is a simulation and not a real medical consultation."
          ),
          id: "aware",
          placeholder: "",
          defaultValue: "",
          required: true,
        },
      ],

      subTitle: i18n._("Discuss mental health topics and express your thoughts effectively"),
      instructionToAi: `You are a psychologist meeting a client for a casual consultation.

- Engage in supportive dialogue
- Ask open-ended questions to encourage the client to express their feelings and thoughts.
- Offer reflective, empathetic responses, validating their experiences.
- Suggest general coping strategies or thought-provoking perspectives.
  
Note: This is a role-play scenario intended to practice speaking on mental health topics, not a medical consultation or treatment.`,
      exampleOfFirstMessageFromAi: `Hello, I'm Sage, your psychologist today. I'm here to listen and support you. Could you tell me what's on your mind?`,
      illustrationDescription:
        "A comfortable, welcoming office with a psychologist listening attentively to a client seated across from them, expressing themselves in a supportive atmosphere.",
      imageSrc: "/role/ceb0e1b7-9c34-47c0-ae09-4086fb734da4.webp",
      voice: "sage",

      contentPage:
        i18n._(`Discuss mental health topics in a comfortable, supportive setting. This role-play scenario provides a safe space to express yourself clearly, explore sensitive issues, and practice discussing mental health openly.

**Note:** This scenario is not a medical treatment and is intended purely for language practice and conversational comfort about mental health.
  
## Why You Should Play *Meeting with Psychologist*
1. Practice articulating complex emotions and sensitive topics confidently.
2. Learn vocabulary related to mental health and emotional well-being.
3. Improve your communication skills through supportive, reflective conversations.
4. Explore various coping strategies and discuss perspectives on common mental health challenges.
5. Gain comfort in expressing emotions and thoughts openly and clearly.

## How the Scenario Works

You'll act as a client meeting a psychologist for an informal discussion about mental health topics you choose, such as stress management, anxiety, relationships, or self-esteem. The AI acts as your psychologist, providing supportive dialogue, asking reflective questions, and validating your experiences to help you practice meaningful, thoughtful conversation.
`),
    },

    {
      id: "custom",
      title: i18n._("Create Your Own Role-Play Scenario"),
      shortTitle: i18n._("Custom"),
      subTitle: i18n._("Customize a conversation to fit your unique learning needs"),
      input: [
        {
          id: "scenario",
          labelForUser: i18n._(`Scenario Description`),
          labelForAi: "",
          placeholder: i18n._(`Describe your custom scenario here...`),
          type: "textarea",
          defaultValue: "",
          required: true,
        },
      ],
      contentPage:
        i18n._(`Create a unique, personalized setting that fits your specific interests or challenges. This scenario lets you decide the context, characters, and conversation flow you want to practice.

## Why You Should Play *Your Custom Scenario*
1. Tailor the experience to your personal goals, from work situations to everyday social interactions.  
2. Experiment with different conversation styles, topics, or tones in a setting of your choice.  
3. Focus on the skills or vocabulary you need most, whether it’s technical terminology or casual chit-chat.  
4. Enjoy full creative freedom to build a scenario that’s both realistic and engaging for you.  
5. Gain valuable practice in scenarios that might not be covered by standard role-plays.

## How the Scenario Works
You’ll outline your own role-play by providing a brief description of the setting, characters, and main objectives. The AI will adapt to your custom instructions and engage in dialogue aligned with your scenario’s theme. This flexible format helps you master the exact communication skills you need.
`),

      category: { categoryTitle: i18n._("Custom"), categoryId: "custom" },

      instructionToAi: "",
      exampleOfFirstMessageFromAi: "",
      illustrationDescription:
        "A customer holding a shopping bag, talking to a cashier at the returns counter, explaining why they need to return an item while the cashier processes the request.",
      imageSrc: "/role/1ca9343e-839f-4b49-ac1f-9c7bfdea272e.webp",
      voice: "sage",
    },
  ];

  const categoriesList: ResourceCategory[] = [];

  rolePlayScenarios.forEach((rolePlay) => {
    const category = rolePlay.category;
    if (!categoriesList.find((cat) => cat.categoryId === category.categoryId)) {
      categoriesList.push(category);
    }
  });

  const allCategory = {
    categoryTitle: i18n._(`All Scenarios`),
    categoryId: "all",
    isAllResources: true,
  };

  categoriesList.unshift(allCategory);
  return { rolePlayScenarios, categoriesList, allCategory };
};
