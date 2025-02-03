export async function GET() {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    return Response.json({ message: "hello", error: "Open ai key is missing" });
  }
  // gpt-4o-realtime-preview-2024-12-17
  // gpt-4o-mini-realtime-preview-2024-12-17

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-realtime-preview-2024-12-17",
      voice: "verse",
    }),
  });

  const data = await r.json();

  return Response.json(data);
}
