import { Box, Paper, ScrollArea, Text } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

export const TranscriptPanel = () => {
  const { transcriptMessages } = useConversationContext();

  return (
    <ScrollArea id="transcript" h={400} type="auto" offsetScrollbars>
      {transcriptMessages.length === 0 ? (
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          p="xl"
          style={{
            border: "1px dashed var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
          }}
        >
          Messages appear here after the call starts.
        </Text>
      ) : (
        <Box style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
          {transcriptMessages.map((message) => (
            <Box
              key={message.messageId}
              data-message-id={message.messageId}
              style={{
                display: "flex",
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                p="sm"
                radius="lg"
                maw="75%"
                bg={message.role === "user" ? "blue.8" : "dark.5"}
              >
                <Text size="sm">{message.text}</Text>
              </Paper>
            </Box>
          ))}
        </Box>
      )}
    </ScrollArea>
  );
};
