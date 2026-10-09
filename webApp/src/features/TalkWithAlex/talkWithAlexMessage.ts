const telegramMarkup = /[*_`[\]]/g;

export const plainTelegramText = (value: string, maxLength: number) =>
  value.replace(telegramMarkup, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);

export const talkWithAlexTelegramMessage = (contact: string, note: string) => {
  const lines = [
    'Talk with Alex',
    '',
    'They want a short call to get to know each other.',
    `Contact: ${plainTelegramText(contact, 200)}`,
  ];
  const about = plainTelegramText(note, 500);
  if (about) {
    lines.push(`About them: ${about}`);
  }
  return lines.join('\n');
};
