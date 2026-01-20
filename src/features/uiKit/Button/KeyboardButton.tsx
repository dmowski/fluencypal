import { Keyboard } from "lucide-react";

interface KeyboardButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export const KeyboardButton: React.FC<KeyboardButtonProps> = ({
  isEnabled,
  onClick,
}) => {
  return (
    <button
      style={{
        backgroundColor: isEnabled ? "#0f4564" : "rgba(255, 255, 255, 0.3)",
        width: "47px",
        height: "47px",
        position: "relative",
        cursor: "pointer",
        border: "none",
        outline: "none",
        borderRadius: "50%",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: isEnabled
          ? "0 0 0 4px rgba(18, 112, 166, 0.1)"
          : "0 0 0 4px rgba(255, 255, 255, 0.2)",
      }}
      onClick={() => onClick()}
    >
      <Keyboard color="#fff" />
    </button>
  );
};
