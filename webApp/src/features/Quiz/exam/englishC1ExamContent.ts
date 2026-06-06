import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
} from './examContentTypes';

export const ENGLISH_C1_READING_PASSAGES: ExamReadingPassage[] = [
  {
    passageText:
      'The proposal to introduce a four-day working week has divided economists. Advocates claim that shorter weeks can sustain productivity when tasks are prioritised more ruthlessly and meetings are curtailed. Skeptics counter that client-facing industries would merely compress the same workload into fewer days, increasing burnout rather than relieving it. Pilot programmes in several countries have reported stable output, but critics argue the samples were too small and self-selecting to justify national policy.',
    questions: [
      {
        questionText: 'What do advocates of a four-day week believe?',
        choices: [
          { label: 'Productivity can be maintained with better prioritisation', correct: true },
          { label: 'All industries will automatically reduce burnout' },
          { label: 'Meetings should be eliminated entirely' },
          { label: 'National policy has already been proven successful' },
        ],
      },
      {
        questionText: 'Why do critics doubt the pilot programmes?',
        choices: [
          { label: 'They were too small and self-selecting', correct: true },
          { label: 'They lasted longer than expected' },
          { label: 'They excluded client-facing industries' },
          { label: 'They measured productivity incorrectly' },
        ],
      },
    ],
  },
  {
    passageText:
      'When historians revisit the archive, they rarely discover a single smoking gun. Instead, meaning emerges from correspondence whose tone shifts over decades, from marginal notes, and from what was conspicuously omitted. The discipline therefore trains researchers to treat silence as evidence rather than absence, and to read certainty in official records as a rhetorical performance rather than a transparent window onto the past.',
    questions: [
      {
        questionText: 'What does the passage suggest about historical research?',
        choices: [
          { label: 'Meaning often emerges from subtle and missing details', correct: true },
          { label: 'Archives usually contain one decisive document' },
          { label: 'Official records should be accepted at face value' },
          { label: 'Tone in letters is irrelevant to interpretation' },
        ],
      },
      {
        questionText: 'How should researchers treat silence in archives?',
        choices: [
          { label: 'As evidence rather than mere absence', correct: true },
          { label: 'As proof that records were destroyed' },
          { label: 'As a sign that a topic was unimportant' },
          { label: 'As an error in cataloguing' },
        ],
      },
    ],
  },
  {
    passageText:
      'Regulators are struggling to keep pace with foundation models whose capabilities jump with each release cycle. One camp urges precautionary limits on deployment until independent auditors can stress-test systems for bias, safety, and misuse. Another insists that excessive restriction will simply relocate innovation to jurisdictions with weaker oversight, leaving domestic consumers dependent on opaque foreign tools. The stalemate has pushed policymakers toward sector-specific guidance rather than a comprehensive statute.',
    questions: [
      {
        questionText: 'What approach are policymakers leaning toward?',
        choices: [
          { label: 'Sector-specific guidance instead of one comprehensive law', correct: true },
          { label: 'A complete ban on foreign models' },
          { label: 'Immediate unrestricted deployment' },
          { label: 'Eliminating independent audits' },
        ],
      },
      {
        questionText: 'What risk do opponents of strict limits highlight?',
        choices: [
          { label: 'Innovation may move to places with weaker oversight', correct: true },
          { label: 'Auditors cannot test large models' },
          { label: 'Consumers prefer opaque systems' },
          { label: 'Release cycles are already too slow' },
        ],
      },
    ],
  },
  {
    passageText:
      'The novelist insisted that autofiction blurred boundaries not because facts were unimportant, but because memory itself was a creative act. In interviews she rejected the label “confessional”, arguing that confession implied a stable self waiting to be disclosed. Her narrators, by contrast, assemble identity retrospectively, revising earlier scenes whenever later experience renders them unintelligible.',
    questions: [
      {
        questionText: 'Why does the novelist reject the term “confessional”?',
        choices: [
          { label: 'It implies a fixed self rather than a constructed one', correct: true },
          { label: 'She never writes about personal experience' },
          { label: 'Confessional writing cannot include fiction' },
          { label: 'Interviewers misunderstood her genre' },
        ],
      },
      {
        questionText: 'How do her narrators treat earlier scenes?',
        choices: [
          { label: 'They revise them as later experience changes their meaning', correct: true },
          { label: 'They preserve them exactly as they happened' },
          { label: 'They delete any unreliable memories' },
          { label: 'They rely on official documents instead' },
        ],
      },
    ],
  },
  {
    passageText:
      'Urban planners promoting “15-minute cities” envision neighbourhoods where essentials lie within a short walk or cycle ride. Supporters argue this reduces car dependency and revives local commerce. Detractors have weaponised the term online, claiming it is a pretext for confinement, even though the policy concerns land-use mix rather than travel permits. The controversy illustrates how technical planning concepts can acquire symbolic baggage detached from their implementation.',
    questions: [
      {
        questionText: 'What do supporters hope to achieve?',
        choices: [
          { label: 'Less car dependency and stronger local commerce', correct: true },
          { label: 'Mandatory travel permits for residents' },
          { label: 'The elimination of all public transport' },
          { label: 'Higher speed limits in city centres' },
        ],
      },
      {
        questionText: 'What does the passage conclude about the debate?',
        choices: [
          { label: 'Planning ideas can acquire symbolic meanings beyond their policy intent', correct: true },
          { label: 'Online criticism has ended the policy worldwide' },
          { label: 'The term has no connection to land use' },
          { label: 'Detractors accurately described the policy' },
        ],
      },
    ],
  },
];

export const ENGLISH_C1_LISTENING_ITEMS: ExamListeningItem[] = [
  {
    audioText:
      'The committee chair noted that while the amendment addressed procedural fairness, it left substantive funding questions unresolved and would therefore be referred back to the subcommittee.',
    questionText: 'What will happen to the amendment?',
    choices: [
      { label: 'It will be referred back to the subcommittee', correct: true },
      { label: 'It will be adopted immediately' },
      { label: 'It will replace the entire budget' },
      { label: 'It will be withdrawn by the chair' },
    ],
  },
  {
    audioText:
      'Participants are reminded that anonymised datasets must not be shared outside the research consortium without written consent, even when identifiers appear to have been removed.',
    questionText: 'What restriction is emphasised?',
    choices: [
      { label: 'Datasets cannot be shared externally without written consent', correct: true },
      { label: 'Identifiers must remain visible at all times' },
      { label: 'Only commercial partners may access the data' },
      { label: 'Consent is unnecessary once data is anonymised' },
    ],
  },
  {
    audioText:
      'Had the shipment cleared customs on Tuesday, we would now be in a position to honour the original delivery window rather than negotiating a partial refund.',
    questionText: 'What is implied about the shipment?',
    choices: [
      { label: 'It did not clear customs on Tuesday', correct: true },
      { label: 'It arrived earlier than planned' },
      { label: 'The client refused a refund' },
      { label: 'Customs waived all inspections' },
    ],
  },
  {
    audioText:
      'The lecturer argued that correlation matrices, however elegant, can obscure causal direction and should be paired with domain expertise before policy recommendations are drafted.',
    questionText: 'What caution does the lecturer offer?',
    choices: [
      { label: 'Statistical elegance is no substitute for domain expertise', correct: true },
      { label: 'Correlation matrices should never be published' },
      { label: 'Policy must ignore quantitative evidence' },
      { label: 'Causation can be read directly from any matrix' },
    ],
  },
  {
    audioText:
      'Owing to overnight flooding, the heritage tour will omit the riverside quarter and instead focus on the cathedral archives, which remain accessible.',
    questionText: 'Which part of the tour is cancelled?',
    choices: [
      { label: 'The riverside quarter', correct: true },
      { label: 'The cathedral archives' },
      { label: 'The entire tour' },
      { label: 'The ticket refund desk' },
    ],
  },
  {
    audioText:
      'The witness conceded that her initial timeline might have been distorted by adrenaline, but maintained that the essential sequence of events had not changed.',
    questionText: 'What does the witness acknowledge?',
    choices: [
      { label: 'Her initial timeline may have been affected by adrenaline', correct: true },
      { label: 'She invented the entire sequence' },
      { label: 'Adrenaline improves memory accuracy' },
      { label: 'The sequence of events was irrelevant' },
    ],
  },
  {
    audioText:
      'Management has agreed to reinstate the mentorship scheme, provided that participation is voluntary and line managers document outcomes quarterly.',
    questionText: 'Under what condition will the scheme return?',
    choices: [
      { label: 'Participation is voluntary and outcomes are documented quarterly', correct: true },
      { label: 'All staff must enroll immediately' },
      { label: 'Mentors receive additional salary' },
      { label: 'Outcomes will remain confidential' },
    ],
  },
  {
    audioText:
      'Far from signalling retreat, the firm characterised the office downsizing as a reallocation of capital toward research hubs in cities with stronger graduate pipelines.',
    questionText: 'How does the firm frame the downsizing?',
    choices: [
      { label: 'As investment in research hubs, not retreat', correct: true },
      { label: 'As proof that remote work failed' },
      { label: 'As a response to falling graduate numbers' },
      { label: 'As a temporary publicity measure' },
    ],
  },
  {
    audioText:
      'The reviewer praised the translation for preserving the source novel’s irony, yet noted that occasional archaisms might distance contemporary readers.',
    questionText: 'What criticism does the reviewer mention?',
    choices: [
      { label: 'Some archaisms may alienate modern readers', correct: true },
      { label: 'The irony of the original was lost' },
      { label: 'The translation was too literal to read' },
      { label: 'Contemporary readers demanded more archaisms' },
    ],
  },
  {
    audioText:
      'Not until the final audit were we made aware that the liability clause had been amended in the supplementary schedule rather than the main contract.',
    questionText: 'When did the team learn about the amendment?',
    choices: [
      { label: 'During the final audit', correct: true },
      { label: 'Before signing the main contract' },
      { label: 'At the initial negotiation meeting' },
      { label: 'After the supplementary schedule was discarded' },
    ],
  },
];

export const ENGLISH_C1_GRAMMAR_ITEMS: ExamGrammarItem[] = [
  {
    segments: [
      { kind: 'text', text: 'It is imperative that every applicant ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' the disclosure form before the interview panel convenes.' },
    ],
    gaps: {
      g1: [
        { label: 'submits' },
        { label: 'submit', correct: true },
        { label: 'submitted' },
        { label: 'will submit' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Not until the auditors reviewed the ledger ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' the discrepancy become apparent.' },
    ],
    gaps: {
      g1: [
        { label: 'does' },
        { label: 'did', correct: true },
        { label: 'has' },
        { label: 'was' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'The proposal, ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' at yesterday’s forum, has already polarised the faculty.' },
    ],
    gaps: {
      g1: [
        { label: 'discussing' },
        { label: 'having discussed' },
        { label: 'discussed', correct: true },
        { label: 'to discuss' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Had the negotiators ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' the earlier offer, the strike might have been averted.' },
    ],
    gaps: {
      g1: [
        { label: 'accepted', correct: true },
        { label: 'accept' },
        { label: 'have accepted' },
        { label: 'accepting' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'It was the lack of transparency ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' voters rejected, not the policy itself.' },
    ],
    gaps: {
      g1: [
        { label: 'which' },
        { label: 'that', correct: true },
        { label: 'what' },
        { label: 'whose' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'The minister denied that the report ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' to influence the committee’s timetable.' },
    ],
    gaps: {
      g1: [
        { label: 'was intended', correct: true },
        { label: 'intended' },
        { label: 'has intended' },
        { label: 'is intending' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'Scarcely ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' the press conference begun when journalists challenged the figures.' },
    ],
    gaps: {
      g1: [
        { label: 'had the' },
        { label: 'had', correct: true },
        { label: 'did the' },
        { label: 'was the' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'The more closely one examines the dataset, ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' obvious the sampling bias becomes.' },
    ],
    gaps: {
      g1: [
        { label: 'more' },
        { label: 'the more', correct: true },
        { label: 'most' },
        { label: 'very' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'She spoke as if she ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' access to the confidential memo.' },
    ],
    gaps: {
      g1: [
        { label: 'has' },
        { label: 'had had', correct: true },
        { label: 'has had' },
        { label: 'was having' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'No sooner ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' the results published than rival labs disputed the methodology.' },
    ],
    gaps: {
      g1: [
        { label: 'were the' },
        { label: 'had the' },
        { label: 'were', correct: true },
        { label: 'did the' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'The contract may be terminated provided that written notice ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' within thirty days.' },
    ],
    gaps: {
      g1: [
        { label: 'is given', correct: true },
        { label: 'will give' },
        { label: 'gives' },
        { label: 'has given' },
      ],
    },
  },
  {
    segments: [
      { kind: 'text', text: 'What the board underestimated was the speed at which public sentiment ' },
      { kind: 'gap', gapId: 'g1' },
      { kind: 'text', text: ' shift once the memo leaked.' },
    ],
    gaps: {
      g1: [
        { label: 'can', correct: true },
        { label: 'must' },
        { label: 'should have' },
        { label: 'had' },
      ],
    },
  },
];
