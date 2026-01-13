export const getEphemeralToken = async (model: string) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("Unable to create ephemeral token. Open AI env key is missing");
  }

  if (!model) {
    throw new Error("Model is required");
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
  if (!data?.client_secret.value) {
    throw new Error("Unable to create ephemeral token. No client secret found");
  }

  return data.client_secret.value as string;
};
