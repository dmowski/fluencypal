import { Stack, Typography } from '@mui/material';
import { LegalContainer } from './LegalContainer';
import Markdown from 'markdown-to-jsx';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

interface PageProps {
  lang: SupportedLanguage;
}

export const CommunityRules = ({ lang }: PageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <LegalContainer page="community" lang={lang}>
      <Typography variant="h1">{i18n._(`Community rules`)}</Typography>
      <Typography>Effective Date: Oct 1, 2026</Typography>
      <Stack
        sx={{
          fontSize: '20px',
          fontFamily: 'Intel, Roboto, Arial, sans-serif',
          color: 'rgba(222, 222, 222, 0.9)',
          hr: {
            opacity: 0.1,
          },
        }}
      >
        <Markdown>
          {`
**COMMUNITY RULES of FluencyPal**

## § 1 Status of these rules

1. These Community Rules (hereinafter: **Rules**) set the conditions for using the community parts of FluencyPal, including messages, comments, daily questions, answers, voice conversations with other learners, and any other content a person sends to other users (hereinafter: **Community**).
2. The Rules supplement the [Terms of Use](https://www.fluencypal.com/terms). Words used in the Terms of Use have the same meaning here, unless this page gives them a different meaning. **StartUp** means the operator described in § 1 of the Terms of Use. **User** means a person who reads or sends anything in the Community.
3. If a provision of these Rules conflicts with the Terms of Use on a matter of payment, account, or contract, the Terms of Use apply. If they conflict on how a User must behave in the Community, these Rules apply.
4. Sending a message, posting a question or answer, joining a voice conversation, or otherwise using the Community means the User has read these Rules and agrees to follow them. A User who does not agree must not use the Community.
5. The Community is a place to practice a language with other people. It is not a school, a certified course, or a professional advice service.

## § 2 Who operates the Community

1. The Community is operated for Fundacja Rozwoju Przedsiębiorczości „Twój StartUp”, based in Warsaw, as described in § 1 of the Terms of Use, through the organized part of the enterprise named **FluencyPal**.
2. Contact for these Rules: contact@fluencypal.com.
3. The full name, address, and register details of the operator are in the Terms of Use. Those details are part of these Rules by reference.

## § 3 Be patient. We are all learners

1. Every User is a learner. Users make a lot of mistakes. Users have different levels of the language. When a User sends a message, the User must remember that and be patient with other people.
2. A short message, a slow reply, a grammar mistake, a limited vocabulary, an accent, or a sentence that is simpler than the User's own is part of practice. It is not a reason to judge, rank, mock, or correct a person in public in a way that shames them.
3. A User may point out a language mistake only in a kind and specific way, and only as help with practice. One clear suggestion is enough. The person who receives it may ignore it.
4. A correction from another User is a personal opinion made during practice. It is not a grade, a certificate, or advice from StartUp. StartUp does not check that corrections are accurate.
5. Users may disagree about a topic. They must not attack the person, the person's origin, appearance, gender, beliefs, disability, or level of the language.

## § 4 The User is responsible for what they send

1. The User is solely responsible for the text, voice, image, and any other material they send in the Community (hereinafter: **User Content**).
2. The User confirms that they have the right to send that User Content, and that sending it does not infringe copyright, personal rights, privacy, or any other right of another person.
3. The User must not present themselves as another person, as StartUp, as a teacher employed by StartUp, or as an official of a public authority.
4. The User must not send another person's name, image, voice, contact details, or other personal data unless they have a valid legal basis to do so. In particular, the User must not publish someone else's private conversation.
5. By sending User Content, the User grants StartUp a non-exclusive, worldwide, royalty-free licence to store, reproduce, display, and transmit that User Content for as long as it remains in the Community, solely so that the Community can work (showing the message to other Users, moderating it, and keeping a backup needed for that purpose). The User keeps their own rights in the User Content. The licence ends when the User Content is deleted from the Community, except for copies StartUp must keep to comply with law or to document a report.
6. StartUp does not claim ownership of User Content. StartUp does not promise that User Content will stay online, stay unchanged, or be saved after the User deletes it.

## § 5 What the User must not send

1. The User must not send User Content that is unlawful, or that the User knows is false in a way that can harm another person.
2. The User must not send User Content that:
  a) insults, harasses, threatens, blackmails, or humiliates another person;
  b) mocks a mistake, an accent, or a language level;
  c) promotes hatred or violence against a person or a group, including because of origin, nationality, ethnicity, religion, gender, sexual orientation, disability, or age;
  d) is pornographic, or is a sexual request sent to a person who did not ask for it;
  e) sexualises a minor, or asks a minor for personal contact outside the Service;
  f) encourages a crime, or gives instructions for causing harm;
  g) is a scam, spam, an unsolicited advertisement, or a request for money, passwords, or payment details;
  h) contains malware, or a link the User knows is harmful;
  i) infringes copyright or another intellectual property right;
  j) discloses personal data, a private address, or an account identifier in order to expose or pressure someone.
3. The User must not try to disrupt the Community, including by scripts, fake accounts created to evade a block, or repeated messages after a warning.
4. The prohibition in § 10 point 10 of the Terms of Use applies in the Community in full.

## § 6 Age

1. The Community is for people who are at least 13 years old, as stated when the User agrees to use FluencyPal.
2. A User who is under 18 should use the Community with the agreement of a parent or guardian where the law requires it.
3. A User must not ask another User how old they are in order to contact them privately, and must not move a conversation with a minor to another service.

## § 7 Moderation

1. StartUp may, but does not undertake to, review User Content before or after it is sent. Other Users see User Content because another User sent it, not because StartUp wrote it or approved it.
2. StartUp may remove User Content, limit who can see it, or refuse to deliver it, without a prior notice, if StartUp believes it breaks these Rules, the Terms of Use, or the law, or if keeping it creates a risk for other Users.
3. StartUp may warn a User, temporarily block Community features, or delete the account, if the User breaks these Rules, repeats a breach after a warning, or creates a serious risk for other Users. A block of the Community does not by itself refund a payment. Refunds follow the Terms of Use.
4. StartUp does not have to explain every moderation decision. Where the law requires a statement of reasons, StartUp will give it to the contact address of the account.
5. StartUp's moderation is a right, not a promise that the Community will be free of mistakes, unkind messages, or unlawful content. A User who sees such content should stop reading it and report it under § 8.

## § 8 Reports

1. A User who believes User Content is unlawful, or breaks these Rules, should leave the conversation and write to contact@fluencypal.com. The report should include:
  a) a description of the content and, if possible, where it appears;
  b) why the User believes it is unlawful or breaks these Rules;
  c) the name or identifier of the person who sent it, if the User knows it;
  d) a statement that the report is made in good faith.
2. StartUp will review a report that contains enough information to find the content. StartUp does not promise a particular outcome or a particular time, except where the law sets one.
3. A report that is knowingly false, or that is used only to pressure another learner, is itself a breach of these Rules.
4. This section does not replace a notice to a public authority. A person whose right is infringed may also use the remedies available under the law.

## § 9 Liability

1. To the fullest extent permitted by law, StartUp is not liable for User Content, for a language correction given by a User, for a User's decision to rely on that correction, or for a dispute between Users.
2. StartUp is not a party to relationships that Users form in the Community, and does not supervise meetings, calls, or messages that Users continue outside the Service.
3. Nothing in these Rules excludes liability that cannot be excluded under the law that protects a Consumer, including liability for damage caused by a wilful act of StartUp.
4. Where the law allows a limit, StartUp's liability related to the Community is limited as stated in the Terms of Use, and does not include lost profits.
5. The User will compensate StartUp, to the extent permitted by law, for claims of third parties caused by User Content the User sent in breach of these Rules, including reasonable legal costs. This does not apply to a Consumer beyond what mandatory law allows.

## § 10 Data and recordings

1. Messages and voice in the Community may be stored so that other Users can see the conversation and so that StartUp can moderate it. The details of personal data are in the [Privacy Policy](https://www.fluencypal.com/privacy).
2. The User must not record another User, or publish such a recording, unless the law allows it and the other User has agreed where agreement is required.

## § 11 Changes and final provisions

1. StartUp may change these Rules for a valid reason, in particular a change in the law, a change in how the Community works, or a new risk to Users. The current text is published on this page with its effective date.
2. Continued use of the Community after the effective date of a change means the User accepts the changed Rules. A User who does not accept them must stop using the Community.
3. Matters not covered here follow the Terms of Use and Polish law, in particular the Civil Code of 23 April 1964, the Act of 30 May 2014 on consumer rights, the Act of 18 July 2002 on the provision of services by electronic means, and Regulation (EU) 2022/2065, to the extent they apply.
4. A provision of these Rules that is held invalid does not affect the remaining provisions.
5. These Rules are effective as of: Oct 1, 2026.
`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
