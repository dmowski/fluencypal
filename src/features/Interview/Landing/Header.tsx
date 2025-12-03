export interface HeaderLink {
  title: string;
  href: string;
}

export interface HeaderButtons {
  title: string;
  href: string;
  isSolid: boolean;
}

export interface HeaderProps {
  logoHref: string;
  links: HeaderLink[];
  buttons: HeaderButtons[];
}

/** Interview Landing Header */
export const Header = ({}: HeaderProps) => {
  return <></>;
};
