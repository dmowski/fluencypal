import {
  accountLinkEmailSubject,
  accountLinkUrl,
  getAccountLinkEmailTemplate,
} from './getAccountLinkEmailTemplate';

describe('getAccountLinkEmailTemplate', () => {
  it('includes the project link in the message and the button', () => {
    const email = getAccountLinkEmailTemplate();

    expect(accountLinkEmailSubject).toBe('Your FluencyPal account is created');
    expect(email.html).toContain('Account created');
    expect(email.html).toContain(
      "Don't forget that growth depends on daily practice. Good luck!",
    );
    expect(email.html).toContain('https://app.fluencypal.com');
    expect(email.html).toContain(`href="${accountLinkUrl}"`);
    expect(email.html).toContain('Open FluencyPal');
    expect(email.text).toContain('https://app.fluencypal.com');
    expect(email.text).toContain(accountLinkUrl);
  });
});
