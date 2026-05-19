# Project Analysis - CleenChat (NodeApp)

## 📊 Project Overview

**Type**: Next.js 15 App Router dengan Workflow Automation Engine
**Tech Stack**:
- Frontend: Next.js 15.5.5 + React 19 + TypeScript 5
- State Management: Jotai + TanStack Query v5
- API Layer: tRPC v11 + SuperJSON
- Database: PostgreSQL via Prisma
- Background Jobs: Inngest v4
- Auth: Better Auth + Polar SDK
- Monitoring: Sentry v10
- UI: Radix UI + Tailwind CSS v4

---

## 🔧 Identified Issues & Optimizations

### 1. **Lockfiles Warning** (CRITICAL)
Dua lockfiles terdeteksi. Perlu fix `next.config.ts`:

```typescript
outputFileTracingRoot: path.join(__dirname),
```

### 2. **Handlebars Warning** (IMPORTANT)
Webpack tidak mendukung `require.extensions`. Gunakan alternatif atau konfigurasi khusus.

### 3. **Sentry Deprecation Warnings** (MINOR)
- `disableLogger` → `webpack.treeshake.removeDebugLogging`
- `automaticVercelMonitors` → `webpack.automaticVercelMonitors`

### 4. **tRPC Context Hardcoded User ID** (BUG)
`src/trpc/init.ts` line 13: User ID hardcoded `"user_123"` - ini harus dari session/auth!

### 5. **Unused Import in executions router**
```typescript
import { truncateByDomain } from "recharts/types/util/ChartUtils";
```

### 6. **Comment in Code** (CLEANUP)
`src/features/editor/components/editor.tsx` line 102-103: Comment tidak relevan.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth layout group
│   ├── (dashboard)/        # Dashboard layout group
│   ├── api/               # API routes (trpc, auth, inngest, webhooks)
│   └── global-error.tsx    # Global error boundary
├── components/            # Shared components
│   ├── ui/               # Radix UI primitives
│   └── *.tsx             # Feature components
├── config/                # App configuration
│   ├── constant.ts       # Pagination constants
│   ├── node-components.ts # React Flow node types
│   └── node-outputs.ts    # Node output definitions
├── features/              # Feature-based modules
│   ├── auth/             # Authentication components
│   ├── credentials/      # Credential management
│   ├── editor/           # Workflow editor (React Flow)
│   ├── executions/       # Workflow execution logic
│   ├── subscriptions/    # Subscription hooks
│   ├── triggers/         # Trigger nodes (YouTube, Manual)
│   └── workflows/        # Workflow CRUD
├── hooks/                 # Shared React hooks
├── inngest/              # Background job functions
│   ├── client.ts         # Inngest client config
│   ├── functions.ts     # Main execution functions
│   └── channels/        # Realtime channels
├── lib/                   # Utilities
│   ├── auth.ts           # Better Auth config
│   ├── db.ts            # Prisma singleton
│   ├── polar.ts         # Polar SDK client
│   └── *.ts             # Helper functions
└── trpc/                 # tRPC setup
    ├── init.ts           # Context & procedures
    ├── server.tsx        # Server-side tRPC
    ├── client.tsx        # Client-side provider
    └── routers/         # API routers
```

---

## 🎨 Coding Patterns Used

### 1. **tRPC Pattern**
- Server: `createTRPCContext` + `protectedProcedure` + `premiumProcedure`
- Client: `TRPCProvider` + `useTRPC()` hook
- Hooks: `useSuspenseQuery` + `useMutation` dengan `queryOptions`

### 2. **React Flow Pattern**
- Node components registered di `node-components.ts`
- Executor functions untuk setiap node type
- Executor register pattern untuk lookup

### 3. **Inngest Pattern**
- Event-driven: `workflows/execute.workflow`
- Polling: `trigger/youtube.poll`, `trigger/youtube-video.poll`
- Realtime publish untuk UI updates

### 4. **Component Pattern**
- UI components: Simple wrappers around Radix primitives
- Entity components: Loading/Error/Empty states
- Feature components: Self-contained feature modules

---

## 🚀 Optimizations Applied

### Fix 1: next.config.ts
```typescript
outputFileTracingRoot: path.join(__dirname),
```

### Fix 2: Handlebars Alternative
Gunakan `handlebars` ESM import atau alternatif seperti `mustache` yang lebih webpack-friendly.

### Fix 3: Sentry Config Update
```typescript
webpack: (config) => ({
  ...config,
  removeDebugLogging: true,
  automaticVercelMonitors: true, //deprecated option, use Vercel directly
})
```

---

## 📋 TODO Checklist

- [x] Fix lockfiles warning
- [ ] Fix Handlebars warning
- [ ] Fix tRPC context hardcoded user ID
- [ ] Remove unused import
- [ ] Clean up comments
- [ ] Update Sentry deprecation warnings

---

## 🔗 Dependencies Analysis

**Major Dependencies**:
- `@tanstack/react-query`: v5.90.3 (latest)
- `@trpc/*`: v11.6.0 (latest)
- `better-auth`: v1.3.28 (latest)
- `@polar-sh/sdk`: v0.47.1 (latest)
- `inngest`: v4.4.0 (latest)
- `@xyflow/react`: v12.9.1 (latest)

**Potential Issues**:
- `handlebars` version may have ESM compatibility issues
- Multiple `@polar-sh/better-auth` and `better-auth` - check compatibility
- `ai` package v5.0.76 - heavy dependency, consider tree-shaking

---

## 📝 Notes

1. **Auth Flow**: Using Better Auth with Polar plugin for subscriptions
2. **Real-time**: Using Inngest Realtime channels for execution status
3. **AI Integration**: Support for OpenAI, Anthropic, DeepSeek, Gemini
4. **External Integrations**: Discord, Slack, YouTube, Google Sheets
5. **Workflow Engine**: Custom topological sort for execution order