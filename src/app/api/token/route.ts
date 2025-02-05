import { MODELS } from "@/data/ai";

export async function GET() {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    return Response.json({
      error: "Unable to create ephemeral token. Open AI env key is missing",
    });
  }

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELS.REALTIME_CONVERSATION,
      voice: "verse",
    }),
  });

  const data = await r.json();

  return Response.json(data);
}
