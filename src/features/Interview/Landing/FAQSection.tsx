export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title: string;
  subTitle: string;
  list: FAQItem[];
}

/** Interview Landing FAQ Section */
export const FAQSection = ({}: FAQSectionProps) => {
  return <></>;
};
