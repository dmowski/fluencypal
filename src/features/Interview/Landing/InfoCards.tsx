import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

export interface InfoCard {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

export interface InfoCardsProps {
  title: string;
  subtitle: string;
  buttonTitle: string;
  buttonHref: string;
  cards: InfoCard[];
}

/** Interview Landing Info Cards */
export const InfoCards = ({}: InfoCardsProps) => {
  return <></>;
};
