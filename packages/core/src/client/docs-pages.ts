/**
 * Float.js Documentation Pages
 * Internal pages for Docs, Learn, and Examples
 */

const baseStyles = `
<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%TITLE% - Float.js</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0%25' y1='100%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%233B82F6'/><stop offset='100%25' stop-color='%238B5CF6'/></linearGradient></defs><path d='M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z' fill='url(%23g)'/><path d='M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z' fill='url(%23g)'/><path d='M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z' fill='url(%23g)'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] } } }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    .prose code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 0.875em; }
    .dark .prose code { background: #27272a; }
    .prose pre { background: #18181b; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; }
    .prose pre code { background: transparent; padding: 0; }
  </style>
</head>
<body class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen font-sans">
`;

const header = `
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3">
        <svg class="w-8 h-8" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="hdr-grad" x1="50" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#hdr-grad)"/>
          <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#hdr-grad)"/>
          <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#hdr-grad)"/>
        </svg>
        <span class="font-semibold text-lg">Float.js</span>
      </a>
      <nav class="flex items-center gap-6">
        <a href="/__docs" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Docs</a>
        <a href="/__learn" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Learn</a>
        <a href="/__examples" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Examples</a>
        <a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a>
        <button id="theme-toggle" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>
      </nav>
    </div>
  </header>
`;

const footer = `
  <!-- Footer -->
  <footer class="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 bg-zinc-50 dark:bg-zinc-900/50">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-zinc-500">© 2024-2026 Float.js. Created by Peter Fulle</p>
      <div class="flex items-center gap-4">
        <a href="mailto:prfulle@gmail.com" class="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">prfulle@gmail.com</a>
        <a href="https://github.com/float-js/float-js" target="_blank" class="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
      </div>
    </div>
  </footer>
  <script>
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    if (localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark'); html.classList.remove('light');
    }
    toggle?.addEventListener('click', () => {
      html.classList.toggle('dark'); html.classList.toggle('light');
      localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    });
  </script>
</body>
</html>
`;

export function generateDocsPage(): string {
  return baseStyles.replace('%TITLE%', 'Documentation') + header + `
  <div class="flex">
    <!-- Sidebar -->
    <aside class="hidden lg:block w-64 border-r border-zinc-200 dark:border-zinc-800 min-h-[calc(100vh-4rem)] p-6">
      <nav class="space-y-6">
        <div>
          <h3 class="font-semibold text-sm mb-3">Getting Started</h3>
          <ul class="space-y-2">
            <li><a href="#installation" class="text-sm text-blue-600 dark:text-blue-400 font-medium">Installation</a></li>
            <li><a href="#project-structure" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Project Structure</a></li>
            <li><a href="#routing" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Routing</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-sm mb-3">Core Concepts</h3>
          <ul class="space-y-2">
            <li><a href="#pages" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Pages</a></li>
            <li><a href="#layouts" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Layouts</a></li>
            <li><a href="#api-routes" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">API Routes</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-sm mb-3">Features</h3>
          <ul class="space-y-2">
            <li><a href="#ssr" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Server Rendering</a></li>
            <li><a href="#hmr" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Hot Module Replacement</a></li>
            <li><a href="#ai" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">AI Integration</a></li>
          </ul>
        </div>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="flex-1 max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
      <h1 id="installation" class="text-4xl font-bold mb-4">Documentation</h1>
      <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-8">Learn how to build modern web applications with Float.js</p>
      
      <h2 class="text-2xl font-semibold mt-12 mb-4">Installation</h2>
      <p class="mb-4">Create a new Float.js project with a single command:</p>
      <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl mb-6"><code class="font-mono">npx create-float@latest my-app
cd my-app
npm run dev</code></pre>
      
      <h2 id="project-structure" class="text-2xl font-semibold mt-12 mb-4">Project Structure</h2>
      <p class="mb-4">Float.js uses a file-based routing system. Your project structure looks like this:</p>
      <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl mb-6"><code class="font-mono">my-app/
├── app/
│   ├── page.tsx        # Home page (/)
│   ├── layout.tsx      # Root layout
│   ├── about/
│   │   └── page.tsx    # About page (/about)
│   └── api/
│       └── route.ts    # API route (/api)
├── public/             # Static assets
└── package.json</code></pre>

      <h2 id="routing" class="text-2xl font-semibold mt-12 mb-4">Routing</h2>
      <p class="mb-4">Routes are automatically generated based on your file structure:</p>
      <div class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b border-zinc-200 dark:border-zinc-700">
              <th class="pb-3 font-semibold">File</th>
              <th class="pb-3 font-semibold">Route</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            <tr class="border-b border-zinc-100 dark:border-zinc-800"><td class="py-3">app/page.tsx</td><td class="py-3 text-blue-600 dark:text-blue-400">/</td></tr>
            <tr class="border-b border-zinc-100 dark:border-zinc-800"><td class="py-3">app/about/page.tsx</td><td class="py-3 text-blue-600 dark:text-blue-400">/about</td></tr>
            <tr class="border-b border-zinc-100 dark:border-zinc-800"><td class="py-3">app/blog/[slug]/page.tsx</td><td class="py-3 text-blue-600 dark:text-blue-400">/blog/:slug</td></tr>
            <tr><td class="py-3">app/api/users/route.ts</td><td class="py-3 text-blue-600 dark:text-blue-400">/api/users</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="pages" class="text-2xl font-semibold mt-12 mb-4">Creating Pages</h2>
      <p class="mb-4">Each page exports a default React component:</p>
      <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl mb-6"><code class="font-mono"><span class="text-violet-400">export default</span> <span class="text-blue-400">function</span> <span class="text-yellow-300">Page</span>() {
  <span class="text-violet-400">return</span> (
    <span class="text-zinc-500">&lt;</span><span class="text-emerald-400">div</span><span class="text-zinc-500">&gt;</span>
      <span class="text-zinc-500">&lt;</span><span class="text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>Welcome to my page<span class="text-zinc-500">&lt;/</span><span class="text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>
    <span class="text-zinc-500">&lt;/</span><span class="text-emerald-400">div</span><span class="text-zinc-500">&gt;</span>
  );
}</code></pre>

      <h2 id="api-routes" class="text-2xl font-semibold mt-12 mb-4">API Routes</h2>
      <p class="mb-4">Create API endpoints by exporting HTTP method handlers:</p>
      <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl mb-6"><code class="font-mono"><span class="text-violet-400">export async function</span> <span class="text-yellow-300">GET</span>(<span class="text-orange-400">request</span>: Request) {
  <span class="text-violet-400">return</span> Response.json({ message: <span class="text-emerald-400">'Hello from API!'</span> });
}

<span class="text-violet-400">export async function</span> <span class="text-yellow-300">POST</span>(<span class="text-orange-400">request</span>: Request) {
  <span class="text-violet-400">const</span> body = <span class="text-violet-400">await</span> request.json();
  <span class="text-violet-400">return</span> Response.json({ received: body });
}</code></pre>

      <div class="mt-12 p-6 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
        <h3 class="font-semibold text-lg mb-2">🚀 Ready to build?</h3>
        <p class="text-zinc-600 dark:text-zinc-400 mb-4">Start creating your first page by running:</p>
        <code class="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-sm">touch app/page.tsx</code>
      </div>
    </main>
  </div>
` + footer;
}

export function generateLearnPage(): string {
  return baseStyles.replace('%TITLE%', 'Learn') + header + `
  <main class="max-w-4xl mx-auto px-6 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl sm:text-5xl font-bold mb-4">Learn Float.js</h1>
      <p class="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
        Follow our step-by-step tutorial to master Float.js and build your first application
      </p>
    </div>
    
    <!-- Tutorial Steps -->
    <div class="space-y-6">
      
      <!-- Step 1 -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="font-bold text-blue-600 dark:text-blue-400">1</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-2">Create Your Project</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Start by creating a new Float.js project using the CLI</p>
            <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm font-mono overflow-x-auto"><code>npx create-float@latest my-first-app</code></pre>
          </div>
        </div>
      </div>
      
      <!-- Step 2 -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="font-bold text-violet-600 dark:text-violet-400">2</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-2">Start the Development Server</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Navigate to your project and start the dev server</p>
            <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm font-mono overflow-x-auto"><code>cd my-first-app
npm run dev</code></pre>
          </div>
        </div>
      </div>
      
      <!-- Step 3 -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">3</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-2">Create Your First Page</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Create a page component in the app directory</p>
            <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm font-mono overflow-x-auto"><code><span class="text-zinc-500">// app/page.tsx</span>
<span class="text-violet-400">export default</span> <span class="text-blue-400">function</span> <span class="text-yellow-300">HomePage</span>() {
  <span class="text-violet-400">return</span> (
    <span class="text-zinc-500">&lt;</span><span class="text-emerald-400">main</span><span class="text-zinc-500">&gt;</span>
      <span class="text-zinc-500">&lt;</span><span class="text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>Hello, Float.js!<span class="text-zinc-500">&lt;/</span><span class="text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>
      <span class="text-zinc-500">&lt;</span><span class="text-emerald-400">p</span><span class="text-zinc-500">&gt;</span>Welcome to my first app<span class="text-zinc-500">&lt;/</span><span class="text-emerald-400">p</span><span class="text-zinc-500">&gt;</span>
    <span class="text-zinc-500">&lt;/</span><span class="text-emerald-400">main</span><span class="text-zinc-500">&gt;</span>
  );
}</code></pre>
          </div>
        </div>
      </div>
      
      <!-- Step 4 -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="font-bold text-amber-600 dark:text-amber-400">4</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-2">Add an API Route</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Create your backend API with simple handlers</p>
            <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm font-mono overflow-x-auto"><code><span class="text-zinc-500">// app/api/hello/route.ts</span>
<span class="text-violet-400">export async function</span> <span class="text-yellow-300">GET</span>() {
  <span class="text-violet-400">return</span> Response.json({
    message: <span class="text-emerald-400">'Hello from the API!'</span>,
    timestamp: <span class="text-violet-400">new</span> Date().toISOString()
  });
}</code></pre>
          </div>
        </div>
      </div>
      
      <!-- Step 5 -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="font-bold text-pink-600 dark:text-pink-400">5</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-2">Build for Production</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Ready to deploy? Build your application</p>
            <pre class="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-sm font-mono overflow-x-auto"><code>npm run build
npm start</code></pre>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Next Steps -->
    <div class="mt-16 text-center">
      <h2 class="text-2xl font-bold mb-4">What's Next?</h2>
      <p class="text-zinc-600 dark:text-zinc-400 mb-8">Explore more features and capabilities</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/__docs" class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
          Read the Docs
        </a>
        <a href="/__examples" class="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          View Examples
        </a>
      </div>
    </div>
  </main>
` + footer;
}

export function generateExamplesPage(): string {
  return baseStyles.replace('%TITLE%', 'Examples') + header + `
  <main class="max-w-6xl mx-auto px-6 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl sm:text-5xl font-bold mb-4">Examples</h1>
      <p class="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
        Explore example projects to learn common patterns and best practices
      </p>
    </div>
    
    <!-- Examples Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Basic App -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">Basic App</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Simple starter with pages, layouts, and routing</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">React</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">TypeScript</span>
        </div>
      </div>
      
      <!-- Blog -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-violet-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">Blog</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Full blog with MDX, dynamic routes, and SSG</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">MDX</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">SSG</span>
        </div>
      </div>
      
      <!-- API Backend -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">API Backend</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">REST API with authentication and database</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">API</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Auth</span>
        </div>
      </div>
      
      <!-- AI Chat -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-pink-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">AI Chat</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Streaming chat with OpenAI integration</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">AI</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Streaming</span>
        </div>
      </div>
      
      <!-- E-commerce -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-amber-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">E-commerce</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Store with cart, checkout, and payments</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Stripe</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Cart</span>
        </div>
      </div>
      
      <!-- Dashboard -->
      <div class="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-cyan-500 transition-all hover:shadow-lg">
        <div class="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <h3 class="font-semibold text-lg mb-2">Dashboard</h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Admin panel with charts and real-time data</p>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Charts</span>
          <span class="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">Realtime</span>
        </div>
      </div>
      
    </div>
    
    <!-- CTA -->
    <div class="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
      <h2 class="text-2xl font-bold mb-4">Want to contribute?</h2>
      <p class="text-zinc-600 dark:text-zinc-400 mb-6">Share your example with the community</p>
      <a href="https://github.com/float-js/float-js" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        View on GitHub
      </a>
    </div>
  </main>
` + footer;
}
