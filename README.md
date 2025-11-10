# Ironsight

A modern Next.js application built with TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Authentication, Database, Storage)
- **Font**: [Geist](https://vercel.com/font) optimized with `next/font`

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your [Supabase project settings](https://app.supabase.com/project/_/settings/api).

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── lib/
│   └── supabase/    # Supabase client configuration
│       ├── client.ts    # Browser client
│       ├── server.ts    # Server client
│       └── middleware.ts # Session management
└── proxy.ts          # Next.js proxy for session refresh
```

## Supabase Integration

This project includes pre-configured Supabase clients for:

- **Browser**: Use `createClient()` from `@/lib/supabase/client` in Client Components
- **Server**: Use `createClient()` from `@/lib/supabase/server` in Server Components and Route Handlers
- **Proxy**: Automatic session refresh for authenticated users via `src/proxy.ts`

## Development Guide

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide including:
- Authentication patterns
- Database operations
- Styling guidelines
- Best practices
- Common issues and solutions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

