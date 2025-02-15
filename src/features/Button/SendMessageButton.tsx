import { SendHorizontal } from "lucide-react";

interface SendMessageButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const SendMessageButton: React.FC<SendMessageButtonProps> = ({ disabled, onClick }) => {
  return (
    <button
      className={[
        `animate-fade-in rounded-[40px]`,
        disabled ? `bg-[#aab3b7] cursor-not-allowed` : `bg-[#8bc2d9] hover:bg-[#77a3b5]`,
        `p-3 mt-1`,
      ].join(" ")}
      style={{
        animationDelay: "0s",
        animationDuration: "0.1s",
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <SendHorizontal color="#0f4564" size={"20px"} />
    </button>
  );
};
