export interface Price {
  label: string;
  priceUsd: number;
  priceLabel: string;
  description: string;
  points: string[];
  buttonTitle: string;
  buttonHref: string;
}

export interface PriceCardsProps {
  title: string;
  subTitle: string;
  prices: Price[];
}

/** Interview Landing Price Cards */
export const PriceCards = ({}: PriceCardsProps) => {
  return <></>;
};
