import { useConversationContext } from '../context/ConversationContext.js';

export const SessionPanel = () => {
  const {
    sessionStatusText,
    sessionStatusTone,
    systemInstruction,
    setSystemInstruction,
    mode,
    setMode,
    voice,
    setVoice,
    voiceEnabled,
    micMuted,
    connected,
    handleConnect,
    handleDisconnect,
    handleVoiceEnabledChange,
    handleMicMutedChange,
  } = useConversationContext();

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Session</h2>
        <p id="session-status" className={`status-pill status-${sessionStatusTone}`}>
          {sessionStatusText}
        </p>
      </div>
      <label>
        System instruction
        <textarea
          id="system-instruction"
          rows={3}
          value={systemInstruction}
          onChange={(event) => setSystemInstruction(event.target.value)}
        />
      </label>
      <div className="grid">
        <label>
          Mode
          <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            <option value="PushToTalk">Push to talk</option>
            <option value="RealTimeConversation">Real-time call</option>
          </select>
        </label>
        <label>
          Voice
          <select id="voice" value={voice} onChange={(event) => setVoice(event.target.value as typeof voice)}>
            <option value="shimmer">shimmer</option>
            <option value="ash">ash</option>
            <option value="marin">marin</option>
            <option value="verse">verse</option>
          </select>
        </label>
      </div>
      <div className="row toggles chip-row">
        <label className="chip">
          <input
            id="voice-enabled"
            type="checkbox"
            checked={voiceEnabled}
            onChange={(event) => handleVoiceEnabledChange(event.target.checked)}
          />{' '}
          AI voice
        </label>
        <label className="chip">
          <input
            id="mic-muted"
            type="checkbox"
            checked={micMuted}
            onChange={(event) => void handleMicMutedChange(event.target.checked)}
          />{' '}
          Mic muted
        </label>
      </div>
      <div className="row actions">
        <button
          id="connect"
          type="button"
          className="btn-primary"
          disabled={connected}
          onClick={() => void handleConnect()}
        >
          Connect
        </button>
        <button
          id="disconnect"
          type="button"
          className="btn-secondary"
          disabled={!connected}
          onClick={() => void handleDisconnect()}
        >
          Disconnect
        </button>
      </div>
    </section>
  );
};
