import { splitTextIntoParagraphs } from '../../utils/splitParagraphsIntoPages';
import { Book, createEmptyConvertedFilesPathMap } from '../../model/types';

const landingDemoText = `# The Great Gatsby

In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.

“Whenever you feel like **criticizing anyone**,” he _told me_, “just remember that all the people in this world haven’t had the advantages that you’ve had.”

He didn’t say any more, but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I’m inclined to reserve all judgements, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

And, after boasting this way of my tolerance, I come to the admission that it has a limit. Conduct may be founded on the hard rock or the wet marshes, but after a certain point I don’t care what it’s founded on. When I came back from the East last autumn I felt that I wanted the world to be in uniform and at a sort of moral attention forever.

Only Gatsby, the man who gives his name to this book, was exempt from my reaction—Gatsby, who represented everything for which I have an unaffected scorn. If personality is an unbroken series of successful gestures, then there was something gorgeous about him, some heightened sensitivity to the promises of life.`;

export const landingDemoBook: Book = {
  id: 'landing-demo-gatsby',
  title: 'The Great Gatsby',
  subtitle: 'Then wear the gold hat, if that will move her',
  author: 'F. Scott Fitzgerald',
  convertedFiles: createEmptyConvertedFilesPathMap(),
  activePageIndex: 1,
  paragraphs: splitTextIntoParagraphs(landingDemoText),
};
