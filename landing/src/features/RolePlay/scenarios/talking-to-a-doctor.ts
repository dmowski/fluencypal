import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getTalkingToADoctorScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'talking-to-a-doctor',
  title: i18n._('Talking to a Doctor'),
  shortTitle: i18n._('Doctor'),
  landingHighlight: i18n._(
    'Practice describing symptoms, answering a doctor’s questions, discussing your medical history, and confirming the next steps after a consultation.',
  ),
  contentPage:
    i18n._(`Talking to a doctor can be difficult, especially when you need to describe symptoms in another language. You may need to explain what you feel, when the problem started, how serious it is, and how it affects your daily life.

You do not need advanced medical vocabulary. Clear descriptions, specific examples, and honest answers are usually more useful than trying to guess the name of a condition.

This roleplay is for language practice only. It cannot diagnose a medical condition, recommend treatment, or replace professional medical care. If you believe you may be experiencing a medical emergency, contact your local emergency service.

## Start the Consultation

A doctor may begin by asking:

- “What brings you in today?”
- “How can I help you?”
- “What seems to be the problem?”
- “Could you describe your symptoms?”
- “When did this begin?”
- “Have you experienced this before?”

You can begin with a short summary:

- “I’ve had a persistent cough for about a week.”
- “I’ve been experiencing pain in my lower back.”
- “I’ve been feeling unusually tired recently.”
- “I have a rash on my arm that is not improving.”
- “I’ve been getting headaches more often than usual.”
- “I’m here to discuss the results of my recent tests.”
- “I’m following up about a problem we discussed previously.”

A useful opening structure is:

> “I’ve been experiencing [symptom] for [length of time], and it is [improving, getting worse, or staying the same].”

For example:

> “I’ve been experiencing pain in my right shoulder for about ten days, and it seems to be getting worse.”

## Describe Where the Problem Is

Be as specific as possible about the location of pain or discomfort.

Useful phrases include:

- “The pain is in my lower back.”
- “It hurts on the right side of my chest.”
- “I feel discomfort behind my left knee.”
- “The pain starts in my neck and moves into my shoulder.”
- “The rash is mainly on my arms.”
- “My whole body feels sore.”
- “It is difficult to identify the exact location.”
- “The pain seems to move.”

The doctor may ask:

- “Can you point to where it hurts?”
- “Is it on one side or both sides?”
- “Does the pain move anywhere else?”
- “Is the discomfort near the surface or deeper inside?”
- “Is the affected area sensitive to touch?”

## Explain When It Started

The doctor will often ask when the symptoms began and whether anything happened beforehand.

You can say:

- “It started this morning.”
- “I first noticed it three days ago.”
- “The symptoms began gradually.”
- “It started suddenly while I was exercising.”
- “It began after I returned from a trip.”
- “I noticed it after starting a new medication.”
- “I woke up with the pain.”
- “I cannot remember exactly when it started.”

Useful questions you may hear:

- “Did it begin suddenly or gradually?”
- “What were you doing when it started?”
- “Did anything unusual happen beforehand?”
- “Have the symptoms changed since then?”
- “Was there an injury?”

## Describe How It Feels

Try to describe the sensation rather than only saying that something hurts.

Pain or discomfort may feel:

- Sharp
- Dull
- Burning
- Throbbing
- Stabbing
- Aching
- Cramping
- Tight
- Heavy
- Tingling
- Numb
- Itchy
- Sensitive
- Tender

Examples:

- “It feels like a dull ache.”
- “I sometimes feel a sharp pain.”
- “There is a burning sensation.”
- “My fingers feel numb.”
- “The area is itchy and sensitive.”
- “It feels like pressure rather than pain.”
- “My chest feels tight.”
- “I have a tingling sensation in my hand.”

If you do not know the exact word, describe it in another way:

> “It feels as if something is pressing on the area.”

## Explain How Severe It Is

A doctor may ask you to rate pain or discomfort on a scale from zero to ten.

- **Zero** means no pain.
- **Ten** means the worst pain you can imagine.

You can say:

- “The pain is about a four out of ten.”
- “It is mild most of the time.”
- “It becomes severe in the evening.”
- “It is uncomfortable, but I can still work.”
- “The pain is strong enough to wake me up.”
- “It is difficult to walk because of it.”
- “The symptoms interfere with my daily activities.”

It is also helpful to explain what you can or cannot do:

- “I can walk, but climbing stairs is painful.”
- “I cannot concentrate at work.”
- “I have difficulty sleeping.”
- “I can eat normally.”
- “I become tired after minor physical activity.”
- “I have had to stop exercising.”

## Explain How Often It Happens

Symptoms may be constant or may come and go.

Useful phrases include:

- “The pain is constant.”
- “It comes and goes.”
- “It happens several times a day.”
- “It usually lasts for about twenty minutes.”
- “The symptoms are worse in the morning.”
- “It happens mainly after eating.”
- “It only happens when I exercise.”
- “I feel better after resting.”
- “There does not seem to be a pattern.”

The doctor may ask:

- “How long does each episode last?”
- “Does it happen every day?”
- “Is it worse at a particular time?”
- “Does anything trigger it?”
- “Does anything make it better?”

## Describe What Makes It Better or Worse

Explain whether movement, food, rest, medication, or another factor changes your symptoms.

You can say:

- “It gets worse when I move.”
- “The pain increases when I take a deep breath.”
- “It feels better after I rest.”
- “Heat seems to help.”
- “The symptoms are worse after meals.”
- “It improves when I lie down.”
- “Pain relief helped temporarily.”
- “Nothing seems to make a difference.”
- “The problem becomes worse when I am stressed.”

Useful vocabulary:

- **Trigger** — something that causes or worsens a symptom
- **Relieve** — make a symptom less severe
- **Aggravate** — make a symptom worse

## Mention Other Symptoms

The doctor may ask whether you have noticed any other changes.

Common questions include:

- “Do you have a fever?”
- “Have you felt sick or vomited?”
- “Have you noticed any swelling?”
- “Have you lost your appetite?”
- “Have you experienced dizziness?”
- “Are you short of breath?”
- “Have you had difficulty sleeping?”
- “Have you noticed any changes in your weight?”
- “Do you have any weakness or numbness?”

You can respond:

- “I also have a mild fever.”
- “I have felt dizzy a few times.”
- “There is some swelling around the area.”
- “I have not noticed any other symptoms.”
- “My appetite is normal.”
- “I have been sleeping poorly.”
- “I feel tired, but I do not have a fever.”

Do not leave out a symptom because you think it is unrelated. The doctor can decide whether it is relevant.

## Explain What You Have Already Tried

Tell the doctor whether you have taken medication, changed your routine, or tried another solution.

You can say:

- “I have been resting.”
- “I tried an over-the-counter pain reliever.”
- “I used a cold compress.”
- “I stopped exercising for several days.”
- “I changed my diet, but it did not help.”
- “The medication helped for a few hours.”
- “I have not tried anything yet.”
- “I spoke with a pharmacist before making this appointment.”

Be ready to explain:

- What you used
- How much you used
- How often you used it
- Whether it helped
- Whether you noticed side effects

Do not pretend to remember details that you do not know. You can say:

- “I don’t remember the exact name.”
- “I can show you the package.”
- “I’m not sure about the dosage.”
- “I took it according to the instructions on the label.”

## Discuss Current Medication

The doctor may need to know about all medication and supplements you take.

You can say:

- “I take this medication every morning.”
- “I use an inhaler when necessary.”
- “I recently started taking a new prescription.”
- “I stopped taking it last week.”
- “I occasionally take an over-the-counter pain reliever.”
- “I’m not currently taking any medication.”
- “I have a list of my medications with me.”

The doctor may ask:

- “What dose do you take?”
- “How long have you been taking it?”
- “Who prescribed it?”
- “Have you missed any doses?”
- “Have you noticed any side effects?”

Do not stop prescribed medication based only on a language-learning simulation. Discuss medication changes with a qualified healthcare professional.

## Mention Allergies

Tell the doctor about medication, food, or other allergies.

Useful phrases include:

- “I’m allergic to penicillin.”
- “I have a severe peanut allergy.”
- “This medication caused a rash in the past.”
- “I do not have any known allergies.”
- “I’m not sure whether it was an allergic reaction.”
- “I experienced swelling after taking that medicine.”

The doctor may ask what happened during the reaction and how serious it was.

## Discuss Your Medical History

The doctor may ask about previous illnesses, injuries, operations, or similar symptoms.

You can say:

- “I had the same problem two years ago.”
- “I have a history of back problems.”
- “I had surgery five years ago.”
- “I was treated for this previously.”
- “I have not experienced this before.”
- “I have a long-term medical condition.”
- “I was recently in hospital.”
- “I have brought my previous test results.”

You may also be asked about health conditions in your family:

- “Does anyone in your family have a similar condition?”
- “Is there a family history of heart disease?”
- “Do any close relatives have diabetes?”

You can say:

- “My father has a similar condition.”
- “There is no known family history.”
- “I’m not sure.”
- “I would need to check.”

## Answer Lifestyle Questions

A doctor may ask about sleep, exercise, diet, alcohol, smoking, work, or stress because these factors can affect health.

You may hear:

- “Do you smoke?”
- “How often do you exercise?”
- “How much alcohol do you drink?”
- “How have you been sleeping?”
- “Has anything changed in your diet?”
- “Are you under unusual stress?”
- “What kind of work do you do?”

Answer as honestly as possible. The purpose is to understand your health, not to judge you.

Useful phrases include:

- “I do not smoke.”
- “I drink occasionally.”
- “I exercise two or three times a week.”
- “I sit at a desk for most of the day.”
- “I have been sleeping less than usual.”
- “My work has been particularly stressful recently.”
- “There have been no major lifestyle changes.”

## Ask the Doctor to Clarify

Medical explanations may contain unfamiliar words. It is always acceptable to ask for simpler language.

Useful phrases include:

- “Could you explain that in simpler terms?”
- “What does that word mean?”
- “Could you repeat that more slowly?”
- “Could you write the name down?”
- “I’m not sure I understood.”
- “Does that mean the problem is serious?”
- “Could you show me where that is?”
- “Could you explain what you are checking for?”
- “Could you give me the instructions in writing?”

To check your understanding, summarize what you heard:

> “So you are saying that we need more information before we know what is causing the problem. Is that correct?”

## Understand Examinations and Tests

During a consultation, a doctor may suggest an examination or test to gather more information.

Common examples include:

- A physical examination
- A blood test
- A urine test
- A swab
- An X-ray
- An ultrasound
- Another type of scan
- A referral to a specialist
- Monitoring the symptoms for a period of time

Useful questions include:

- “What is this test for?”
- “How should I prepare?”
- “Will it be painful?”
- “Are there any risks?”
- “How long will it take?”
- “When will the results be available?”
- “How will I receive the results?”
- “Do I need another appointment?”
- “What happens if the result is abnormal?”
- “Is there an alternative?”

The AI roleplay should only help you practise these conversations. It should not claim that a particular test is medically necessary for your real symptoms.

## Discuss a Possible Plan

A real doctor may explain possible next steps, but you should ask questions before agreeing to anything you do not understand.

Useful questions include:

- “What are the next steps?”
- “What are the available options?”
- “What is the purpose of this medication?”
- “How should it be taken?”
- “Are there common side effects?”
- “Could it interact with my other medication?”
- “How soon should I expect an improvement?”
- “What should I do if it does not help?”
- “Is there anything I should avoid?”
- “Do I need to change my normal activities?”

You can also ask:

- “Are there any alternatives?”
- “What would happen if we waited?”
- “Do I need to decide today?”
- “Could I have some written information?”
- “Should I speak with a specialist?”

The roleplay may practise asking these questions, but it must not prescribe medication or create a real treatment plan.

## Confirm Medication Instructions

If a real clinician prescribes medication, confirm exactly how it should be used.

You may need to understand:

- The medication name
- The dose
- How often to take it
- When to take it
- How long to take it
- Whether to take it with food
- Possible side effects
- What to do if you miss a dose

Useful phrases include:

- “How often should I take it?”
- “Should I take it before or after food?”
- “How many days should I use it?”
- “What should I do if I miss a dose?”
- “Are there any side effects I should watch for?”
- “Can I take it with my other medication?”
- “Could you write the instructions down?”

Do not rely on the roleplay for real dosing instructions. Follow the directions given by your doctor or pharmacist.

## Ask When to Seek More Help

Before leaving, ask what to do if the symptoms continue or become worse.

Useful questions include:

- “When should I contact the clinic again?”
- “What should I do if the symptoms get worse?”
- “Which changes should I watch for?”
- “When should I arrange a follow-up?”
- “Who should I contact outside normal hours?”
- “Should I go to urgent care if this happens again?”
- “How long should I wait before asking for another appointment?”

A real healthcare professional can give safety instructions based on your specific situation. A simulation cannot assess your personal medical risk.

## Request a Referral or Follow-Up

The doctor may recommend another appointment or referral.

You can ask:

- “Do I need to see a specialist?”
- “Will you send the referral?”
- “Do I need to contact the specialist myself?”
- “How long does the referral usually take?”
- “Should I book a follow-up appointment?”
- “When should I come back?”
- “Will we discuss the test results at the next visit?”
- “Can the follow-up be done by phone?”

Before leaving, confirm who is responsible for the next action.

## Discuss Privacy or Sensitive Topics

Some health concerns may be difficult to discuss.

You can say:

- “This is difficult for me to talk about.”
- “I would prefer to discuss this privately.”
- “Could the other person leave the room?”
- “Could I speak with a doctor of a particular gender?”
- “I need a moment before I continue.”
- “I’m not sure how to describe the problem.”
- “Could I write it down instead?”

You can also ask:

- “Will this information remain confidential?”
- “Who will have access to my medical information?”
- “Can I bring someone I trust into the consultation?”

## Take Notes and Check Your Understanding

It can be difficult to remember everything discussed during an appointment.

You can say:

- “Do you mind if I take notes?”
- “Could you write down the important instructions?”
- “Could you repeat the name of the test?”
- “Can I receive a summary after the appointment?”
- “Let me make sure I understood correctly.”

A useful method is to repeat the plan in your own words:

> “So I need to complete the test, continue tracking the symptoms, and arrange another appointment after the results are available. Is that correct?”

This technique helps identify misunderstandings before you leave.

## A Simple Doctor Conversation

A typical consultation may look like this:

> **Doctor:** What brings you in today?  
> **Patient:** I’ve had pain in my lower back for about a week, and it is not improving.  
> **Doctor:** Did it begin suddenly or gradually?  
> **Patient:** Gradually. I first noticed it after working at my desk for several hours.  
> **Doctor:** How would you describe the pain?  
> **Patient:** It is usually a dull ache, but I sometimes feel a sharp pain when I stand up.  
> **Doctor:** How severe is it?  
> **Patient:** About five out of ten. It is worse in the evening.  
> **Doctor:** Have you tried anything for it?  
> **Patient:** I have been resting, but that has not made much difference.  
> **Doctor:** Do you have any other symptoms?  
> **Patient:** No, I have not noticed anything else.  
> **Doctor:** Thank you. I would now ask some additional questions and explain what a clinician might examine.  
> **Patient:** Before we continue, could you explain what you are checking for?

## A Simple Symptom Formula

When describing a health concern, include:

1. **Main symptom:** What is bothering you?
2. **Location:** Where do you feel it?
3. **Onset:** When and how did it begin?
4. **Description:** What does it feel like?
5. **Severity:** How strong or disruptive is it?
6. **Pattern:** Is it constant, occasional, improving, or worsening?
7. **Triggers:** What makes it better or worse?
8. **Other symptoms:** Have you noticed anything else?
9. **Previous attempts:** What have you already tried?
10. **Questions:** What do you want the doctor to explain?

For example:

> “I’ve had a sharp pain in my right shoulder for ten days. It is about six out of ten and becomes worse when I lift my arm. Rest helps a little, but the problem is not improving.”

## Practice Scenario

In this roleplay, you are attending an appointment with Dr. Ash. The AI doctor will help you practise describing a health concern, answering common questions, and understanding the structure of a medical consultation.

During the conversation, try to:

- Give a short summary of your main concern.
- Explain when the symptoms started.
- Describe their location, severity, and frequency.
- Say what makes them better or worse.
- Mention any related symptoms.
- Explain what you have already tried.
- Answer general questions about medication, allergies, and medical history.
- Ask for clarification when you do not understand something.
- Ask what a real patient might need to confirm about tests or next steps.
- Summarize the conversation in your own words before it ends.

Focus on describing your experience clearly. Do not use this simulation to obtain a diagnosis, medication recommendation, or treatment plan.`),
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
    'Practice describing symptoms, answering medical questions, and confirming next steps',
  ),
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
    'Good day. I’m Dr. Ash. This is a language-practice consultation, not a real medical assessment. What brought you in today?',
  illustrationDescription:
    'A doctor in a white coat sitting at a desk and listening attentively to a patient describing their symptoms. A stethoscope, computer, and medical notes are visible in a calm and professional consultation room.',
  imageSrc: '/role/d853fe08-c7bc-431c-9eed-68c168a96ca0.webp',
  voice: 'ash',
});
