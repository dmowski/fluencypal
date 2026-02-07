export const getWebCamDescriptionInstruction = (description: string): string => {
  if (!description || description.trim().length === 0) {
    return '';
  }
  const message = `
VISUAL_CONTEXT is sensor data from the user's webcam. You can use it during the conversation to better understand user's emotions and reactions.
VISUAL_CONTEXT (latest): ${description}
`;

  return message;
};
