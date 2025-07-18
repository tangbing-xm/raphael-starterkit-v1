# Project Structure

## Directory Organization

### Core Application (`app/`)
- **App Router Structure**: Uses Next.js 15 App Router with nested layouts
- **Route Groups**: `(auth-pages)` for authentication-related pages
- **API Routes**: RESTful endpoints in `app/api/`
- **Layouts**: Shared layouts with `layout.tsx` files

```
app/
├── (auth-pages)/          # Authentication pages group
│   ├── sign-in/          # Sign-in page
│   ├── sign-up/          # Sign-up page
│   ├── forgot-password/  # Password reset
│   └── layout.tsx        # Auth layout
├── api/                  # API routes
│   ├── creem/           # Creem.io integration
│   ├── generate-image/  # AI image generation
│   ├── upload-image/    # File upload handling
│   └── webhooks/        # Webhook endpoints
├── auth/callback/       # OAuth callback handling
├── dashboard/           # Protected dashboard pages
├── layout.tsx          # Root layout with providers
└── page.tsx           # Home page
```

### Components (`components/`)
- **Feature-based Organization**: Components grouped by functionality
- **UI Components**: Reusable Shadcn/ui components in `ui/`
- **Domain Components**: Feature-specific components

```
components/
├── ui/                  # Shadcn/ui components
│   ├── button.tsx      # Button variants
│   ├── card.tsx        # Card layouts
│   ├── dialog.tsx      # Modal dialogs
│   └── ...             # Other UI primitives
├── auth/               # Authentication components
├── dashboard/          # Dashboard-specific components
├── home/              # Landing page components
├── product/           # Product feature components
├── header.tsx         # Global header
└── footer.tsx         # Global footer
```

### Database (`supabase/`)
- **Migration Files**: SQL migrations in chronological order
- **Schema Evolution**: Incremental database changes

```
supabase/migrations/
├── 20240326000000_init_tables.sql           # Initial schema
└── 20241214000000_add_ai_generation_tables.sql  # AI features
```

### Utilities (`utils/`)
- **Feature-based Organization**: Utilities grouped by service
- **Supabase Integration**: Client, server, and middleware utilities

```
utils/
├── supabase/           # Supabase utilities
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server client
│   ├── middleware.ts  # Auth middleware
│   └── service-role.ts # Admin operations
├── creem/             # Creem.io utilities
└── utils.ts           # General utilities
```

### Configuration (`config/`, `types/`)
- **Type Definitions**: TypeScript interfaces and types
- **Configuration**: Application settings and constants

```
config/
└── subscriptions.ts    # Subscription tiers and pricing

types/
├── creem.ts           # Creem.io API types
└── subscriptions.ts   # Subscription-related types
```

## Key Patterns

### Authentication Flow
1. **Middleware**: Route protection via `middleware.ts`
2. **Server Components**: User data fetching in layouts
3. **Client Components**: Interactive auth forms

### Data Access Pattern
1. **Server Components**: Direct Supabase server client usage
2. **Client Components**: Browser client with RLS policies
3. **API Routes**: Service role client for admin operations

### Component Architecture
- **Server Components**: Default for data fetching and static content
- **Client Components**: Interactive elements with "use client" directive
- **Shared Components**: Reusable UI components in `components/ui/`

### File Naming Conventions
- **Pages**: `page.tsx` for route pages
- **Layouts**: `layout.tsx` for shared layouts
- **Components**: PascalCase for component files
- **Utilities**: camelCase for utility functions
- **Types**: Descriptive names with `.ts` extension

### Environment Configuration
- **Development**: `.env.local` for local development
- **Production**: Environment variables in deployment platform
- **Required Variables**: Supabase credentials, Creem.io keys, site URL

### Database Schema Patterns
- **RLS Policies**: Row-level security for data isolation
- **Foreign Keys**: Proper relationships between tables
- **Indexes**: Performance optimization for common queries
- **Triggers**: Automated timestamp updates
- **Views**: Aggregated data for analytics

## Development Workflow

### Adding New Features
1. Create database migration if needed
2. Add TypeScript types
3. Implement API routes
4. Create UI components
5. Add pages and routing
6. Update configuration as needed

### Component Development
1. Start with Shadcn/ui base components
2. Extend with custom variants using `class-variance-authority`
3. Use Tailwind CSS for styling
4. Implement proper TypeScript types
5. Add to appropriate feature directory