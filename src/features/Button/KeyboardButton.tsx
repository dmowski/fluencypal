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
      }}
      className={[
        "w-[60px] h-[60px] relative cursor-pointer",
        "rounded-full flex justify-center items-center",
        "animate-fade-in",
      ].join(" ")}
      onClick={() => onClick()}
    >
      <Keyboard />
    </button>
  );
};
