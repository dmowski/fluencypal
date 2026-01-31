# FluencyPal

**Your AI-Powered Language Learning Companion**

FluencyPal is an AI-powered conversation practice application that helps intermediate and advanced language learners improve their speaking fluency, pronunciation, and confidence through realistic conversations and instant feedback.

[![Website](https://img.shields.io/badge/Website-fluencypal.com-blue)](https://www.fluencypal.com)
[![License](https://img.shields.io/badge/License-Private-red)]()

## 🌟 Features

### Core Learning Features

- **🎯 Personalized Learning Plans** - AI-generated practice plans based on your goals, proficiency level, and interests
- **🗣️ Voice Conversations** - Real-time AI conversations with natural speech recognition and text-to-speech
- **📹 Webcam Feedback** (Optional) - Practice with an AI avatar for more realistic conversation experiences
- **✅ Instant Corrections** - Get immediate feedback on grammar, pronunciation, and vocabulary
- **📊 Progress Tracking** - Visualize your daily progress and improvements over time
- **🎮 Interactive Games** - Alias word game and other gamified learning experiences
- **📝 Vocabulary Building** - Personalized vocabulary tailored to your conversational needs
- **🎭 Role-Play Scenarios** - Practice real-life situations like job interviews, business meetings, travel, and more

### Learning Modes

- **Casual Conversation** - Uninterrupted speaking practice for fluency building
- **Talk & Correct** - Instant grammar and pronunciation feedback during conversations
- **Beginner Mode** - Slower, guided conversations for early learners
- **Role-Play** - Simulated real-world scenarios (interviews, business, travel, etc.)
- **Grammar Practice** - Focused exercises on specific grammar concepts
- **Vocabulary Practice** - Topic-specific word learning and usage

### Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, and more

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI Framework**: [Material-UI (MUI)](https://mui.com/)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **AI Integration**: OpenAI GPT-4
- **Authentication**: Firebase Authentication
- **Database**: Google Cloud Firestore
- **Payment Processing**: Stripe
- **Internationalization**: [Lingui](https://lingui.dev/)
- **Testing**: Jest, Playwright
- **Error Tracking**: Sentry
- **Deployment**: Vercel
- **Telegram Integration**: Telegram Mini Apps SDK

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm/yarn
- Firebase project setup
- OpenAI API key
- Stripe account (for payments)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dark-eng
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory. See `.env.example` for reference.

Required environment variables:

```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CREDENTIALS=your_admin_credentials

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET_TEST=your_webhook_secret

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### HTTPS Development (Optional)

For testing features that require HTTPS (like webcam):

```bash
pnpm dev:https
```

## 📝 Available Scripts

### Development

```bash
pnpm dev                # Start development server with Turbopack
pnpm dev:https          # Start with HTTPS enabled
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Type checking with TypeScript
```

### Testing

```bash
pnpm test               # Run all tests (unit + e2e)
pnpm test:unit          # Run Jest unit tests
pnpm test:unit:watch    # Run Jest in watch mode
pnpm test:e2e           # Run Playwright e2e tests
pnpm test:e2e:ui        # Run Playwright with UI
pnpm test:e2e:headed    # Run Playwright in headed mode
```

### Internationalization

```bash
pnpm lang               # Extract, translate, and compile language files
pnpm lang-clean         # Clean and regenerate language files
pnpm ai-translate       # AI-powered translation of new strings
```

### Code Quality

```bash
pnpm format             # Format code with Prettier
pnpm format:check       # Check code formatting
```

### Deployment

```bash
pnpm prod               # Build and deploy to Vercel
```

## 🔧 Development Tools

### Stripe Webhook Testing

Start Stripe webhook simulator (update `STRIPE_WEBHOOK_SECRET_TEST` in `.env`):

```bash
pnpm stripe-hook
# or manually:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Regenerate Stripe local key:

```bash
stripe login
```

Update Stripe CLI:

```bash
brew upgrade stripe/stripe-cli/stripe
```

### Telegram Integration

Set webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook"
```

Verify webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Start ngrok tunnel:

```bash
pnpm tg    # Using custom domain
pnpm tg2   # Random domain
```

### Video Conversion

Convert MP4 videos to WebM format for web optimization:

```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an output.webm
```

## 📁 Project Structure

```
dark-eng/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [lang]/            # Internationalized routes
│   │   ├── api/               # API routes
│   │   ├── practice/          # Practice page
│   │   └── ...
│   ├── features/              # Feature-based modules
│   │   ├── Ai/               # AI integration
│   │   ├── Auth/             # Authentication
│   │   ├── Chat/             # Chat interface
│   │   ├── Conversation/     # Conversation logic
│   │   ├── RolePlay/         # Role-play scenarios
│   │   ├── Landing/          # Landing page components
│   │   └── ...
│   ├── common/               # Shared utilities
│   ├── libs/                 # Library functions
│   └── locales/              # Translation files
├── public/                   # Static assets
├── e2e/                      # End-to-end tests
├── __mocks__/               # Test mocks
└── ...config files
```

## 🌐 Deployment

The project is configured for deployment on Vercel with automatic builds from the main branch.

### Environment Setup

1. Configure all required environment variables in Vercel dashboard
2. Set up Firebase, OpenAI, and Stripe integrations
3. Configure custom domain and SSL
4. Set up Sentry for error tracking

## 🧪 Testing

### Unit Tests

Tests are written using Jest and React Testing Library:

```bash
pnpm test:unit
```

### E2E Tests

End-to-end tests use Playwright:

```bash
pnpm test:e2e
```

Test files are located in the `e2e/` directory and include:

- Alias game functionality
- Internationalization
- Lighthouse performance tests

## 🤝 Contributing

This is a private project. For questions or collaboration inquiries, please contact the maintainers.

## 📄 License

Private - All rights reserved

## 🔗 Links

- **Website**: [https://www.fluencypal.com](https://www.fluencypal.com)
- **Support**: Contact via website

## 🙏 Acknowledgments

Built with:

- OpenAI GPT-4 for conversational AI
- Firebase for authentication and database
- Stripe for payment processing
- Material-UI for UI components
- Next.js for the web framework

---

**Made with ❤️ for language learners worldwide**
