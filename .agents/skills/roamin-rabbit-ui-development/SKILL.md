---
name: Roamin' Rabbit UI Component Development
description: Guidelines and instructions for developing UI components in the Roamin' Rabbit Web UI Library project, including Atomic Design principles and project structure.
---

# Roamin' Rabbit Web UI Library Development Skill

This skill provides essential context and instructions for developing in the Roamin' Rabbit Web UI Library project.

## Core Stack & Tools
- **Framework**: Next.js, React
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI)
- **Icons**: `lucide-react` (Important: Do not use `react-icons`)

## Project Structure
- `app/`: Serves as the **Storybook / Component Sandbox**. Contains pages that render and showcase custom components. This is not the main application router for end-users, but rather an isolated environment to test and view component variants.
- `components/`: The directory for **custom, reusable components**. All exportable UI elements should be placed here.
- `lib/`: Utility functions and shared helpers (e.g., `cn` utility for Tailwind class merging).
- `public/` & `assets/`: Static assets, images, and fonts.
- `__tests__/`: Jest test files for unit testing.

## Component Categorization (Atomic Design)
When creating or categorizing components (especially within the Sandbox `app/` catalog), use the following Atomic Design categories:
1. **particles**: Fundamental styling primitives or the absolute smallest design tokens.
2. **atoms**: Basic UI elements (e.g., Button, Badge, Avatar, Toggle, Input).
3. **molecules**: Groups of atoms functioning together (e.g., Tooltip, SearchInput, UserProfile).
4. **organisms**: Complex interactive components and page sections (e.g., DataTable, Card, Dialog, CatalogSection).

## Component Status
Components should be labeled with a status to indicate their readiness:
- `stable`: Production-ready, fully tested.
- `beta`: Ready for testing, might have minor issues or API changes.
- `new`: Recently added, under active development.

## Guidelines for Adding New Components
1. **Create the Component**: Build the component inside `components/` (or `components/ui/` if it's a base element).
2. **Style with Tailwind**: Use Tailwind CSS for all styling. Rely on `lib/utils` for class merging (`cn`).
3. **Use Lucide Icons**: Always import icons from `lucide-react` (e.g., `import { ChevronRight } from "lucide-react";`).
4. **Update the Sandbox**: Add an entry for your new component in the sandbox catalog (`app/page.tsx` or similar catalog data structures) so it is properly showcased, documented, and includes its `category`, `status`, `props`, and `variants`.
5. **Types & Interfaces**: Strongly type all components using TypeScript.
6. **Accessibility**: Radix UI primitives should be leveraged whenever possible to maintain high accessibility standards.
