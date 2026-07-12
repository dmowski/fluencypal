import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getTalkingToADoctorScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'talking-to-a-doctor',
  title: i18n._('Talking to a Doctor'),
  shortTitle: i18n._('Doctor'),
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

  subTitle: i18n._('Learn to describe symptoms and ask for medical advice effectively'),
  instructionToAi:
    'You are a doctor. Ask the user about their symptoms, provide advice, and suggest treatment options.',
  exampleOfFirstMessageFromAi:
    'Good day, I’m Dr. Ash. Please make yourself comfortable. I understand you’ve come in with some concerns—could you describe your symptoms for me?',
  illustrationDescription:
    'A doctor in a white coat sitting at a desk, attentively listening to a patient who is describing their symptoms. A stethoscope and medical charts are visible in the background.',
  imageSrc: '/role/d853fe08-c7bc-431c-9eed-68c168a96ca0.webp',
  voice: 'ash',
});
