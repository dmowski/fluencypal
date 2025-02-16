export async function GET(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    return Response.json({
      error: "Unable to create ephemeral token. Open AI env key is missing",
    });
  }

  const model = new URL(request.url).searchParams.get("model");
  if (!model) {
    return Response.json({
      error: "Model is required",
    });
  }

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      voice: "verse",
    }),
  });

  const data = await r.json();

  return Response.json(data);
}
