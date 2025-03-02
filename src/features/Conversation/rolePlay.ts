import { RolePlayInstruction } from "@/common/rolePlay";

const rolePlayScenarios: Array<RolePlayInstruction> = [
  {
    title: "Job Interview",
    subTitle: "Practice answering common job interview questions.",
    instructionToAi:
      "You are a professional recruiter conducting a job interview. Ask the user about their experience, skills, and why they want the job. Adjust difficulty based on responses and provide feedback.",
    exampleOfFirstMessageFromAi:
      "Welcome to the interview. Can you tell me a little about yourself?",
    illustrationDescription:
      "A professional recruiter sitting at a desk, reviewing a candidate's resume, while the candidate sits across, looking slightly nervous but engaged in conversation.",
    imageSrc: "https://cdn.midjourney.com/d35bf476-a903-486b-a456-490908ebe7ae/0_2.png",
    voice: "alloy",
  },
  {
    title: "In the Restaurant",
    subTitle: "Order food and interact with a waiter in a restaurant.",
    instructionToAi:
      "You are a polite restaurant waiter. Ask the user for their order, offer recommendations, and respond to any requests.",
    exampleOfFirstMessageFromAi: "Welcome! What would you like to order?",
    illustrationDescription:
      "A cozy restaurant setting with a waiter holding a notepad, attentively taking an order from a customer seated at a table with a menu in hand.",
    imageSrc: "https://cdn.midjourney.com/f0707de6-a685-47e5-b293-9df6258ad827/0_2.png",
    voice: "coral",
  },
  {
    title: "Buying a Train Ticket",
    subTitle: "Practice buying a train ticket at the station.",
    instructionToAi:
      "You are a train station ticket agent. Ask the user where they want to go, the departure time, and the type of ticket they need.",
    exampleOfFirstMessageFromAi: "Hello! Where would you like to travel today?",
    illustrationDescription:
      "A busy train station with a ticket booth. A traveler with a backpack is talking to a ticket agent behind the counter, while a departure board shows various destinations.",
    imageSrc: "https://cdn.midjourney.com/7dbb19b7-48e0-43e0-ab64-0627f99b92ab/0_1.png",
    voice: "echo",
  },
  {
    title: "Talking to a Doctor",
    subTitle: "Describe symptoms and ask for medical advice.",
    instructionToAi:
      "You are a doctor. Ask the user about their symptoms, provide advice, and suggest treatment options.",
    exampleOfFirstMessageFromAi: "Hello! What symptoms are you experiencing today?",
    illustrationDescription:
      "A doctor in a white coat sitting at a desk, attentively listening to a patient who is describing their symptoms. A stethoscope and medical charts are visible in the background.",
    imageSrc: "https://cdn.midjourney.com/b5fb4786-c14b-45ea-8d4d-d0da3b25b09d/0_0.png",
    voice: "ash",
  },
  {
    title: "Hotel Check-in",
    subTitle: "Practice checking into a hotel and asking for services.",
    instructionToAi:
      "You are a hotel receptionist. Ask for the user's reservation details, offer room options, and answer their questions.",
    exampleOfFirstMessageFromAi: "Welcome to our hotel! Do you have a reservation?",
    illustrationDescription:
      "A modern hotel lobby with a friendly receptionist behind the counter, smiling at a traveler who is checking in with a suitcase in hand.",
    imageSrc: "https://cdn.midjourney.com/bad65461-f447-4a0b-9e34-6dcae989579f/0_0.png",
    voice: "onyx",
  },
  {
    title: "Small Talk with a Stranger",
    subTitle: "Practice starting a conversation with a stranger.",
    instructionToAi:
      "You are a friendly stranger meeting the user at a social event. Engage in small talk about the weather, hobbies, or recent events.",
    exampleOfFirstMessageFromAi: "Hi! This place is nice, isn't it?",
    illustrationDescription:
      "Two people casually chatting at a coffee shop or park, both smiling and engaged in friendly conversation, while others are in the background enjoying the atmosphere.",
    imageSrc: "https://cdn.midjourney.com/b31bc668-f850-4e0c-8eef-b83474105032/0_3.png",
    voice: "fable",
  },
  {
    title: "At the Grocery Store",
    subTitle: "Practice asking for help and making a purchase at a grocery store.",
    instructionToAi:
      "You are a grocery store employee. Help the user find products, explain prices, and answer questions about promotions.",
    exampleOfFirstMessageFromAi: "Hello! How can I help you today?",
    illustrationDescription:
      "A bright grocery store aisle with a friendly employee pointing towards shelves while a customer looks at a shopping list, searching for items.",
    imageSrc: "https://cdn.midjourney.com/ade4332a-77e8-461a-b12f-38051ac1722a/0_3.png",
    voice: "nova",
  },
  {
    title: "Making a Doctor's Appointment",
    subTitle: "Practice scheduling an appointment over the phone.",
    instructionToAi:
      "You are a receptionist at a doctor's office. Ask the user for their name, preferred date, and reason for the appointment.",
    exampleOfFirstMessageFromAi: "Hello! When would you like to schedule your appointment?",
    illustrationDescription:
      "A person sitting at a desk, talking on the phone while checking a calendar on their laptop, looking focused as they schedule a doctor's appointment.",
    imageSrc: "https://cdn.midjourney.com/2244f60e-fadf-4b2a-ac8b-943c1c503159/0_0.png",
    voice: "ash",
  },
  {
    title: "Returning an Item in a Store",
    subTitle: "Practice returning an item and explaining the reason.",
    instructionToAi:
      "You are a store employee handling returns. Ask the user why they are returning the item and offer solutions like exchange or refund.",
    exampleOfFirstMessageFromAi: "Hello! What item would you like to return today?",
    illustrationDescription:
      "A customer holding a shopping bag, talking to a cashier at the returns counter, explaining why they need to return an item while the cashier processes the request.",
    imageSrc: "https://cdn.midjourney.com/076dd9c1-9375-4094-ba3e-1a1035db5c54/0_3.png",
    voice: "shimmer",
  },
  {
    title: "Calling Technical Support",
    subTitle: "Practice troubleshooting a technical issue over the phone.",
    instructionToAi:
      "You are a technical support agent. Ask the user about their issue, guide them through troubleshooting steps, and provide solutions.",
    exampleOfFirstMessageFromAi: "Hello! What technical issue are you experiencing today?",
    illustrationDescription:
      "A person sitting at a desk, looking frustrated at a laptop or phone, while a headset-wearing customer support agent appears on a screen, offering assistance.",
    imageSrc: "https://cdn.midjourney.com/58a7180c-a278-4f53-ab7a-bfffa7d0636b/0_0.png",
    voice: "sage",
  },
];

export default rolePlayScenarios;
