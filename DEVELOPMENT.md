# Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Supabase Integration](#supabase-integration)
- [Styling with Tailwind](#styling-with-tailwind)
- [Best Practices](#best-practices)
- [Common Issues](#common-issues)

## Getting Started

### First Time Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   Get these from: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000)

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
ironsight/
├── src/
│   ├── app/                    # App Router pages & layouts
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── lib/
│   │   └── supabase/          # Supabase configuration
│   │       ├── client.ts      # Client-side Supabase client
│   │       ├── server.ts      # Server-side Supabase client
│   │       └── middleware.ts  # Session management utilities
│   │
│   └── proxy.ts               # Next.js proxy (session refresh)
│
├── public/                     # Static assets
├── .env.local                  # Environment variables (not committed)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Development Workflow

### Creating Pages

Next.js 16 uses the App Router. Create new routes by adding folders in `src/app/`:

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

Access at: `/dashboard`

### Adding Components

Create reusable components in `src/components/`:

```typescript
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
      {children}
    </button>
  )
}
```

### Server vs Client Components

**Server Components (default):**
- Render on the server
- Can directly access databases
- Better for SEO and initial load
- Cannot use hooks like `useState`, `useEffect`

```typescript
// Server Component (default)
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select()
  
  return <div>{/* Render data */}</div>
}
```

**Client Components:**
- Add `'use client'` directive at the top
- Can use React hooks
- Interactive components

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InteractivePage() {
  const [count, setCount] = useState(0)
  const supabase = createClient()
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## Supabase Integration

### Client Usage Patterns

#### ✅ Client Components
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  // Use supabase for client-side operations
}
```

#### ✅ Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  // Use data
}
```

#### ✅ Route Handlers (API Routes)
```typescript
// src/app/api/users/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('users').select()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json(data)
}
```

### Authentication Examples

#### Sign Up
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

async function signUp(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) console.error('Error:', error)
  return data
}
```

#### Sign In
```typescript
async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  return { data, error }
}
```

#### Get Current User (Server)
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return <div>Welcome {user.email}</div>
}
```

#### Sign Out
```typescript
async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

### Database Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from('users')
  .select('*')

// INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })

// UPDATE
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', userId)

// DELETE
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

## Styling with Tailwind

### Utility Classes
```typescript
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Custom Configuration
Edit `tailwind.config.ts` to add custom colors, fonts, etc:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

### Responsive Design
```typescript
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

## Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local`
- ✅ Prefix public vars with `NEXT_PUBLIC_`
- ✅ Use server-only vars for sensitive data (no `NEXT_PUBLIC_` prefix)

### 2. Supabase Clients
- ✅ Use correct client for context (server vs browser)
- ❌ Don't use server client in client components
- ✅ Always handle errors from Supabase operations

### 3. TypeScript
- ✅ Define interfaces for props and data structures
- ✅ Use type inference where possible
- ❌ Avoid `any` type

### 4. Performance
- ✅ Use Server Components by default
- ✅ Only use Client Components when needed (interactivity, hooks)
- ✅ Optimize images with `next/image`
- ✅ Use dynamic imports for large components

### 5. Code Organization
- ✅ Keep components small and focused
- ✅ Extract reusable logic into custom hooks
- ✅ Use TypeScript types for better autocomplete

## Common Issues

### Issue: "createClient is not a function"
**Cause:** Using wrong import for the context

**Fix:** Use the correct client:
```typescript
// Client Component
import { createClient } from '@/lib/supabase/client'

// Server Component
import { createClient } from '@/lib/supabase/server'
```

### Issue: Session not persisting
**Cause:** Proxy not running or misconfigured

**Fix:** Ensure `src/proxy.ts` exists and exports default function

### Issue: Environment variables undefined
**Cause:** Not prefixed correctly or server not restarted

**Fix:** 
1. Ensure public vars start with `NEXT_PUBLIC_`
2. Restart dev server after changing `.env.local`

### Issue: TypeScript errors in Supabase queries
**Cause:** Missing types

**Fix:** Generate types from Supabase schema:
```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

Then use them:
```typescript
import { Database } from '@/lib/supabase/database.types'

const supabase = createClient<Database>()
```

### Issue: Tailwind classes not working
**Cause:** Not purging properly or syntax error

**Fix:**
1. Check `tailwind.config.ts` content paths include your files
2. Restart dev server
3. Clear `.next` folder: `rm -rf .next`

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Tailwind CSS Cheatsheet](https://nerdcave.com/tailwind-cheat-sheet)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Need Help?

- Check the [Next.js Discord](https://discord.gg/nextjs)
- Visit [Supabase Discord](https://discord.supabase.com/)
- Search [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
