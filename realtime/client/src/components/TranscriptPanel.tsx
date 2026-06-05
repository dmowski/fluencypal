import { Paper, Stack, Text, Title } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

export const TranscriptPanel = () => {
  const { transcriptMessages } = useConversationContext();

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Title order={2} size="h4">
          Transcript
        </Title>
        <Stack id="transcript" gap="xs">
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
              Messages appear here after you connect and talk.
            </Text>
          ) : (
            transcriptMessages.map((message) => (
              <Paper
                key={message.messageId}
                p="sm"
                radius="md"
                data-message-id={message.messageId}
                bg={message.role === "user" ? "dark.6" : "blue.9"}
              >
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  mb={4}
                  style={{ letterSpacing: "0.06em" }}
                >
                  {message.role}
                </Text>
                <Text size="sm">{message.text}</Text>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
