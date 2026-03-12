# Roamin' Rabbit Web UI Library

This project is the UI component library for Roamin' Rabbit. It is built using Next.js, React, Tailwind CSS, and shadcn/ui.

## Project Structure

The project has a specific directory structure to separate the component development environment from the actual reusable components:

- **`app/`**: This directory acts as our **Storybook / Component Sandbox**. It contains pages that render and showcase the custom components we build, making it easy to develop, test, and view all component variants in an isolated environment.
- **`components/`**: This is where we create and store all our **custom, reusable components**. Any UI elements that are meant to be exported or used across the application should be placed here.
- **`lib/`**: Contains utility functions and shared helpers (e.g., Tailwind CSS class merger utils).
- **`public/`** and **`assets/`**: Static assets, images, and fonts used during component development or within the library.
- **`__tests__/`**: Jest test files for unit testing our components and utility functions.

## Development

To run the development server (which spins up the `app/` sandbox):

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3333](http://localhost:3333) with your browser to view the component sandbox.

## Adding New Components

1. Create your component inside the `components/` directory (e.g., `components/ui/MyNewComponent.tsx`).
2. Add a new route or section in the `app/` directory to document and showcase your new component with different props and states.
