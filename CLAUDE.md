# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Agent Rules

See [AGENTS.md](./AGENTS.md) for critical information about Next.js version compatibility and breaking changes.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router structure. The project name "attendance" suggests this is intended to be an attendance tracking system, though the current implementation is just the default Next.js template.

## Commands

- **Development**: `npm run dev` - Starts Next.js dev server at http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Start**: `npm run start` - Runs the production build
- **Lint**: `npm run lint` - Runs ESLint with Next.js configuration

The project supports npm, yarn, pnpm, or bun package managers.

## Architecture

### Structure
- **App Router**: The `app/` directory follows Next.js App Router conventions
- **Pages**: `app/page.tsx` - Main page component (index route)
- **Layout**: `app/layout.tsx` - Root layout with font configuration
- **Styles**: `app/globals.css` - Global styles using Tailwind CSS v4
- **Public assets**: `public/` directory for static assets

### Technology Stack
- **Next.js**: 16.2.1 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.x with strict mode
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Linting**: ESLint 9 with `eslint-config-next` (TypeScript + web-vitals)

### Key Configuration
- **tsconfig.json**: Path alias `@/*` → project root, strict mode, bundler module resolution
- **eslint.config.mjs**: Flat config format, extends Next.js core-web-vitals and TypeScript rules
- **next.config.ts**: Currently minimal/empty
- **postcss.config.mjs**: Tailwind CSS v4 configuration

### TypeScript & Styling
- `app/globals.css` uses Tailwind CSS `@import` syntax (v4)
- CSS custom properties for theming with dark mode via `prefers-color-scheme`
- Geist fonts loaded via `next/font/google` optimization
- Font variables: `--font-geist-sans`, `--font-geist-mono`

## Development Guidelines

1. **Component Types**: App Router defaults to server components. Use `'use client'` directive for interactive components requiring state/effects.
2. **Routing**: File-system routing in `app/` - create folders for routes, use `page.tsx` for route handlers, `layout.tsx` for nested layouts.
3. **TypeScript**: Strict mode enforced - provide explicit types, avoid `any`.
4. **Styling**: Use Tailwind CSS utility classes. The project uses Tailwind v4 with `@theme inline` block for custom theme tokens.
5. **Linting**: Run `npm run lint` before committing; fix all violations.
6. **Images**: Use Next.js `next/image` component for optimized images.
7. **Fonts**: Use `next/font` for automatic optimization rather than importing fonts directly.

## Deployment

Designed for Vercel deployment (standard Next.js). Run `npm run build` then `npm start` for production.
