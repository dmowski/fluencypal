import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

export interface Step {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  stepLabel: string;
  title: string;
  description: string;
}

export interface StepsInfoCardsProps {
  title: string;
  subTitle: string;
  steps: Step[];
}

/** Interview Landing Steps Info Cards */
export const StepsInfoCards = ({}: StepsInfoCardsProps) => {
  return <></>;
};
