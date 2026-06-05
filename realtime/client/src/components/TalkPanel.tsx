import { useConversationContext } from '../context/ConversationContext.js';

export const TalkPanel = () => {
  const {
    micStatusText,
    micStatusTone,
    talkHint,
    isRealtimeMode,
    connected,
    callActive,
    micMuted,
    pttRecording,
    pttLabel,
    typedMessage,
    setTypedMessage,
    startCall,
    stopCall,
    startPushToTalk,
    stopPushToTalk,
    handleSendText,
  } = useConversationContext();

  return (
    <section className="panel panel-talk">
      <div className="panel-head">
        <h2>Talk</h2>
        <p id="mic-status" className={`status-pill status-${micStatusTone} mic-status`}>
          {micStatusText}
        </p>
      </div>
      <p id="talk-hint" className="hint">
        {talkHint}
      </p>
      {isRealtimeMode ? (
        <button
          id="call-toggle"
          type="button"
          className={`call${callActive ? ' active' : ''}`}
          disabled={!connected}
          onClick={() => void (callActive ? stopCall() : startCall())}
        >
          {callActive ? 'End call' : 'Start call'}
        </button>
      ) : (
        <button
          id="ptt"
          type="button"
          className={`ptt${pttRecording ? ' recording' : ''}`}
          disabled={!connected || micMuted}
          onMouseDown={() => void startPushToTalk()}
          onMouseUp={stopPushToTalk}
          onMouseLeave={stopPushToTalk}
          onTouchStart={(event) => {
            event.preventDefault();
            void startPushToTalk();
          }}
          onTouchEnd={(event) => {
            event.preventDefault();
            stopPushToTalk();
          }}
        >
          {pttLabel}
        </button>
      )}
      <div className="typed-row">
        <label>
          Type a message
          <input
            id="typed-message"
            type="text"
            placeholder="Type and press Send"
            disabled={!connected}
            value={typedMessage}
            onChange={(event) => setTypedMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSendText();
              }
            }}
          />
        </label>
        <button id="send-text" type="button" className="btn-secondary" disabled={!connected} onClick={handleSendText}>
          Send
        </button>
      </div>
    </section>
  );
};
