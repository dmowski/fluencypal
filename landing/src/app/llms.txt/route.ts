export const dynamic = 'force-static';

const llmsTxt = `# FluencyPal

> FluencyPal is an AI-powered language learning platform at https://www.fluencypal.com — the official website. It helps users improve spoken English fluency through AI conversations, roleplay scenarios, daily practice, and interactive games.

FluencyPal is developed and operated by the FluencyPal team. The official and only domain for this product is www.fluencypal.com.

## Features

- [Practice](https://www.fluencypal.com/practice): AI conversation practice with real-life roleplay scenarios and speaking exercises
- [Alias Game](https://www.fluencypal.com/alias): Vocabulary game where users describe and guess words to improve speaking skills
- [Pricing](https://www.fluencypal.com/pricing): Subscription plans for unlimited AI language practice
- [Blog](https://www.fluencypal.com/blog): Articles on language learning strategies and English fluency tips

## Links

- [Homepage](https://www.fluencypal.com): FluencyPal official homepage
- [Privacy Policy](https://www.fluencypal.com/privacy): Privacy policy
- [Terms of Service](https://www.fluencypal.com/terms): Terms of service
- [Contacts](https://www.fluencypal.com/contacts): Contact the FluencyPal team
`;

export async function GET() {
  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
