export interface Review {
  name: string;
  jobTitle: string;
  rate: number;
  review: string;
}

export interface ReviewCardsProps {
  title: string;
  subTitle: string;
  reviews: Review[];
}

/** Interview Landing Review Cards */
export const ReviewCards = ({}: ReviewCardsProps) => {
  return <></>;
};
