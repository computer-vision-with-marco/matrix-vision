# AGENTS.md - PixelMatrix Pro

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm install` - Install dependencies

## Testing
No test framework configured. Add Vitest for unit testing:
- `npm run test` - Run all tests
- `npm run test -- <file>` - Run single test file

## Linting
No linter configured. Add ESLint:
- `npm run lint` - Run linter
- `npm run lint:fix` - Auto-fix lint issues

## Code Style Guidelines

### Imports
- React imports first
- External libraries second
- Local imports last with relative paths
- Group by type, separate with blank lines

### Naming
- PascalCase: Components, Types, Interfaces
- camelCase: Variables, functions, hooks
- UPPER_SNAKE_CASE: Constants

### Types
- Use explicit TypeScript types
- Define interfaces for component props
- Use union types for mode/state enums
- Prefer `React.FC<Props>` for components

### Error Handling
- Use try/catch for async operations
- Display user-friendly error messages
- Avoid console.error in production

### Performance
- Use useCallback for event handlers
- Use useMemo for expensive computations
- Use useRef for DOM manipulation

### Styling
- Tailwind CSS classes
- Responsive design with mobile-first
- Dark theme (slate color palette)
- Consistent spacing and typography