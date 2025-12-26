# Frontend Implementation Guidelines

## Technology Stack
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Data Fetching/State**: SWR
- **Testing**: Vitest, React Testing Library
- **Linting/Formatting**: ESLint, Prettier

## Project Structure
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks.
- `src/services`: API clients and service logic.
- `src/lib`: Utility functions and configuration (e.g., `utils.ts` for class merging).
- `src/assets`: Static assets.

## Implementation Standards

### Component Design
- Use functional components with TypeScript interfaces for props.
- Keep components small and focused.
- Use `lucide-react` for icons.
- Expose `className` prop for custom styling when valid.
- Use `React.forwardRef` if the component needs to expose its DOM node.

### Styling
- Use Tailwind CSS utility classes.
- Use `clsx` and `tailwind-merge` (typically in `lib/utils.ts` as `cn()`) to conditional classes and avoid conflicts.
- Avoid inline styles.
- Follow the design system tokens defined in `tailwind.config.js` or CSS variables.

### Data Fetching
- Use **SWR** (`useSWR`) for server state and caching.
- Define fetchers in `src/services`.
- Handle loading and error states explicitly.

### testing
- Write unit tests for components using `@testing-library/react`.
- Write logic tests for hooks and services using `vitest`.
- Run tests with `npm test`.

## Workflow
1. Create/Update component in `src/components`.
2. Add necessary types.
3. Implement logic/hooks.
4. Add styles.
5. Write tests.
6. Verify with `npm run dev`.
