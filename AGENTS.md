# AGENTS.md

## Dev Commands

```bash
pnpm install              # Install deps (run first)
pnpm run dev              # Start all apps
pnpm run dev:web          # Start only web frontend
pnpm run dev:server      # Start only Convex backend
pnpm run dev:setup       # Configure Convex backend
pnpm run build           # Build all packages
pnpm run check-types     # TypeScript type check
```

## Architecture

- **apps/web**: React + TanStack Router frontend (Vite)
- **packages/ui**: Shared shadcn/ui components
- **packages/backend**: Convex backend functions
- **packages/config**: Shared ESLint/Prettier config
- **packages/env**: Shared env validation

## Required Setup

1. Run `pnpm run dev:setup` to create Convex project
2. Copy `packages/backend/.env.local` to `apps/web/.env`

## UI Components

Import shared components from `@project-construction/ui`:
```tsx
import { Button } from "@project-construction/ui/components/button";
```

To add new shared components, run from root:
```bash
npx shadcn@latest add <component> -c packages/ui
```