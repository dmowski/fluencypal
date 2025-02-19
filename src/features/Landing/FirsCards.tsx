import { Stack, Typography } from "@mui/material";

interface ShortCard {
  title: string;
  description: string;
}

const ShortCard: React.FC<ShortCard> = ({ title, description }) => {
  const startColor = "rgba(5, 172, 255, 0.2)";
  const endColor = "rgba(5, 172, 255, 0.3)";
  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        borderRadius: "18px",
        padding: "22px 35px 24px 25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
        backgroundColor: "#070f1a",
        overflow: "hidden",
        zIndex: 0,
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "18px",
          padding: "2px",
          background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          zIndex: -1,
        },
      }}
    >
      <Typography
        variant="h5"
        component={"h2"}
        sx={{
          fontWeight: "400",
          width: "100%",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          opacity: 0.7,
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
};

export const FirsCards = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "0 30px",
          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",
          maxWidth: "1400px",
          position: "relative",
          zIndex: 1,
          "@media (max-width: 800px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        <ShortCard
          title="Real-Time Voice Chats"
          description="Speak with our AI tutor for instant feedback. Build confidence through quick, natural dialogues."
        />
        <ShortCard
          title="Daily Tasks"
          description="Practice a short grammar rule, take a quick quiz, and learn a new word. Each task adapts to your level for steady progress."
        />
        <ShortCard
          title="Personalized Homework"
          description="Reinforce new skills with targeted assignments after each session. Practice grammar, vocabulary, and conversation at your pace."
        />
      </Stack>
    </Stack>
  );
};
