import { Keyboard } from "lucide-react";

interface KeyboardButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export const KeyboardButton: React.FC<KeyboardButtonProps> = ({ isEnabled, onClick }) => {
  return (
    <button
      style={{
        backgroundColor: isEnabled ? "#0f4564" : "transparent",
        width: "50px",
        height: "50px",
        position: "relative",
        cursor: "pointer",
        border: "none",
        outline: "none",
        borderRadius: "50%",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => onClick()}
    >
      <Keyboard color="#fff" />
    </button>
  );
};
