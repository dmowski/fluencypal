import { useConversationContext } from '../context/ConversationContext.js';

export const UsagePanel = () => {
  const { usageSummary, usageLogText } = useConversationContext();

  return (
    <details className="panel collapsible">
      <summary>Token usage</summary>
      <p id="session-price-total" className="session-price-total">
        {usageSummary}
      </p>
      <pre id="usage-log" className="log">
        {usageLogText}
      </pre>
    </details>
  );
};
