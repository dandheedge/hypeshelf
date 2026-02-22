# HypeShelf

> **Collect and share the stuff you're hyped about** — A shared recommendations hub for friends with role-based access control.

A modern, full-stack web application showcasing production-ready authentication, database architecture, and type-safe development.

---

## Table of Contents

- [Why This Project?](#why-this-project)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Security First](#security-first)
- [Setup Guide](#setup-guide)
  - [Step 1: Clerk Setup](#step-1-clerk-setup)
  - [Step 2: Convex Setup](#step-2-convex-setup)
  - [Step 3: Run the App](#step-3-run-the-app)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Why This Project?

| What | Why It Matters |
|------|----------------|
| **Bun over npm** | 10× faster installs, native TypeScript, modern tooling |
| **Clerk + Convex** | Enterprise-grade auth with a reactive backend — JWTs handled automatically |
| **Strict TypeScript** | Zero `any` types, full type safety from UI to database |
| **Role-Based Access Control** | Admin/user permissions enforced at **every layer** |
| **Clean Architecture** | Feature-based folders, single-responsibility components |

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | Bun (v1.3.2) | Speed, modern APIs, native TypeScript |
| **Framework** | Next.js 16 | Latest App Router, React Server Components |
| **Auth** | Clerk | Production auth with JWT templates |
| **Backend + DB** | Convex | Reactive backend, type-safe queries/mutations |
| **UI** | shadcn/ui | Beautiful, accessible components |
| **Validation** | Zod | Runtime type validation with TS inference |

---

## Architecture

### The Clerk → Convex Integration

```
┌─────────────────────────────────────────────────────────────┐
│  Clerk (Auth Layer)                                         │
│  • Signs user in                                            │
│  • Generates JWT via "convex" template                      │
│  • Tokens auto-fetched by ConvexProviderWithClerk           │
└────────────────────┬────────────────────────────────────────┘
                     │ JWT Token
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex (Backend Layer)                                     │
│  • Validates JWT against Clerk JWKS                         │
│  • Matches Clerk user → Convex user record                  │
│  • Enforces RBAC in every mutation                          │
└─────────────────────────────────────────────────────────────┘
```

### What Makes This Integration Special

**Traditional approach** (manual, error-prone):
```typescript
// ❌ Manual token fetching, refresh logic, error handling
const token = await clerk.getToken();
await fetch(`${convexUrl}/query`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Our approach** (automatic, type-safe):
```typescript
// ✅ ConvexProviderWithClerk handles everything
<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
  {children}
</ConvexProviderWithClerk>
```

**Key files:**
- `convex/auth.config.ts` — Configures JWT validation domain
- `src/components/providers/ConvexClientProvider.tsx` — Auth provider bridge
- Clerk JWT template named `"convex"` — Auto-fetches tokens

---

## Security First

### Defense in Depth

| Layer | Protection | Implementation |
|-------|-------------|----------------|
| **1. UI** | `SignedIn`/`SignedOut` | Clerk components hide/show based on auth |
| **2. Middleware** | Route protection | `src/proxy.ts` redirects `/dashboard` → `/sign-in` |
| **3. Mutations** | Auth guards | Every Convex mutation calls `ctx.auth.getUserIdentity()` |
| **4. RBAC** | Role checks | `admin` can delete any; `user` can only delete own |

### Example: Server-Side Auth Guard

```typescript
// convex/recommendations.ts
export const remove = mutation({
  handler: async (ctx, { id }) => {
    // ✅ Always verify identity first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // ✅ Fetch user with role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // ✅ Enforce RBAC
    const rec = await ctx.db.get(id);
    if (user.role !== "admin" && rec.userId !== user._id) {
      throw new Error("Forbidden: insufficient permissions");
    }
  },
});
```

**Security checklist (all implemented ✅):**
- [x] All mutations call `ctx.auth.getUserIdentity()`
- [x] Role checks in Convex, not just UI
- [x] Middleware protects `/dashboard`
- [x] `.env.local` in `.gitignore`
- [x] No `any` types
- [x] Zod validation on all inputs

---

## Setup Guide

### Step 1: Clerk Setup

#### 1.1 Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click **"New application"** or select an existing one
3. Choose **"Email"** as the authentication method
4. Your app is now ready — note your **Publishable Key** and **Secret Key**

#### 1.2 Create a JWT Template for Convex

Clerk needs to generate JWT tokens that Convex can validate:

1. In Clerk Dashboard, go to **"JWT Templates"**
2. Click **"New template"** → **"Create from scratch"**
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `convex` |
| **Token type** | `Access token` |
| **Lifetime** | `5 minutes` |
| **Claims** | Leave empty (Clerk auto-adds `sub` claim) |

4. Click **"Create"**

#### 1.3 Get Your Keys

From **API Keys** in Clerk Dashboard:

| Key | Use | Location |
|-----|-----|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend | `.env.local` |
| `CLERK_SECRET_KEY` | Backend/Middleware | `.env.local` |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex auth | See below |

**Your Clerk Issuer Domain:**
```
https://YOUR-APP-NAME.clerk.accounts.dev
```
Replace `YOUR-APP-NAME` with your app name (e.g., `communal-ladybird-99`)

---

### Step 2: Convex Setup

#### 2.1 Create a Convex Project

```bash
bunx convex dev
```

1. Sign in or create a Convex account
2. Create a new project (name it `hypeshelf`)
3. Convex will create your deployment and add the URL to `.env.local`

#### 2.2 Configure Convex to Accept Clerk JWTs

1. Go to https://dashboard.convex.dev
2. Select your project → **"Settings"** → **"Environment variables"**
3. Add variable:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** `https://YOUR-APP-NAME.clerk.accounts.dev`

4. Save and restart `bunx convex dev`

#### 2.3 Create Your First User (as Admin)

1. Go to **Convex Dashboard** → **"Data"**
2. Select the `users` table
3. Click **"Insert Document"**
4. Add your user as admin:

```json
{
  "clerkId": "YOUR_CLERK_USER_ID",
  "email": "your-email@example.com",
  "name": "Your Name",
  "role": "admin"
}
```

**To get your Clerk User ID:**
- Clerk Dashboard → **Users** → click on your user → copy **User ID**

---

### Step 3: Run the App

```bash
# Terminal 1: Convex backend
nvm use 22
bunx convex dev

# Terminal 2: Next.js frontend
nvm use 22
bun dev
```

Visit http://localhost:3000 and sign in!

---

## Getting Started

```bash
# Install and run
nvm use 22
bun install
bun dev
```

```bash
# Set up Convex (one-time)
# 1. Go to https://dashboard.convex.dev
# 2. Set CLERK_JWT_ISSUER_DOMAIN in environment variables
bunx convex dev
```

**Environment variables** (`.env.local.example`):
```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

---

## Project Structure

```
hypeshelf/
├── convex/                      # Backend
│   ├── auth.config.ts           # JWT validation config
│   ├── schema.ts                # Database schema (source of truth)
│   ├── recommendations.ts       # Queries + mutations with RBAC
│   └── users.ts                 # User sync and current user query
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── dashboard/           # Protected route
│   │   ├── sign-in/             # Clerk auth pages
│   │   ├── layout.tsx           # Server Component root layout
│   │   └── page.tsx             # Public landing
│   │
│   ├── components/
│   │   ├── providers/           # Auth provider bridge
│   │   ├── layout/              # Navbar, PageShell
│   │   ├── recommendations/     # Feature components
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities, Zod schemas
│   └── types/                   # TypeScript types
│
├── src/proxy.ts                 # Clerk middleware
├── biome.json                  # Linter + formatter config
└── bun.lock                    # Bun lockfile
```

---

## Why Bun?

| Metric | Bun | npm/yarn/pnpm |
|--------|-----|---------------|
| Install speed | ~10× faster | Baseline |
| Native TypeScript | ✅ Built-in | ❌ Transpiled |
| Module resolution | ✅ Fast | ⚠️ Slower |
| Startup time | ~100ms | ~500ms |

**Result:** Faster development, better DX, modern tooling.

---

## Collaboration Style

**Code quality standards:**
- ✅ Biome for linting + formatting
- ✅ Strict TypeScript (no `any`, explicit types)
- ✅ Single-responsibility components
- ✅ Security enforced at every layer

---

## License

MIT

---

**Built with ❤️ using Bun, Next.js, Clerk, and Convex.**
