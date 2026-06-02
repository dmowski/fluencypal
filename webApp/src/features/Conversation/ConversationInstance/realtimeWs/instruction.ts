export type InstructionState = {
  baseInitInstruction: string;
  webCamDescription: string;
  correction: string;
};

export const getMergedInstruction = (state: InstructionState): string => {
  if (state.correction) {
    return state.correction;
  }

  return [state.baseInitInstruction, state.webCamDescription]
    .filter((part) => part.length > 0)
    .join('\n');
};
