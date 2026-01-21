import Button from '@mui/material/Button';

interface GlassButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ href, onClick, children }) => {
  return (
    <Button variant="contained" size="large" onClick={onClick} href={href}>
      {children}
    </Button>
  );
};
