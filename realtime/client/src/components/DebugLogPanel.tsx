import { Accordion, Button, Group, Text } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

export const DebugLogPanel = () => {
  const { debugLogStatus, handleCopyDebugLog, handleClearDebugLog, bindDebugLogElement } =
    useConversationContext();

  return (
    <Accordion variant="contained" radius="md">
      <Accordion.Item value="debug-log">
        <Accordion.Control>Debug log</Accordion.Control>
        <Accordion.Panel>
          <Text size="sm" c="dimmed" mb="sm">
            Copy and share when reporting issues.
          </Text>
          <Group mb="sm">
            <Button
              id="copy-debug-log"
              variant="default"
              size="sm"
              onClick={() => void handleCopyDebugLog()}
            >
              Copy logs
            </Button>
            <Button id="clear-debug-log" variant="default" size="sm" onClick={handleClearDebugLog}>
              Clear
            </Button>
          </Group>
          {debugLogStatus ? (
            <Text
              id="debug-log-status"
              size="sm"
              c={debugLogStatus.isError ? "red" : "green"}
              mb="xs"
            >
              {debugLogStatus.message}
            </Text>
          ) : null}
          <pre
            id="debug-log"
            ref={bindDebugLogElement}
            style={{
              margin: 0,
              maxHeight: 260,
              overflowY: "auto",
              fontFamily: "var(--mantine-font-family-monospace)",
              fontSize: "var(--mantine-font-size-xs)",
              background: "var(--mantine-color-dark-8)",
              color: "var(--mantine-color-dark-1)",
              padding: 12,
              borderRadius: "var(--mantine-radius-sm)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
