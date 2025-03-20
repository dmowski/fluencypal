import { getCommonMessageTemplate } from "./templates/commonMessage";

export async function GET(request: Request) {
  const emailUi = getCommonMessageTemplate({
    title: "Test email",
    subtitle: "Test message",
    messageContent: "Test message content",
    callToAction: "Test call to action",
    callbackUrl: "https://fluencypal.com",
  });

  return new Response(emailUi.html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
