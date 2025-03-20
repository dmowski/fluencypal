import { appName } from "@/common/metadata";
import { getCommonMessageTemplate } from "./templates/commonMessage";
import { sendEmail } from "./sendEmail";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const isSendTest = query.get("isSendTest") === "true";
  const confirmSend = false;

  const emailUi = getCommonMessageTemplate({
    title: "Payment Confirmation" + (isSendTest ? ` - S ${confirmSend ? "" : " (i)"}` : ""),
    subtitle: "Hello, Thank you for your purchase at <b>FluencyPal</b>.",
    messageContent: `
<p style="margin: 0; padding-bottom: 12px; color: #222222">
Due to your request for immediate service from Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" within 14 days of contract conclusion, you do not have the right to terminate the contract.
</p>

<div>
    <p style="padding:20px 0 0 0; margin:0"><b>Please find attached:</b></p>
    <a href="https://stripe.com/receiptId=aSSc333s-sdasdasd">Your receipt</a><br/>
    <a href="https://www.fluencypal.com/terms">Our Terms and Conditions</a><br/>
    <a href="https://www.fluencypal.com/terms">Termination form</a>
</div>
`,
    callToAction: "Start Learning",
    callbackUrl: "https://www.fluencypal.com/practice",
  });

  if (isSendTest && confirmSend) {
    const randomId = Math.floor(Math.random() * 10000);
    await sendEmail({
      emailTo: "dmowski.alex@gmail.com",
      messageText: emailUi.text,
      messageHtml: emailUi.html,
      title: `Your receipt from ${appName} #${randomId} - test`,
    });
  }

  return new Response(emailUi.html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
