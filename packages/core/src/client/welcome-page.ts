/**
 * Float.js Welcome Page
 * Professional welcome screen inspired by Next.js
 * Features: Light/Dark mode, Header, Features section, Footer
 */

export function generateWelcomePage(): string {
  return `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Float.js</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0%25' y1='100%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%233B82F6'/><stop offset='100%25' stop-color='%238B5CF6'/></linearGradient></defs><path d='M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z' fill='url(%23g)'/><path d='M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z' fill='url(%23g)'/><path d='M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z' fill='url(%23g)'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .fade-up { animation: fade-up 0.6s ease-out forwards; }
    .fade-up-1 { animation: fade-up 0.6s ease-out 0.1s forwards; opacity: 0; }
    .fade-up-2 { animation: fade-up 0.6s ease-out 0.2s forwards; opacity: 0; }
    .fade-up-3 { animation: fade-up 0.6s ease-out 0.3s forwards; opacity: 0; }
    .fade-up-4 { animation: fade-up 0.6s ease-out 0.4s forwards; opacity: 0; }
    .logo-float { animation: float 4s ease-in-out infinite; }
  </style>
</head>
<body class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
  
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3">
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
        <span class="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium">v2.0.6</span>
      </div>
      
      <!-- Nav -->
      <nav class="hidden sm:flex items-center gap-6">
        <a href="/__docs" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Docs</a>
        <a href="/__learn" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Learn</a>
        <a href="/__examples" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Examples</a>
        <a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a>
      </nav>
      
      <!-- Dark Mode Toggle -->
      <button id="theme-toggle" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Toggle theme">
        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      </button>
    </div>
  </header>
  
  <!-- Hero Section -->
  <main class="pt-32 pb-20 px-6">
    <div class="max-w-4xl mx-auto text-center">
      
      <!-- Logo -->
      <div class="fade-up logo-float mb-8">
        <svg class="w-24 h-24 mx-auto" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="hero-grad" x1="50" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#hero-grad)"/>
          <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#hero-grad)"/>
          <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#hero-grad)"/>
        </svg>
      </div>
      
      <!-- Title -->
      <h1 class="fade-up-1 text-4xl sm:text-6xl font-bold tracking-tight mb-6">
        The React Framework<br/>
        <span class="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">for the Modern Web</span>
      </h1>
      
      <!-- Subtitle -->
      <p class="fade-up-2 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
        Build full-stack React applications with file-based routing, SSR, API routes, 
        and lightning-fast HMR. Get started by creating your first page.
      </p>
      
      <!-- CTA Buttons -->
      <div class="fade-up-3 flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/__learn" 
           class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg hover:shadow-xl">
          Get Started
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
        <a href="/__docs"
           class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          Documentation
        </a>
      </div>
      
      <!-- Code Block -->
      <div class="fade-up-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-left max-w-xl mx-auto shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div class="w-3 h-3 rounded-full bg-green-400"></div>
          <span class="ml-3 text-xs text-zinc-500 font-mono">app/page.tsx</span>
        </div>
        <pre class="text-sm font-mono overflow-x-auto text-zinc-800 dark:text-zinc-200"><code><span class="text-violet-600 dark:text-violet-400">export default</span> <span class="text-blue-600 dark:text-blue-400">function</span> <span class="text-amber-600 dark:text-yellow-300">Page</span>() {
  <span class="text-violet-600 dark:text-violet-400">return</span> (
    <span class="text-zinc-500">&lt;</span><span class="text-emerald-600 dark:text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>Hello, Float.js!<span class="text-zinc-500">&lt;/</span><span class="text-emerald-600 dark:text-emerald-400">h1</span><span class="text-zinc-500">&gt;</span>
  );
}</code></pre>
      </div>
      
    </div>
  </main>
  
  <!-- Features Section -->
  <section class="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl sm:text-3xl font-bold text-center mb-4">Built for Performance</h2>
      <p class="text-zinc-600 dark:text-zinc-400 text-center mb-12 max-w-xl mx-auto">
        Everything you need to build fast, modern web applications
      </p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Feature 1 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Lightning Fast HMR</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">Instant hot module replacement. See your changes in milliseconds without losing state.</p>
        </div>
        
        <!-- Feature 2 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-violet-500 dark:hover:border-violet-500 transition-colors">
          <div class="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">File-Based Routing</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">Create routes by adding files to the app directory. Dynamic routes, layouts, and more.</p>
        </div>
        
        <!-- Feature 3 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
          <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Server-Side Rendering</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">Automatic SSR for optimal SEO and performance. Hybrid rendering strategies.</p>
        </div>
        
        <!-- Feature 4 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors">
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">API Routes</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">Build your backend API with simple route handlers. Full TypeScript support.</p>
        </div>
        
        <!-- Feature 5 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-pink-500 dark:hover:border-pink-500 transition-colors">
          <div class="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Built-in AI Integration</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">First-class support for AI streaming, OpenAI, Anthropic, and more.</p>
        </div>
        
        <!-- Feature 6 -->
        <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors">
          <div class="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Developer Experience</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">Error overlay, DevTools, and debugging utilities built-in for a smooth workflow.</p>
        </div>
        
      </div>
    </div>
  </section>
  
  <!-- Quick Start Section -->
  <section class="py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl sm:text-3xl font-bold text-center mb-4">Get Started in Seconds</h2>
      <p class="text-zinc-600 dark:text-zinc-400 text-center mb-12">Create your first page and see it live</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div class="text-xs text-zinc-500 mb-2 uppercase tracking-wider">1. Create page</div>
          <code class="text-sm font-mono text-zinc-700 dark:text-zinc-300">touch app/page.tsx</code>
        </div>
        <div class="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div class="text-xs text-zinc-500 mb-2 uppercase tracking-wider">2. Add route</div>
          <code class="text-sm font-mono text-zinc-700 dark:text-zinc-300">mkdir app/about</code>
        </div>
        <div class="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div class="text-xs text-zinc-500 mb-2 uppercase tracking-wider">3. API route</div>
          <code class="text-sm font-mono text-zinc-700 dark:text-zinc-300">touch app/api/route.ts</code>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Footer -->
  <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12 px-6 bg-zinc-50 dark:bg-zinc-900/50">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-12">
        
        <!-- Brand -->
        <div class="sm:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-8 h-8" viewBox="0 0 200 200" fill="none">
              <defs>
                <linearGradient id="ftr-grad" x1="50" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/>
                </linearGradient>
              </defs>
              <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#ftr-grad)"/>
              <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#ftr-grad)"/>
              <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#ftr-grad)"/>
            </svg>
            <span class="font-semibold text-lg">Float.js</span>
          </div>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            The React framework for the modern web.
          </p>
        </div>
        
        <!-- Resources -->
        <div>
          <h4 class="font-semibold mb-4 text-sm">Resources</h4>
          <ul class="space-y-2">
            <li><a href="/__docs" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Documentation</a></li>
            <li><a href="/__learn" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Learn Float.js</a></li>
            <li><a href="/__examples" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Examples</a></li>
            <li><a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</a></li>
          </ul>
        </div>
        
        <!-- More -->
        <div>
          <h4 class="font-semibold mb-4 text-sm">More</h4>
          <ul class="space-y-2">
            <li><a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a></li>
            <li><a href="https://github.com/float-js/float-js/releases" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Releases</a></li>
            <li><a href="https://x.com/floatjs" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Twitter</a></li>
          </ul>
        </div>
        
        <!-- Legal -->
        <div>
          <h4 class="font-semibold mb-4 text-sm">Legal</h4>
          <ul class="space-y-2">
            <li><a href="https://github.com/float-js/float-js/blob/main/LICENSE" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">MIT License</a></li>
            <li><a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Contribute</a></li>
          </ul>
        </div>
        
      </div>
      
      <!-- Bottom -->
      <div class="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-zinc-500">
          © 2024-2026 Float.js. Created by <span class="text-zinc-700 dark:text-zinc-300 font-medium">Peter Fulle</span>
        </p>
        <div class="flex items-center gap-4">
          <a href="mailto:prfulle@gmail.com" class="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">prfulle@gmail.com</a>
          <a href="https://github.com/float-js/float-js" target="_blank" class="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://x.com/floatjs" target="_blank" class="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
  
  <!-- Theme Toggle Script -->
  <script>
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme or system preference
    if (localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
      html.classList.remove('light');
    }
    
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      html.classList.toggle('light');
      localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    });
  </script>
  
</body>
</html>`;
}
