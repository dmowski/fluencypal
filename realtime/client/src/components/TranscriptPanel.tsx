import { useConversationContext } from '../context/ConversationContext.js';

export const TranscriptPanel = () => {
  const { transcriptMessages } = useConversationContext();

  return (
    <section className="panel transcript-panel">
      <div className="panel-head">
        <h2>Transcript</h2>
      </div>
      <div id="transcript" className="transcript">
        {transcriptMessages.length === 0 ? (
          <p className="transcript-empty">Messages appear here after you connect and talk.</p>
        ) : (
          transcriptMessages.map((message) => (
            <div key={message.messageId} className={`message ${message.role}`} data-message-id={message.messageId}>
              <span className="role">{message.role}</span>
              <span>{message.text}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
