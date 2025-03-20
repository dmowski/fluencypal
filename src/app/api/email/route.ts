import { getCommonMessageTemplate } from "./templates/commonMessage";

export async function GET(request: Request) {
  const emailUi = getCommonMessageTemplate({
    title: "Payment Confirmation",
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

  return new Response(emailUi.html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
