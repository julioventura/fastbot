# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/18518cc1-7e45-4bb2-b97e-a3378f87cabc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/18518cc1-7e45-4bb2-b97e-a3378f87cabc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Testing

This project has comprehensive automated testing with **453 tests** covering components, hooks, contexts, and utilities.

### Running Tests

```sh
# Run tests in watch mode (development)
npm run test

# Run tests once (CI/CD)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Open visual test interface
npm run test:ui
```

### Testing Guidelines

When writing tests for components with fragmented text (multiple `<span>` elements), use flexible matchers:

```typescript
// ❌ Don't test concatenated text across multiple DOM elements
expect(screen.getByText('Full concatenated text')).toBeInTheDocument()

// ✅ Test individual text fragments
expect(screen.getByText('Fragment 1')).toBeInTheDocument()
expect(screen.getByText('Fragment 2')).toBeInTheDocument()
```

For detailed testing documentation, see `DOCUMENTACAO - IMPLEMENTAR - TESTES.md`.
