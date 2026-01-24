Dark lang - AI teacher

## Getting Started

First, create a .env file. See .env.example for reference.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stripe

Start webhook simulator (Update STRIPE_WEBHOOK_SECRET_TEST on .env)

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Stripe: Regenerate local key

stripe login

### Stripe: Update CLI

brew upgrade stripe/stripe-cli/stripe

### Telegram Set Webhook

SET

curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" -d "url=https://your-domain.com/api/telegram/webhook"

Verify webhook is active

curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

### Convert video

ffmpeg -i talk1.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an talk1.webm
ffmpeg -i talk2.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an talk2.webm
ffmpeg -i talk3.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an talk3.webm
ffmpeg -i sit2.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an sit2.webm
ffmpeg -i sit.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an sit.webm
