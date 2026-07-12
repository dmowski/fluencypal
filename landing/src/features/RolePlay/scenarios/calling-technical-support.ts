import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getCallingTechnicalSupportScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'calling-technical-support',
  title: i18n._('Calling Technical Support'),
  shortTitle: i18n._('Technical Support'),
  landingHighlight: i18n._(
    'Practice describing a technical problem, following troubleshooting instructions, confirming results, and requesting further support.',
  ),
  contentPage:
    i18n._(`Calling technical support can be stressful, especially when you need to explain a complicated problem in another language. A good support conversation is usually structured: describe the problem, answer a few questions, try one solution at a time, and confirm whether anything has changed.

You do not need to know advanced technical vocabulary. Clear descriptions and specific examples are more useful than complicated language.

## Prepare Before You Call

Before contacting support, collect the information that may help the agent understand the issue:

- The type of device you are using
- The device model, if you know it
- The name of the app, website, or service
- The operating system or software version
- The exact error message
- When the problem started
- What you were doing when it happened
- What troubleshooting steps you have already tried
- Your account or ticket number, if relevant

You can say:

- “I’m calling about a problem with my laptop.”
- “I’m having trouble with your mobile app.”
- “The problem started this morning.”
- “It was working normally yesterday.”
- “I have already restarted the device.”
- “I can see an error message on the screen.”

## Start the Conversation

A support agent may begin by asking:

- “How can I help you today?”
- “Could you describe the problem?”
- “Which device are you using?”
- “When did the issue begin?”
- “Are you seeing an error message?”
- “Have you tried any troubleshooting steps?”
- “May I have your account or reference number?”

A clear opening description might be:

> “I’m having trouble connecting my laptop to Wi-Fi. It can see the network, but it cannot connect. The problem started about an hour ago.”

Another example:

> “The application closes every time I try to upload a file. I updated it yesterday, and the issue started after the update.”

## Describe the Problem Clearly

A useful problem description answers four questions:

1. **What are you using?**
2. **What are you trying to do?**
3. **What happens instead?**
4. **When did the problem begin?**

Use this pattern:

> “I’m using [device or service]. I’m trying to [action], but [problem]. It started [time].”

For example:

> “I’m using the desktop version of the application. I’m trying to sign in, but the page keeps loading and never opens. It started this morning.”

Useful phrases include:

- “The screen is completely blank.”
- “The application keeps crashing.”
- “The device will not turn on.”
- “The internet connection keeps dropping.”
- “I cannot log in to my account.”
- “The page is loading very slowly.”
- “The sound is not working.”
- “My microphone is not being detected.”
- “The file will not upload.”
- “The payment did not go through.”
- “The device is frozen.”
- “The button does not respond.”
- “It works sometimes, but not consistently.”

## Explain What You Expected

It can help to compare the actual result with the expected result.

For example:

- “Normally, the dashboard appears after I log in.”
- “I expected the file to upload, but nothing happened.”
- “The headphones should connect automatically.”
- “The confirmation email usually arrives immediately.”
- “The camera works in other applications, but not in this one.”

A useful structure is:

> “Normally, [expected result], but now [actual result].”

For example:

> “Normally, the application opens in a few seconds, but now it closes immediately.”

## Report an Error Message

If you see an error, read it exactly or describe it as accurately as possible.

You can say:

- “The message says, ‘Connection failed.’”
- “I’m getting error code 403.”
- “A pop-up says that I do not have permission.”
- “The screen says the account cannot be found.”
- “I don’t remember the exact wording.”
- “Could I spell the error message for you?”
- “I can send you a screenshot if that would help.”

To make sure the agent understands a code or number, say:

- “That is four-zero-three.”
- “The reference number is A as in Alpha, B as in Bravo, seven-two.”
- “Let me repeat that.”
- “Did you get the whole number?”

## Explain When and How Often It Happens

The agent may need to know whether the issue happens every time or only under certain conditions.

Useful phrases include:

- “It happens every time.”
- “It only happens occasionally.”
- “It happens after a few minutes.”
- “It started after the latest update.”
- “It only happens when I use Wi-Fi.”
- “It works on my phone, but not on my laptop.”
- “It happens with every file.”
- “It only happens with large files.”
- “The problem disappears after I restart the app.”
- “I can reproduce the problem.”

You may be asked:

- “Can you reproduce the issue?”
- “Does it happen on another device?”
- “Does it happen with a different browser?”
- “Is anyone else experiencing the same problem?”
- “Did anything change before the problem started?”

## Explain What You Have Already Tried

Tell the support agent what you have done so that you do not repeat unnecessary steps.

You can say:

- “I have already restarted the device.”
- “I tried turning the Wi-Fi off and on.”
- “I updated the application.”
- “I reinstalled the software.”
- “I tried another browser.”
- “I cleared the browser cache.”
- “I checked the cables.”
- “I reset my password.”
- “I tried using another account.”
- “None of those steps solved the problem.”

You can also describe the result:

- “Restarting helped temporarily.”
- “The error message changed after the update.”
- “It worked once, but the problem came back.”
- “There was no difference.”
- “Now I can log in, but the page is still very slow.”

## Follow Troubleshooting Instructions

The support agent may ask you to perform several steps.

Common instructions include:

- “Please restart the device.”
- “Open the settings menu.”
- “Select ‘Network and Internet.’”
- “Turn Bluetooth off and back on.”
- “Disconnect and reconnect the cable.”
- “Check whether an update is available.”
- “Try signing in again.”
- “Open the app in another browser.”
- “Please clear the cache.”
- “Uninstall and reinstall the application.”
- “Check whether the app has permission to use your microphone.”

After each instruction, explain what you see:

- “I’ve opened the settings.”
- “I can see that option.”
- “I don’t see that button.”
- “The menu looks different on my device.”
- “It is asking for a password.”
- “The device is restarting now.”
- “I’ve completed that step.”
- “The same error is still appearing.”
- “It seems to be working now.”

## Ask the Agent to Slow Down or Clarify

It is normal to ask the agent to repeat an instruction, especially during a phone conversation.

Useful phrases include:

- “Could you repeat that, please?”
- “Could you speak a little more slowly?”
- “What should I click next?”
- “Where can I find that setting?”
- “Did you say ‘restart’ or ‘reset’?”
- “Could you spell that word?”
- “Should I close the application first?”
- “Do you mean the button in the top-right corner?”
- “Could you guide me through it step by step?”
- “Please give me a moment to find that option.”

To confirm an instruction, say:

> “So first I close the application, then restart the device. Is that correct?”

This helps prevent mistakes and shows that you are following carefully.

## Understand Common Technical Terms

You may hear these terms during a support call:

- **Restart** — turn a device or application off and on again
- **Reset** — return a setting or device to an earlier or default state
- **Update** — install a newer software version
- **Reinstall** — remove software and install it again
- **Connection** — the link between a device and a network or service
- **Browser** — an application used to open websites
- **Cache** — temporarily stored data that may sometimes cause problems
- **Account credentials** — information used to access an account
- **Permissions** — settings that allow an application to use features or data
- **Backup** — a saved copy of important data
- **Factory reset** — deleting personal settings and returning a device to its original state
- **Remote access** — allowing another person or program to control your device
- **Escalation** — transferring a problem to a more specialized support team

Be careful with the difference between **restart** and **reset**. A reset may change settings or remove data, depending on the type of reset.

## Confirm Before Risky Steps

Some troubleshooting actions may affect your files, settings, or account.

Before continuing, ask:

- “Will this delete any of my data?”
- “Should I make a backup first?”
- “Will I need to sign in again?”
- “Will this reset all my settings?”
- “Can I undo this step?”
- “Is there a safer option we can try first?”
- “Will reinstalling the app remove my saved files?”
- “Could you explain what this step will change?”

Do not perform a factory reset, delete important files, or remove an account unless you understand the consequences.

## Protect Your Personal Information

A legitimate support agent may need to verify your identity, but you should still protect sensitive information.

Never share:

- Your complete password
- A one-time verification code unless you initiated and understand the process
- Your full payment-card details without a legitimate reason
- Recovery phrases or private cryptocurrency keys
- Unnecessary personal documents
- Remote access to your device unless you trust and contacted the company through an official channel

You can say:

- “I’m not comfortable sharing my password.”
- “Can you verify my identity another way?”
- “Why do you need that information?”
- “I contacted you through the official support number.”
- “I would prefer not to install remote-access software.”
- “Can you send the instructions through the official support portal?”

A real support agent should not need your account password.

## Test Whether the Solution Worked

After completing a troubleshooting step, test the original action again.

You can say:

- “Let me try opening the application again.”
- “I’ll test the microphone now.”
- “The page is loading correctly.”
- “The error is still there.”
- “The connection is more stable now.”
- “It works, but it is still slower than usual.”
- “The original problem is fixed.”
- “The problem returned after a few minutes.”

Be specific about what changed:

> “I can now log in, but I still cannot upload files.”

This tells the agent that one part of the issue is resolved while another remains.

## Ask About the Cause

Once the issue is fixed, you may want to understand why it happened and how to prevent it.

Useful questions include:

- “Do you know what caused the problem?”
- “Was this related to the latest update?”
- “Is this a known issue?”
- “Could it happen again?”
- “Is there anything I should do to prevent it?”
- “Should I keep this setting enabled?”
- “Do I need to install another update?”
- “Where can I check the service status?”

The agent may not know the exact cause immediately, but they may provide a likely explanation or prevention steps.

## Request Escalation or Further Support

Sometimes the first support agent cannot solve the problem.

You can ask:

- “Could you escalate this issue?”
- “Could I speak with a technical specialist?”
- “Can you create a support ticket?”
- “What happens next?”
- “When should I expect an update?”
- “How will your team contact me?”
- “Is there a reference number for this case?”
- “Do I need to provide any additional information?”
- “Should I call back if I do not receive a response?”

If the agent creates a ticket, confirm:

- The ticket or case number
- The next action
- Who will contact you
- The expected communication method
- Whether you need to keep the device available

For example:

> “Could you repeat the ticket number and explain what will happen next?”

## Ask for a Replacement, Refund, or Repair

If troubleshooting cannot solve the problem, the next step may involve a repair, replacement, or refund.

Useful questions include:

- “Is the device still under warranty?”
- “Can the product be repaired?”
- “Am I eligible for a replacement?”
- “Can I request a refund?”
- “How long will the repair take?”
- “Do I need to send the device to you?”
- “Will you provide a shipping label?”
- “Will I receive a temporary replacement?”
- “Are there any repair fees?”

You may also need to provide:

- Proof of purchase
- The serial number
- The purchase date
- Photos or videos showing the issue
- The original packaging

## End the Call Clearly

Before ending the conversation, summarize the result and next steps.

You can say:

- “So the issue is now resolved, correct?”
- “Let me confirm what I need to do next.”
- “You will email me within two working days.”
- “My ticket number is 48271, correct?”
- “I should contact you again if the problem returns.”
- “Is there anything else I need to do?”
- “Thank you for guiding me through the steps.”
- “Thank you for your help.”

If the issue is unresolved, make sure you know what will happen next.

## A Simple Support Conversation

A typical conversation may look like this:

> **Agent:** Technical Support. How can I help you today?  
> **Caller:** My laptop cannot connect to my home Wi-Fi. It can see the network, but the connection fails.  
> **Agent:** When did the problem begin?  
> **Caller:** About an hour ago. It was working normally this morning.  
> **Agent:** Have you restarted the laptop and the router?  
> **Caller:** I restarted the laptop, but not the router. Could you explain how to do that safely?  
> **Agent:** Certainly. Disconnect the router from power, wait thirty seconds, and reconnect it.  
> **Caller:** Will that change any of my network settings?  
> **Agent:** No, it will only restart the router.  
> **Caller:** All right. I’ve reconnected it. The lights are coming back on now.  
> **Agent:** Please try connecting your laptop again.  
> **Caller:** It works now. Do you know what caused the problem?  
> **Agent:** The router may have temporarily lost its connection.  
> **Caller:** Understood. Thank you for your help.

## A Simple Support Formula

When contacting technical support, follow this structure:

1. **Identify the product:** Explain which device, application, or service you are using.
2. **Describe the goal:** Say what you are trying to do.
3. **Explain the problem:** Describe what happens instead.
4. **Add context:** Say when it began and whether it happens repeatedly.
5. **List previous attempts:** Explain what you have already tried.
6. **Follow one step at a time:** Confirm each instruction before continuing.
7. **Test the result:** Try the original action again.
8. **Confirm the outcome:** Ask about the cause, prevention, or next steps.

For example:

> “I’m using your mobile app on an Android phone. I’m trying to log in, but the app closes after I enter my password. The problem started after yesterday’s update, and restarting the phone did not help.”

## Practice Scenario

In this roleplay, you are calling TechEase Support about a technical problem. The AI support agent will ask questions, guide you through troubleshooting steps, and help determine what should happen next.

During the conversation, try to:

- Describe the device or service you are using.
- Explain what you expected and what happened instead.
- Say when the issue started.
- Report an error message or another specific symptom.
- Explain what you have already tried.
- Ask the agent to clarify at least one instruction.
- Confirm whether a troubleshooting step changed anything.
- Ask for a ticket number or further support if the issue remains unresolved.

Focus on being clear and specific. You do not need advanced technical knowledge or perfect grammar to have a successful support conversation.`),
  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },
  input: [],

  subTitle: i18n._(
    'Practice describing technical problems, following instructions, and requesting further support',
  ),
  instructionToAi: `You are Shimmer, a patient and professional technical support agent at TechEase Support. The user is calling because they are experiencing a technical problem.

Run a realistic technical support conversation suitable for a language learner.

During the conversation:
- Begin by asking the user to briefly describe the issue.
- Ask which device, application, website, or service they are using.
- Ask only one or two questions at a time.
- Help the user describe what they were trying to do, what happened instead, when the issue started, and how often it occurs.
- Ask whether there is an exact error message.
- Ask what troubleshooting steps the user has already tried.
- Choose troubleshooting steps that are appropriate to the described problem.
- Give only one clear troubleshooting step at a time and wait for the user to report the result before continuing.
- Explain where settings or controls can be found when necessary.
- Give the user opportunities to ask for repetition, clarification, or slower instructions.
- After each important step, ask the user to test whether the original problem still occurs.
- Introduce one manageable complication, such as an unfamiliar menu, a failed troubleshooting step, a temporary fix, or the need to escalate the issue.
- Do not request passwords, complete payment-card details, one-time verification codes, recovery phrases, or other highly sensitive information.
- Warn the user before any step that could remove data, reset settings, uninstall software, or affect their account.
- Do not suggest destructive troubleshooting when a safer step is available.
- If the problem cannot be resolved, create a realistic support ticket and clearly explain the next step.
- Before ending the conversation, summarize what was tried, the current status of the issue, and any required follow-up.
- Keep responses concise, natural, and appropriate for the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.`,
  exampleOfFirstMessageFromAi:
    'Hello, you’ve reached TechEase Support. I’m Shimmer. Could you briefly describe the technical problem you’re experiencing today?',
  illustrationDescription:
    'A person sitting at a desk and speaking on the phone while looking at a laptop displaying an error message. A patient technical support agent wearing a headset is shown assisting them from a support centre.',
  imageSrc: '/role/1c00497c-3d10-4dc8-bdaf-f83c888ce371.webp',
  voice: 'shimmer',
});
