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
  instructionToAi:
    "You are a receptionist at a doctor's office. Ask the user for their name, preferred date, and reason for the appointment.",
  exampleOfFirstMessageFromAi:
    'Hello, you’ve reached Dr. Avery’s office. This is Ash speaking. May I have your name, and what’s the reason for your appointment? Also, let me know if you have any date preferences.',
  illustrationDescription:
    "A person sitting at a desk, talking on the phone while checking a calendar on their laptop, looking focused as they schedule a doctor's appointment.",
  imageSrc: '/role/8226d079-3d2c-4122-81bc-dd1f9850603b.webp',
  voice: 'ash',
});
