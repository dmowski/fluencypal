interface GlassButtonProps {
  href?: string;
  onClick?: () => void;
  animationDelay?: string;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  href,
  onClick,
  children,
  animationDelay = "0s",
}) => {
  const className = [
    `transition-all duration-100`,
    `text-[#eef6f9] hover:text-white`,
    `shadow-[0_0_0_1px_rgba(255,255,255,0.9)] hover:shadow-[0_0_0_2px_rgba(255,255,255,1)]`,
    `font-[250] text-[18px]`,
    `opacity-0 hover:opacity-100`,
    `animate-fade-in`,
    "flex items-center justify-center gap-5",
    `w-[340px] max-w-[90%] px-10 py-5`,
    `rounded-md`,
    `box-border`,
    `bg-cover bg-center`,
  ].join(" ");

  const style = {
    backgroundImage: `url("./button_bg.png")`,
    animationDelay: animationDelay,
  };

  if (href) {
    return (
      <a href={href} onClick={onClick} className={className} style={style}>
        {children}
      </a>
    );
  } else {
    return (
      <button onClick={onClick} className={className} style={style}>
        {children}
      </button>
    );
  }
};
