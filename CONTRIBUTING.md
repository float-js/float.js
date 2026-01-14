# Contributing to Float.js

Thank you for your interest in contributing to Float.js! We welcome contributions from everyone.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm 8 or later
- Git

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/float-js.git
cd float-js
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/float-js/float-js.git
```

4. Install dependencies:

```bash
pnpm install
```

5. Build all packages:

```bash
pnpm build
```

## Development Workflow

### Making Changes

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and ensure they follow our coding standards:

```bash
# Run linter
pnpm lint

# Check formatting
pnpm format:check

# Run type checking
pnpm type-check
```

3. Build the packages to ensure everything compiles:

```bash
pnpm build
```

4. Commit your changes with a clear message:

```bash
git commit -m "feat: add amazing feature"
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. Push your changes to your fork:

```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub
3. Fill out the PR template with all relevant information
4. Wait for review and address any feedback
5. Once approved, your PR will be merged!

## Project Structure

```
float-js/
├── packages/
│   ├── core/              # @float/core package
│   │   ├── src/
│   │   │   ├── cli.ts     # CLI implementation
│   │   │   ├── dev-server.ts
│   │   │   ├── router.ts
│   │   │   ├── build.ts
│   │   │   └── ssr.ts
│   │   └── package.json
│   └── create-float/      # create-float package
│       ├── src/
│       │   └── index.ts   # Scaffolding CLI
│       ├── templates/     # Project templates
│       └── package.json
├── docs/                  # Documentation site
│   └── pages/            # Documentation pages
├── .github/
│   └── workflows/        # CI/CD workflows
└── package.json          # Root package.json
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide types for all function parameters and return values
- Avoid using `any` when possible

### Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Run Prettier before committing: `pnpm format`

### Best Practices

- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow existing patterns in the codebase

## Testing

Currently, Float.js doesn't have automated tests. If you'd like to help add testing infrastructure, please open an issue to discuss!

## Documentation

When adding new features:

1. Update relevant documentation in `docs/pages/`
2. Update package READMEs if applicable
3. Add inline code comments for complex logic

## Reporting Bugs

Found a bug? Please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

## Feature Requests

Have an idea? Open an issue with:

- Clear description of the feature
- Use cases and benefits
- Proposed implementation (optional)

## Getting Help

- Open an issue with the `question` label
- Check existing issues and documentation first

## Release Process

Releases are handled by maintainers:

1. Update version numbers in package.json files
2. Update CHANGELOG.md
3. Create a GitHub release
4. Packages are automatically published to npm via GitHub Actions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in our README and release notes!

---

Thank you for contributing to Float.js! 🎉
