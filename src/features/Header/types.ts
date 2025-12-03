import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";
import { SupportedLanguage } from "@/features/Lang/lang";

export interface HeaderLink {
  title: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export interface HeaderButton {
  title: string;
  href: string;
  isSolid: boolean;
}

export interface HeaderUIProps {
  lang: SupportedLanguage;
  links: HeaderLink[];
  buttons: HeaderButton[];
  transparentOnTop?: boolean;
  logoHref: string;
}
