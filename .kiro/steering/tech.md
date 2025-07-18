# Technology Stack

## Core Framework

- **Next.js 15** with App Router - React framework with server-side rendering
- **React 19** - Latest React with server components
- **TypeScript 5.7** - Type safety throughout the application

## Database & Authentication

- **Supabase** - PostgreSQL database with built-in authentication
- **Supabase Auth** - Email/password and OAuth providers (Google, GitHub)
- **Row Level Security (RLS)** - Database-level security policies
- **Supabase SSR** - Server-side rendering support for authentication

## Payment Processing

- **Creem.io** - Payment processor optimized for global merchants
- **Webhook Integration** - Real-time payment event handling
- **Multi-currency Support** - Global payment acceptance
- **Subscription Management** - Recurring billing and credit systems

## UI & Styling

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library
- **next-themes** - Dark/light mode support
- **Headless UI** - Additional accessible components

## Development Tools

- **Stagewise Toolbar** - Development debugging tools
- **Prettier** - Code formatting
- **PostCSS** - CSS processing with Autoprefixer

## Common Commands

### Development

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production application
npm run start        # Start production server
npm i                # Install dependencies
```

### Database Migrations

```bash
# Apply migrations in Supabase dashboard SQL editor
# Migration files located in supabase/migrations/
# Run migrations in order: init_tables.sql, then add_ai_generation_tables.sql
```

### Environment Setup

```bash
cp .env.example .env.local    # Copy environment template
# Configure required environment variables:
# - Supabase credentials (URL, anon key, service role key)
# - Creem.io credentials (API key, webhook secret, API URL)
# - Site URL for redirects
```

## Key Dependencies

- `@supabase/ssr` - Supabase client for Next.js App Router
- `@supabase/supabase-js` - Supabase JavaScript client
- `@stagewise-plugins/react` - Development toolbar integration
- `class-variance-authority` - Component variant management
- `clsx` & `tailwind-merge` - Conditional CSS class utilities
- `react-compare-image` - Image comparison component

## Build Configuration

- **Next.js Config**: Minimal configuration with dev indicators disabled
- **Tailwind Config**: Extended theme with CSS variables for theming, includes animations
- **TypeScript Config**: Strict mode enabled with path aliases (`@/*` maps to root)
- **PostCSS**: Tailwind and Autoprefixer plugins
- **Components Config**: Shadcn/ui configuration with default style and RSC support

## Code Style & Patterns

- Use TypeScript strict mode throughout
- Prefer server components where possible
- Use Supabase RLS policies for data security
- Follow Shadcn/ui component patterns
- Use CSS variables for theming
- Implement proper error handling for async operations
