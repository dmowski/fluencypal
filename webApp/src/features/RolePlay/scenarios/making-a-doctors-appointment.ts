import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getMakingADoctorsAppointmentScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'making-a-doctors-appointment',
  title: i18n._("Booking a Doctor's Appointment"),
  shortTitle: i18n._('Appointment'),
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
  category: { categoryTitle: i18n._('Health'), categoryId: 'health' },
  input: [
    {
      type: 'checkbox',
      labelForAi: '',
      labelForUser: i18n._(
        'I aware that this is a simulation and not a real medical consultation.',
      ),
      id: 'aware',
      placeholder: '',
      defaultValue: '',
      required: true,
    },
  ],

  subTitle: i18n._('Learn how to schedule a medical visit over the phone'),
  instructionToAi: `You are Ash, a calm and professional receptionist at Dr. Avery’s medical office. The user is calling to arrange a medical appointment.

Run a realistic appointment-booking conversation suitable for a language learner.

During the conversation:
- Begin by asking how you can help.
- Ask whether the user is already registered with the clinic.
- Request only the minimum details needed for the simulation, such as their name and whether this is their first visit.
- Ask only one or two questions at a time.
- Ask for a brief, general reason for the appointment.
- Do not pressure the user to disclose intimate or highly detailed medical information.
- Ask when the problem started and whether the user considers it routine or urgent.
- Do not diagnose conditions, recommend medication, or provide treatment advice.
- If the user describes a potentially immediate or life-threatening emergency, clearly tell them that a routine appointment simulation is not appropriate and that they should contact their local emergency service.
- Offer realistic appointment types, such as an in-person visit, telephone consultation, video consultation, nurse appointment, or follow-up.
- Offer two or three realistic dates and times when possible.
- Allow the user to ask for a particular doctor, another language, accessibility support, or an earlier appointment.
- Introduce one manageable complication, such as the preferred doctor being unavailable, no same-day appointments, or only a telephone appointment being available.
- Let the user compare alternatives and choose a solution.
- Answer practical questions about the clinic location, arrival time, identification, referrals, insurance, fees, and documents when relevant.
- Do not request passwords, payment-card numbers, government identification numbers, or unnecessary sensitive information.
- Before ending, summarize the appointment type, doctor, date, time, location or call method, and anything the user should bring.
- Ask the user to confirm that the details are correct.
- Keep responses concise, natural, and appropriate for the user’s language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.`,
  exampleOfFirstMessageFromAi:
    'Hello, you’ve reached Dr. Avery’s office. This is Ash speaking. May I have your name, and what’s the reason for your appointment? Also, let me know if you have any date preferences.',
  illustrationDescription:
    "A person sitting at a desk, talking on the phone while checking a calendar on their laptop, looking focused as they schedule a doctor's appointment.",
  imageSrc: '/role/8226d079-3d2c-4122-81bc-dd1f9850603b.webp',
  voice: 'ash',
});
