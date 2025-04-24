interface isEqualMessagesProps {
  input: string;
  correctedMessage: string;
}

const sanitizeString = (str: string) => {
  let sanitizedString = str.trim();
  sanitizedString = sanitizedString.toLowerCase();

  sanitizedString = sanitizedString.replace(/[\u2018\u2019]/g, "");
  sanitizedString = sanitizedString.replace(/[\?\!\,\.\-]/g, "");
  sanitizedString = sanitizedString.replace(/\s+/g, "");

  return sanitizedString;
};

export const isGoodUserInput = ({ input, correctedMessage }: isEqualMessagesProps) => {
  const isGood = !correctedMessage || sanitizeString(correctedMessage) === sanitizeString(input);
  return isGood;
};
