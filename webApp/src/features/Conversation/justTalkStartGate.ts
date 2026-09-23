export type JustTalkStartGate = {
  attempt: number;
};

/** Start a Just Talk attempt. A tap can supersede an in-flight auto-start that has not connected. */
export const beginJustTalkStart = (
  gate: JustTalkStartGate,
  supersede: boolean,
): number | null => {
  if (gate.attempt > 0 && !supersede) return null;
  gate.attempt += 1;
  return gate.attempt;
};

export const isJustTalkStartCurrent = (gate: JustTalkStartGate, attempt: number): boolean =>
  gate.attempt === attempt;

/** Clear the gate when this attempt is still the latest. Returns false if a tap superseded it. */
export const finishJustTalkStart = (gate: JustTalkStartGate, attempt: number): boolean => {
  if (gate.attempt !== attempt) return false;
  gate.attempt = 0;
  return true;
};
