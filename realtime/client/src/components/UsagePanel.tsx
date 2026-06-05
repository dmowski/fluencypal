import { Accordion, Text } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

const extractCost = (summary: string): string => {
  const match = /\$[\d.]+/.exec(summary);
  return match ? match[0] : "";
};

export const UsagePanel = () => {
  const { usageSummary, usageLogText } = useConversationContext();
  const cost = extractCost(usageSummary);

  return (
    <Accordion variant="contained" radius="md">
      <Accordion.Item value="usage">
        <Accordion.Control>Token usage{cost ? ` (${cost})` : ""}</Accordion.Control>
        <Accordion.Panel>
          <Text
            id="session-price-total"
            size="sm"
            fw={600}
            mb="sm"
            p="xs"
            style={{
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-blue-9)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {usageSummary}
          </Text>
          <pre
            id="usage-log"
            style={{
              margin: 0,
              maxHeight: 220,
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
          >
            {usageLogText}
          </pre>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
