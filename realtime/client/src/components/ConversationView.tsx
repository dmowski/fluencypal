import { DebugLogPanel } from './DebugLogPanel.js';
import { SessionPanel } from './SessionPanel.js';
import { TalkPanel } from './TalkPanel.js';
import { TranscriptPanel } from './TranscriptPanel.js';
import { UsagePanel } from './UsagePanel.js';

export const ConversationView = () => (
  <>
    <SessionPanel />
    <TalkPanel />
    <TranscriptPanel />
    <DebugLogPanel />
    <UsagePanel />
  </>
);
