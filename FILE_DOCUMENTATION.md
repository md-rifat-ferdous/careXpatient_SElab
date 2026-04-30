# File Documentation: careXpatient

This document provides a summary of the purpose, theme, and features of each significant file in the careXpatient repository.

## Root Directory
| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `package.json` | Monorepo root configuration. | Defines workspaces and global scripts (dev, build, lint). |
| `turbo.json` | Turborepo pipeline config. | Orchestrates builds and caching across the monorepo. |
| `database.sql` | Database schema. | PostgreSQL schema for users, doctors, appointments, and labs. |
| `BRIEFING.md` | Project Onboarding. | High-level overview of requirements, tech stack, and workflow. |
| `.gitignore` | Git exclusion rules. | Prevents committing node_modules, build artifacts, and AI metadata. |

## Apps: `apps/landing-page`
Main patient-facing web application built with Next.js.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `src/app/page.tsx` | Main Landing Page. | Hero section, search bar, services, and doctor highlights. |
| `src/app/layout.tsx` | App Layout. | Root structure, font loading (Inter), and global providers. |
| `src/app/globals.css` | Global Styles. | Tailwind directives and base styles for the application. |
| `package.json` | App dependencies. | Next.js, React, and local `@carexpatient/ui` dependency. |

## Packages: `packages/ui`
Shared Design System and Component Library.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `src/components/Avatar.tsx` | User Profile Image. | Displays patient/doctor avatars with fallback support. |
| `src/components/Badge.tsx` | Status Indicators. | Used for "Verified", "Pending", or specialty labels. |
| `src/components/Button.tsx` | Primary Interaction. | Custom buttons with multiple variants (primary, ghost, icon). |
| `src/components/Card.tsx` | Content Wrapper. | Generic container for doctor profiles and service info. |
| `src/components/Checkbox.tsx` | Multi-select Input. | Accessible checkbox for forms and filters. |
| `src/components/Input.tsx` | Text Input. | Standardized text fields with label and error support. |
| `src/components/Layout.tsx` | Shared Layouts. | Wrappers for consistent page spacing and sections. |
| `src/components/Radio.tsx` | Single-select Input. | Radio buttons for mutually exclusive options. |
| `src/components/Select.tsx` | Dropdown Menu. | Custom select component for categories and locations. |
| `src/components/Toggle.tsx` | Switch Component. | Interactive toggle for preferences or status. |
| `src/components/Typography.tsx` | Text System. | Standardized Heading (h1-h4) and Body text styles. |
| `src/styles/globals.css` | Component Styles. | Base styles specifically for the UI library components. |

## Packages: Configuration
Standardized configs shared across all apps and packages.

| Path | File | Purpose |
| :--- | :--- | :--- |
| `packages/config-tailwind` | `tailwind.config.js` | Shared theme (colors, fonts, spacing) for the design system. |
| `packages/config-typescript` | `base.json` | Shared base TypeScript compiler options. |
| `packages/config-typescript` | `nextjs.json` | Specialized TS config for Next.js applications. |
| `packages/config-typescript` | `react-library.json` | Specialized TS config for React component libraries. |

---
**Note**: This documentation is intended for team members to quickly navigate the codebase and understand the architectural role of each file.
