import { useConversationContext } from '../context/ConversationContext.js';

export const DebugLogPanel = () => {
  const { debugLogStatus, handleCopyDebugLog, handleClearDebugLog, bindDebugLogElement } =
    useConversationContext();

  return (
    <details className="panel collapsible">
      <summary>Debug log</summary>
      <p className="hint">Copy and share when reporting issues.</p>
      <div className="row actions">
        <button id="copy-debug-log" type="button" className="btn-secondary" onClick={() => void handleCopyDebugLog()}>
          Copy logs
        </button>
        <button id="clear-debug-log" type="button" className="btn-secondary" onClick={handleClearDebugLog}>
          Clear
        </button>
      </div>
      {debugLogStatus ? (
        <p id="debug-log-status" className={`inline-status${debugLogStatus.isError ? ' error' : ''}`}>
          {debugLogStatus.message}
        </p>
      ) : null}
      <pre id="debug-log" className="log debug-log" ref={bindDebugLogElement} />
    </details>
  );
};
