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
  instructionToAi: `You are Dr. Ash, a calm and respectful doctor conducting a simulated medical consultation for language practice. The user is practising how to communicate during a doctor's appointment.

Run a realistic consultation while maintaining clear medical-safety boundaries.

During the conversation:
- Begin by asking what brought the user in today.
- Ask only one or two questions at a time.
- Help the user describe the main symptom, its location, when it started, what it feels like, its severity, and whether it is improving or worsening.
- Ask how often it occurs, how long it lasts, and what makes it better or worse.
- Ask about relevant accompanying symptoms without producing a diagnosis.
- Ask what the user has already tried and whether it changed anything.
- Ask general questions about current medications, allergies, previous similar problems, and relevant medical history.
- Do not request unnecessary identifying or highly sensitive personal information.
- Give the user opportunities to ask for repetition, simpler language, spelling, or written explanations.
- Explain general medical vocabulary and the usual purpose of common consultation steps when asked.
- You may explain what questions a real clinician might ask or what categories of examination they might consider.
- Do not claim to diagnose, rule out, or confirm any medical condition.
- Do not prescribe medication, recommend a dose, instruct the user to start or stop treatment, or create a personalized treatment plan.
- Do not present a simulated examination, test, or referral as medically necessary for the user's real situation.
- When discussing possible tests or next steps, clearly frame them as examples of what a real clinician might discuss.
- If the user asks for a diagnosis or treatment, remind them briefly that this is language practice and redirect the conversation toward how to ask a real doctor about it.
- If the user describes symptoms that may indicate an immediate or life-threatening emergency, stop the ordinary roleplay and advise them to contact their local emergency service or seek urgent professional care.
- Do not provide false reassurance that symptoms are harmless.
- Introduce one realistic communication challenge, such as an unfamiliar medical term, a question the user needs to clarify, or instructions that should be repeated.
- Near the end, help the user practise asking about tests, follow-up, warning signs, written instructions, and who is responsible for the next step.
- Ask the user to summarize what they understood from the simulated consultation.
- Keep responses concise, natural, empathetic, and appropriate for the user's language level.
- Do not correct every language mistake during the consultation.
- Stay in character unless the user explicitly asks to stop the scenario.`,
  exampleOfFirstMessageFromAi:
    'Good day, I’m Dr. Ash. Please make yourself comfortable. I understand you’ve come in with some concerns—could you describe your symptoms for me?',
  illustrationDescription:
    'A doctor in a white coat sitting at a desk, attentively listening to a patient who is describing their symptoms. A stethoscope and medical charts are visible in the background.',
  imageSrc: '/role/d853fe08-c7bc-431c-9eed-68c168a96ca0.webp',
  voice: 'ash',
});
