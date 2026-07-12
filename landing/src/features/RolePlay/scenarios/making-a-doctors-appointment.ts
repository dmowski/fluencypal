import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getMakingADoctorsAppointmentScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'making-a-doctors-appointment',
  title: i18n._("Booking a Doctor's Appointment"),
  shortTitle: i18n._('Doctor’s Appointment'),
  landingHighlight: i18n._(
    'Practice calling a medical office, briefly explaining why you need an appointment, comparing available times, and confirming the visit details.',
  ),
  contentPage:
    i18n._(`Booking a doctor’s appointment usually involves a short conversation with a receptionist. You may need to provide your name, explain the general reason for the visit, choose an available time, and confirm practical details such as the location and required documents.

You do not need to describe your complete medical history to the receptionist. A brief and clear explanation is usually enough to help them choose the correct appointment type.

This roleplay is for language practice only. It does not provide medical diagnosis or treatment advice. If you believe you are experiencing a medical emergency, contact your local emergency service instead of waiting for a routine appointment.

## Start the Call

You can begin with:

- “Hello, I’d like to make an appointment.”
- “I’m calling to book an appointment with a doctor.”
- “I’d like to schedule a medical consultation.”
- “I need to make an appointment for my child.”
- “I’d like to arrange a follow-up appointment.”
- “I was asked to call and schedule another visit.”

The receptionist may ask:

- “Are you already a patient at this clinic?”
- “May I have your name?”
- “What is your date of birth?”
- “Which doctor would you like to see?”
- “What is the reason for the appointment?”
- “When are you available?”

## Provide Your Personal Details

The receptionist may need information to find or create your patient record.

You may be asked for:

- Your full name
- Your date of birth
- Your telephone number
- Your address
- Your patient or insurance number
- Your email address
- The name of your regular doctor

Useful phrases include:

- “My name is Alex Dmowski.”
- “My date of birth is the twelfth of May, nineteen ninety.”
- “I’m already registered at the clinic.”
- “This will be my first appointment here.”
- “Could you check whether my details are already in the system?”
- “My phone number has recently changed.”
- “Could I spell my surname for you?”

When spelling information over the phone, you can say:

> “That’s D as in Delta, M as in Mike…”

To confirm numbers:

- “That is one-five, not five-zero.”
- “Let me repeat the number.”
- “Did you get the complete phone number?”
- “Could you read that back to me?”

## Explain the Reason for the Appointment

The receptionist usually needs a short description to determine the appropriate doctor, appointment type, and urgency.

You can say:

- “I’ve had a cough for several days.”
- “I have been experiencing back pain.”
- “I’d like to discuss a recurring headache.”
- “I need a routine check-up.”
- “I need to renew a prescription.”
- “I’d like to discuss some test results.”
- “I need a follow-up after my previous appointment.”
- “I have a skin problem that I would like a doctor to examine.”
- “I need a medical certificate.”
- “I’d like to ask about a vaccination.”
- “I’m calling about a problem that started yesterday.”

A useful structure is:

> “I’ve been experiencing [general symptom or problem] for [length of time], and I’d like to see a doctor.”

For example:

> “I’ve been experiencing pain in my shoulder for about a week, and it is not improving.”

You do not need to give intimate or highly detailed information to the receptionist. You can say:

- “It’s a private medical issue.”
- “I would prefer to discuss the details directly with the doctor.”
- “Could you note that it concerns a personal health matter?”
- “Is a general description enough for the booking?”

## Explain How Urgent It Is

The receptionist may ask whether the problem is urgent.

Useful phrases include:

- “It is not an emergency, but I would like to be seen soon.”
- “The symptoms are getting worse.”
- “I’m in significant discomfort.”
- “I’m concerned because the problem has continued for several days.”
- “A doctor asked me to arrange an urgent follow-up.”
- “I think a routine appointment is sufficient.”
- “I’m not sure how urgent it is.”
- “Could a nurse call me to discuss whether I need an earlier appointment?”

The receptionist may offer:

- A routine appointment
- A same-day appointment
- An urgent appointment
- A telephone consultation
- A video consultation
- A nurse consultation
- An appointment with another available doctor

The receptionist is not always qualified to diagnose the problem. Their role is usually to collect enough information to direct you to the appropriate service.

## Understand Emergency Instructions

A medical office may tell you to contact emergency services instead of waiting for an appointment if your symptoms appear immediately dangerous.

During a real call, follow the clinic’s instructions. Do not rely on a language-learning simulation to decide whether a situation is an emergency.

Useful phrases include:

- “Do you think I should wait for an appointment?”
- “Should I speak with a nurse first?”
- “Is there an urgent care service I should contact?”
- “Could you repeat the emergency instructions?”
- “Which number should I call?”
- “Could you tell me the name of the service?”

If you believe there is an immediate danger to someone’s life or safety, contact the local emergency service.

## Choose the Right Appointment Type

Different concerns may require different types of appointments.

Common options include:

- **Routine appointment** — for a non-urgent medical concern
- **Urgent appointment** — for a problem that needs quicker assessment
- **Follow-up appointment** — to review progress after an earlier visit
- **Telephone consultation** — a conversation with a doctor by phone
- **Video consultation** — an online appointment with video
- **In-person consultation** — a visit at the clinic
- **Nurse appointment** — for services such as dressings, injections, or some routine checks
- **Specialist appointment** — a consultation with a doctor in a specific medical field

Useful questions include:

- “Do I need an in-person appointment?”
- “Could this be handled by telephone?”
- “Is a video consultation available?”
- “Should I book with a doctor or a nurse?”
- “Do I need a referral to see the specialist?”
- “Can any doctor help me, or should I see my regular doctor?”
- “How long is the appointment?”
- “Is this the correct type of appointment for my issue?”

## Ask for a Specific Doctor

You may want to see your regular doctor or a doctor with a particular specialty.

You can say:

- “I’d prefer to see Dr. Avery.”
- “Is my regular doctor available?”
- “I have seen Dr. Avery about this problem before.”
- “Could I book with a female doctor?”
- “Could I book with a male doctor?”
- “Is there a doctor who speaks English?”
- “I need an appointment with a dermatologist.”
- “Could I see any available doctor?”
- “I’m happy to see another doctor if I can get an earlier appointment.”

The receptionist may respond:

- “Your regular doctor is not available this week.”
- “Another doctor can see you tomorrow.”
- “The earliest appointment with Dr. Avery is next Tuesday.”
- “You will need a referral before seeing that specialist.”

## State Your Availability

Be specific about the dates and times that work for you.

Useful phrases include:

- “I’m available on Monday afternoon.”
- “I can come any morning this week.”
- “Do you have anything after five?”
- “I’m not available before three.”
- “Could I come during my lunch break?”
- “I would prefer the earliest available appointment.”
- “Is there anything available today?”
- “Do you have an appointment tomorrow morning?”
- “I can be flexible with the time.”
- “I’m available every day except Thursday.”

The receptionist may offer:

> “We have an appointment on Wednesday at 10:20 or Friday at 3:45.”

You can respond:

- “Wednesday at 10:20 works for me.”
- “Could you check whether anything earlier is available?”
- “Friday would be better.”
- “Unfortunately, I’ll be at work then.”
- “Do you have anything later in the day?”
- “I’ll take the earliest option.”

## Confirm Dates and Times Carefully

Dates and times can be difficult to understand over the phone. Always confirm them.

Useful phrases include:

- “Did you say Tuesday the fourteenth?”
- “Was that 9:15 or 9:50?”
- “Could you repeat the time slowly?”
- “So the appointment is on Friday at half past two, correct?”
- “Could you use the twenty-four-hour time?”
- “Is that appointment in the morning or the afternoon?”
- “Could you send me a confirmation message?”

It is useful to repeat the final details:

> “Let me confirm: Tuesday, July fourteenth, at 3:30 with Dr. Avery.”

## Ask About the Location

Some clinics operate in more than one building or location.

You can ask:

- “Which clinic is the appointment at?”
- “Could you give me the address?”
- “Which floor should I go to?”
- “Which reception desk should I use?”
- “Is the entrance accessible?”
- “Is there parking nearby?”
- “How early should I arrive?”
- “Where should I check in?”
- “Is the appointment at the main clinic or the specialist centre?”

## Ask What to Bring

Depending on the appointment, you may need to bring documents, medication information, or test results.

Useful questions include:

- “What should I bring with me?”
- “Do I need identification?”
- “Should I bring my insurance card?”
- “Do I need a referral?”
- “Should I bring my previous test results?”
- “Do I need a list of my current medications?”
- “Should I prepare anything before the appointment?”
- “Do I need to avoid eating before the visit?”
- “Will you send the instructions by email?”

Do not fast, stop medication, or change treatment based only on assumptions. Ask the clinic for specific instructions.

## Ask About Costs and Insurance

You may need to confirm whether the appointment is covered or requires payment.

Useful questions include:

- “Is this appointment covered by my insurance?”
- “Do you accept my insurance provider?”
- “Is there a consultation fee?”
- “How much will the appointment cost?”
- “Do I need to pay in advance?”
- “Can I pay by card?”
- “Will I receive an invoice?”
- “Do I need authorization from my insurance company?”
- “Is there a fee if I cancel?”

The receptionist may need your insurance or patient number to check coverage.

## Request Language Assistance

If you are not confident speaking the local language, ask whether language support is available.

You can say:

- “Do you have a doctor who speaks English?”
- “Is an interpreter available?”
- “Can I bring someone to help me translate?”
- “Could the appointment be conducted in English?”
- “Could you speak a little more slowly, please?”
- “I understand some Polish, but I may need help with medical vocabulary.”
- “Could you send the important information in writing?”

Ask in advance whether another person is allowed to join the appointment.

## Ask for Accessibility Support

You can inform the clinic about any accessibility needs when making the appointment.

Useful phrases include:

- “I use a wheelchair. Is the clinic accessible?”
- “I need step-free access.”
- “I have difficulty hearing over the phone.”
- “Could the doctor communicate with me in writing?”
- “I need additional time for the appointment.”
- “Can someone help me enter the building?”
- “Is there an accessible toilet?”
- “Could you note my accessibility needs on the appointment?”

## Book an Appointment for Someone Else

You may be arranging an appointment for a child, family member, or someone you support.

You can say:

- “I’m calling to make an appointment for my son.”
- “I’m arranging the appointment for my mother.”
- “The patient’s name is…”
- “I have permission to arrange the appointment.”
- “Does the patient need to speak with you directly?”
- “Do you need their consent?”
- “Can I attend the appointment with them?”

Privacy rules may limit what the clinic can discuss without the patient’s consent.

## Reschedule an Appointment

If you cannot attend, contact the clinic as early as possible.

Useful phrases include:

- “I need to reschedule my appointment.”
- “I’m no longer available at that time.”
- “Could I move the appointment to another day?”
- “Do you have anything available next week?”
- “Could I change it to a telephone consultation?”
- “I would like to keep the same doctor.”
- “What is the earliest alternative appointment?”

You may need to provide:

- Your full name
- Your date of birth
- The original appointment date
- The doctor’s name
- Your patient or booking number

## Cancel an Appointment

To cancel, say:

- “I need to cancel my appointment.”
- “I will not be able to attend.”
- “The appointment is on Monday at two.”
- “Could you confirm that it has been cancelled?”
- “Is there a cancellation fee?”
- “Do I need to book another appointment now?”
- “Could you send me a cancellation confirmation?”

Cancelling early may allow another patient to use the appointment.

## Join a Cancellation List

If no suitable appointment is available, ask whether the clinic has a waiting or cancellation list.

Useful phrases include:

- “Could you add me to the cancellation list?”
- “Please contact me if an earlier appointment becomes available.”
- “I can come at short notice.”
- “How will you contact me?”
- “How quickly would I need to respond?”
- “Could you keep my current appointment while I wait for an earlier one?”

## Handle an Unavailable Appointment

The receptionist may say:

- “There are no appointments available today.”
- “The doctor is fully booked.”
- “The next available appointment is in two weeks.”
- “Your regular doctor is currently away.”
- “We only have telephone appointments available.”

You can respond:

- “Is another doctor available?”
- “Could I speak with a nurse?”
- “Is there another clinic I can contact?”
- “Could you add me to the cancellation list?”
- “What should I do if the symptoms get worse?”
- “Is there an urgent care service?”
- “Could I have a telephone consultation first?”

## Confirm the Appointment

Before ending the call, confirm:

- The patient’s name
- The doctor or healthcare professional
- The date
- The time
- The appointment type
- The location or call method
- Anything you need to bring
- Any preparation instructions
- The cancellation policy

You can say:

- “Could we confirm all the details?”
- “Who will I be seeing?”
- “Is this an in-person or telephone appointment?”
- “Will the doctor call me, or should I call the clinic?”
- “Which number will the doctor use?”
- “Should I arrive early?”
- “Will I receive a text or email confirmation?”
- “What should I do if I need to cancel?”

## A Simple Appointment Conversation

A typical conversation may look like this:

> **Receptionist:** Good morning. Dr. Avery’s office. How can I help?  
> **Patient:** Hello, I’d like to make an appointment, please.  
> **Receptionist:** Certainly. Are you already registered with the clinic?  
> **Patient:** Yes. My name is Alex Dmowski.  
> **Receptionist:** Thank you. What is the general reason for the appointment?  
> **Patient:** I’ve had pain in my shoulder for about a week, and it is not improving.  
> **Receptionist:** Would you like an in-person appointment?  
> **Patient:** Yes, please. Do you have anything available this week?  
> **Receptionist:** We have Thursday at 11:20 or Friday at 4:10.  
> **Patient:** Friday at 4:10 would be better.  
> **Receptionist:** That will be with Dr. Avery at our Central Clinic.  
> **Patient:** Great. Should I bring anything with me?  
> **Receptionist:** Please bring identification and a list of any medication you currently take.  
> **Patient:** Let me confirm: Friday at 4:10 at the Central Clinic with Dr. Avery.  
> **Receptionist:** That’s correct.

## A Simple Appointment Formula

Follow this structure when booking:

1. **Request:** Say that you want to make an appointment.
2. **Identify yourself:** Give the required personal details.
3. **Explain briefly:** State the general reason for the visit.
4. **Discuss urgency:** Explain whether the issue is routine or needs quicker attention.
5. **Choose a time:** State your availability and select an appointment.
6. **Ask practical questions:** Confirm the location, appointment type, costs, and required documents.
7. **Repeat the details:** Confirm the date, time, doctor, and next steps.

For example:

> “I’d like to make an appointment about recurring headaches. It is not an emergency, but I would like to see a doctor this week. I’m available after three on Wednesday or Friday.”

## Practice Scenario

In this roleplay, you are calling Dr. Avery’s office to arrange a medical appointment. The AI receptionist will ask for your details, the general reason for the visit, and your availability.

During the conversation, try to:

- State that you would like to make an appointment.
- Provide your name and any requested patient details.
- Briefly explain the reason for the visit.
- Say whether the problem is routine or needs quicker attention.
- Ask about in-person, telephone, or video appointment options.
- Compare at least two available times.
- Ask what documents or information you should bring.
- Confirm the appointment date, time, doctor, location, and next steps.

Focus on communicating the necessary information clearly. You do not need to describe private medical details or use advanced medical vocabulary.`),
  category: {
    categoryTitle: i18n._('Health'),
    categoryId: 'health',
  },
  input: [
    {
      type: 'checkbox',
      labelForAi: '',
      labelForUser: i18n._(
        'I understand that this is a simulation for language practice and not a real medical consultation.',
      ),
      id: 'aware',
      placeholder: '',
      defaultValue: '',
      required: true,
    },
  ],

  subTitle: i18n._(
    'Practice explaining why you need an appointment, choosing a time, and confirming the details',
  ),
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
    'Good morning. You’ve reached Dr. Avery’s office. This is Ash speaking. How can I help you today?',
  illustrationDescription:
    'A person sitting at a desk and speaking on the phone while checking available dates on a laptop calendar. A medical clinic receptionist wearing a headset is shown arranging the appointment.',
  imageSrc: '/role/8226d079-3d2c-4122-81bc-dd1f9850603b.webp',
  voice: 'ash',
});
