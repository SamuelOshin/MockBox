# MockBox Frontend - Professional API Mock Builder

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E.svg)](https://supabase.com/)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/SamuelOshin/MockBox)

> A modern, feature-rich frontend for the MockBox API mocking platform, built with Next.js 15, TypeScript, and enterprise-grade authentication.

## 🎯 Current Status: Production Ready

✅ **Complete Authentication System** - Email/password, OAuth (Google, GitHub)  
✅ **Protected Route System** - Dashboard, Builder, Mocks pages secured  
✅ **Modern UI Components** - shadcn/ui with Tailwind CSS  
✅ **Real-time State Management** - React Context with Supabase integration  
✅ **Responsive Design** - Mobile-first approach with dark/light themes  
✅ **Type Safety** - Full TypeScript implementation with strict mode

## ✨ Features

### � **Authentication System (Complete)**
- **Email/Password Authentication** - Secure login with validation
- **OAuth Integration** - Google and GitHub social login
- **Password Management** - Reset, change, and recovery functionality
- **Session Management** - Persistent sessions with automatic refresh
- **Protected Routes** - Route-level access control with redirects

### 🎨 **User Interface (Production Ready)**
- **Modern Design System** - shadcn/ui components with Radix primitives
- **Responsive Layout** - Mobile-first design with tablet and desktop support
- **Dark/Light Themes** - System preference detection with manual toggle
- **Accessibility** - WCAG compliant with keyboard navigation and screen readers
- **Loading States** - Skeleton loaders and progress indicators

### 🏗️ **Application Pages**
- **Landing Page** - Feature showcase with pricing and demos
- **Authentication Pages** - Login, signup, password reset flows
- **Dashboard** - User overview with analytics and quick actions
- **Mock Builder** - Visual interface for creating and editing mocks
- **Mocks Management** - CRUD operations with filtering and search

### 🛠️ **Developer Experience**
- **TypeScript** - Full type safety with strict configuration
- **ESLint & Prettier** - Code quality and formatting enforcement
- **Hot Reload** - Fast development with instant updates
- **Error Boundaries** - Graceful error handling and recovery
- **Performance Optimized** - Bundle splitting and lazy loading

## 🧩 Key Components

### ScrollbarContainer

A reusable component for custom scrollbars with theme support and accessibility features.

#### Usage

```tsx
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"

<ScrollbarContainer
  height="400px"
  width="100%"
  thumbColor="#888888"
  trackColor="#f1f1f1"
  scrollbarWidth="8px"
  theme="dark"
>
  {content}
</ScrollbarContainer>
```

#### Props

- `children`: React.ReactNode - Content to be scrolled
- `height`: string | number - Container height
- `width`: string | number - Container width
- `maxHeight`: string | number - Maximum height
- `maxWidth`: string | number - Maximum width
- `thumbColor`: string - Scrollbar thumb color
- `trackColor`: string - Scrollbar track color
- `scrollbarWidth`: string - Scrollbar width (responsive)
- `scrollbarHeight`: string - Scrollbar height (responsive)
- `borderRadius`: string - Scrollbar border radius
- `hoverOpacity`: number - Opacity on hover
- `transition`: string - CSS transition
- `direction`: "vertical" | "horizontal" | "both" - Scroll direction
- `theme`: "light" | "dark" | "auto" - Theme mode
- `touchSupport`: boolean - Enable touch scrolling
- `rtlSupport`: boolean - Enable RTL support

#### Features

- ✅ **Theme Support** - Light, dark, and auto themes
- ✅ **Responsive Design** - Adapts to mobile and desktop
- ✅ **Cross-browser Compatibility** - Works in all modern browsers
- ✅ **Touch Support** - Optimized for mobile devices
- ✅ **RTL Support** - Right-to-left language support
- ✅ **Accessibility** - WCAG compliant with focus states
- ✅ **Performance** - Optimized with CSS custom properties
- ✅ **Customizable** - Extensive theming options

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **Package Manager** - pnpm (recommended), npm, or yarn
- **Supabase Account** - For authentication and database

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   pnpm install  # or npm install / yarn install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   **Required Environment Variables:**
   ```env
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # API Configuration (Required)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # Optional: Analytics and monitoring
   NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```
   
   Access the application at [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier

# Testing (when implemented)
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
```

## 🏗️ Architecture & Structure

### 📁 Project Structure
```
frontend/
├── app/                        # Next.js App Router
│   ├── auth/                   # Authentication pages
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Registration page
│   │   ├── callback/page.tsx   # OAuth callback
│   │   └── reset-password/     # Password reset flow
│   ├── dashboard/page.tsx      # Protected dashboard
│   ├── builder/page.tsx        # Mock builder interface
│   ├── mocks/page.tsx          # Mocks management
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                 # Reusable components
│   ├── auth/                   # Authentication components
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Layout components
│   └── editor/                 # Mock editor components
├── lib/                        # Utilities and services
│   ├── supabase.ts            # Supabase client config
│   ├── auth-context.tsx       # Authentication context
│   ├── api.ts                 # API client
│   ├── utils.ts               # Utility functions
│   └── types.ts               # TypeScript definitions
├── hooks/                      # Custom React hooks
├── public/                     # Static assets
└── styles/                     # Additional stylesheets
```

### 🔧 Technology Stack

**Core Framework:**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - Component library with concurrent features
- **[TypeScript 5.6](https://www.typescriptlang.org/)** - Type-safe JavaScript

**Styling & UI:**
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful, customizable icons

**Authentication & Data:**
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with authentication
- **[Supabase Auth](https://supabase.com/auth)** - User management and OAuth

**Development Tools:**
- **[ESLint](https://eslint.org/)** - Code linting and quality enforcement
- **[Prettier](https://prettier.io/)** - Code formatting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting

## 🔧 Configuration & Deployment

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:8000` |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | No | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking DSN | No | - |

### Deployment Options

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
pnpm build
vercel --prod
```

**Docker Deployment**
```dockerfile
# Use the official Node.js image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Manual Deployment**
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Performance Optimization

**Bundle Analysis**
```bash
# Analyze bundle size
pnpm build-analyze
```

**Key Optimizations:**
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component with lazy loading
- **Font Optimization** - Local font loading with `next/font`
- **Static Generation** - ISR for dynamic content
- **Bundle Optimization** - Tree shaking and minification

## 🤝 Contributing

### Development Guidelines

1. **Code Style** - Follow ESLint and Prettier configurations
2. **TypeScript** - Maintain strict type safety
3. **Components** - Use composition over inheritance
4. **Accessibility** - Ensure WCAG 2.1 AA compliance
5. **Performance** - Optimize for Core Web Vitals

### Commit Convention
```bash
feat: add new authentication method
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth context logic
test: add unit tests for auth hooks
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Next.js 15, TypeScript, and shadcn/ui**