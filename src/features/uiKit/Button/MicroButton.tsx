import { MicroAnimation } from "../Animations/MicroAnimation";

interface MicroButton {
  isPlaying: boolean;
  isMuted: boolean;
  onClick: () => void;
}

export const MicroButton = ({ isPlaying, isMuted, onClick }: MicroButton) => {
  return (
    <button
      style={{
        width: "80px",
        height: "80px",
        filter: isMuted ? "grayscale(100%)" : "none",
        cursor: "pointer",
        position: "relative",
        backgroundColor: "transparent",
        border: "none",
        marginLeft: "-10px",
      }}
      onClick={() => onClick()}
    >
      {isMuted && (
        <div
          style={{
            width: "40px",
            borderRadius: "2px",
            height: "2px",
            backgroundColor: "#fff",
            transform: "rotate(45deg)",
            position: "absolute",
            top: "calc(50% - 2px)",
            left: "calc(50% - 20px)",
            zIndex: 1,
          }}
        />
      )}
      <MicroAnimation isPlaying={isPlaying && !isMuted} />
    </button>
  );
};
