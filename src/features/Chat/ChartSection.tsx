import { Stack, Typography } from "@mui/material";
import { useChat } from "./useChat";

export const ChartSection = () => {
  const chat = useChat();

  return (
    <Stack>
      <Typography>{chat.messages.length} messages</Typography>
    </Stack>
  );
};
