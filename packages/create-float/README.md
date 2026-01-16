# create-float

The easiest way to get started with Float.js.

## Usage

```bash
npx create-float my-app
cd my-app
npx float dev
```

That's it! 🚀

## What it does

`create-float` scaffolds a new Float.js application with:

- ✅ Pre-configured project structure
- ✅ `@float.js/core` automatically installed
- ✅ React 19 support
- ✅ TypeScript configuration
- ✅ Example pages and routes
- ✅ Ready for development

## Options

```bash
# Create a new project
npx create-float my-app

# Use a specific package manager
npx create-float my-app --npm
npx create-float my-app --yarn
npx create-float my-app --pnpm
npx create-float my-app --bun
```

## What's included

```
my-app/
├── app/
│   ├── page.tsx          # Home page
│   └── api/
│       └── hello/
│           └── route.ts  # API endpoint
├── public/               # Static assets
├── package.json
└── tsconfig.json
```

## Next steps

After creating your app:

```bash
# Start development server
npx float dev

# Build for production
npx float build

# Start production server
npx float start
```

## Learn more

- [Documentation](https://github.com/float-js/float.js)
- [Examples](https://github.com/float-js/float.js/tree/main/examples)
- [@float.js/core on npm](https://www.npmjs.com/package/@float.js/core)

## Requirements

- Node.js 18+

## License

MIT
