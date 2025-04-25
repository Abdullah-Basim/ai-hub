# AI Hub - All-in-One AI Platform

AI Hub is a unified platform that gives creators, businesses, and students access to various AI models (LLMs, image generation, video generation) without jumping between different tools.

## Features

- Access to text, image, and video AI models in one place
- Free/open-source models available for free
- 3 free prompts per premium model
- $10/month subscription to unlock premium models
- Pay-as-you-go credits for ultra-premium models
- User authentication and profiles
- Prompt history tracking
- File upload capabilities
- Subscription and credits system

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js with Supabase
- **Payments**: Stripe
- **AI Integrations**: OpenAI, Google Gemini, and more

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Supabase account
- Stripe account (for payments)
- API keys for AI models (OpenAI, Google Gemini, etc.)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ai-hub.git
   cd ai-hub
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/aihub"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # AI Model API Keys
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   \`\`\`

4. Set up the database:
   \`\`\`bash
   npx prisma migrate dev --name init
   \`\`\`

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Set up the environment variables in the Vercel dashboard.
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's create a Dockerfile for deployment:

```dockerfile file="Dockerfile"
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
