import sendGrid from "@sendgrid/mail";

const sendGridKey = process.env.SENDGRID_API_KEY || "";
if (sendGridKey) {
  sendGrid.setApiKey(sendGridKey);
}

interface SendEmailProps {
  emailTo: string;
  messageText: string;
  messageHtml: string;
  title: string;
}

export const sendEmail = async ({
  emailTo,
  messageText,
  messageHtml,
  title,
}: SendEmailProps): Promise<void> => {
  if (!sendGridKey) {
    throw new Error("SendGrid key not found");
  }

  try {
    const msg = {
      to: emailTo,
      from: {
        email: "contact@fluencypal.com",
        name: "FluencyPal - AI English Speaking Partner",
      },
      subject: title,
      text: messageText,
      html: messageHtml,
    };
    const sendResult = await sendGrid.send(msg);
    console.log(`Send email to: ${emailTo}. ${messageText}`);
    console.log("result", JSON.stringify(sendResult));
  } catch (e) {
    console.error(`Error sending email: ${e}`);
    throw new Error(`Error sending email: ${e}`);
  }
};
