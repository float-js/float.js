/**
 * create-float
 * Create Float.js applications with one command
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const banner = `
${pc.cyan('╔═══════════════════════════════════════╗')}
${pc.cyan('║')}  ${pc.bold(pc.magenta('⚡ Create Float.js App'))}             ${pc.cyan('║')}
${pc.cyan('║')}  ${pc.dim('Ultra Modern Web Framework')}          ${pc.cyan('║')}
${pc.cyan('╚═══════════════════════════════════════╝')}
`;

interface Template {
  name: string;
  description: string;
  value: string;
}

const templates: Template[] = [
  { 
    name: 'Default', 
    description: 'Basic Float.js app with TypeScript',
    value: 'default',
  },
  { 
    name: 'Minimal', 
    description: 'Bare minimum setup',
    value: 'minimal',
  },
  { 
    name: 'Full Stack', 
    description: 'With API routes and database ready',
    value: 'fullstack',
  },
];

async function main() {
  console.log(banner);

  // Get project name from args or prompt
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-float-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) return 'Invalid project name';
        return true;
      },
    });

    if (!response.projectName) {
      console.log(pc.red('\n❌ Project creation cancelled\n'));
      process.exit(1);
    }

    projectName = response.projectName;
  }

  // Select template
  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: 'Select a template:',
    choices: templates.map(t => ({
      title: `${t.name} ${pc.dim(`- ${t.description}`)}`,
      value: t.value,
    })),
  });

  if (!template) {
    console.log(pc.red('\n❌ Project creation cancelled\n'));
    process.exit(1);
  }

  // Additional options
  const { typescript, tailwind, eslint } = await prompts([
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Add Tailwind CSS?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Add ESLint?',
      initial: true,
    },
  ]);

  const projectDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(pc.red('\n❌ Project creation cancelled\n'));
      process.exit(1);
    }

    fs.rmSync(projectDir, { recursive: true });
  }

  console.log(pc.cyan(`\n📁 Creating project in ${pc.bold(projectDir)}...\n`));

  // Create project structure
  createProject(projectDir, {
    name: projectName,
    template,
    typescript,
    tailwind,
    eslint,
  });

  // Success message
  console.log(pc.green('\n✅ Project created successfully!\n'));
  console.log(pc.bold('Next steps:\n'));
  console.log(`  ${pc.cyan('cd')} ${projectName}`);
  console.log(`  ${pc.cyan('pnpm')} install ${pc.dim('# or npm install')}`);
  console.log(`  ${pc.cyan('pnpm')} dev ${pc.dim('# or npm run dev')}`);
  console.log('');
  console.log(pc.dim('Happy coding with Float.js! ⚡\n'));
}

interface ProjectOptions {
  name: string;
  template: string;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
}

function createProject(projectDir: string, options: ProjectOptions) {
  const { name, typescript, tailwind, eslint } = options;
  const ext = typescript ? 'tsx' : 'jsx';

  fs.mkdirSync(projectDir, { recursive: true });

  // Create package.json
  const packageJson = {
    name,
    version: '2.0.3',
    private: true,
    type: 'module',
    scripts: {
      dev: 'float dev',
      build: 'float build',
      start: 'float start',
      lint: eslint ? 'eslint . --ext .ts,.tsx' : undefined,
    },
    dependencies: {
      '@float.js/core': '^2.0.3',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      ...(typescript && {
        typescript: '^5.3.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@types/node': '^20.10.0',
      }),
      ...(tailwind && {
        tailwindcss: '^3.4.0',
        autoprefixer: '^10.4.0',
        postcss: '^8.4.0',
      }),
      ...(eslint && {
        eslint: '^8.56.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
      }),
    },
  };

  // Remove undefined values
  Object.keys(packageJson.scripts).forEach(key => {
    if ((packageJson.scripts as any)[key] === undefined) {
      delete (packageJson.scripts as any)[key];
    }
  });

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create TypeScript config
  if (typescript) {
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'react-jsx',
        incremental: true,
        paths: {
          '@/*': ['./app/*'],
        },
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    };

    fs.writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
  }

  // Create float.config.ts
  const floatConfig = typescript
    ? `import type { FloatConfig } from '@float/core';

const config: FloatConfig = {
  reactStrictMode: true,
};

export default config;
`
    : `/** @type {import('@float/core').FloatConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
`;

  fs.writeFileSync(
    path.join(projectDir, typescript ? 'float.config.ts' : 'float.config.js'),
    floatConfig
  );

  // Create app directory
  const appDir = path.join(projectDir, 'app');
  fs.mkdirSync(appDir, { recursive: true });

  // Create root layout
  const layoutContent = typescript
    ? `import type { ReactNode } from 'react';
import type { Metadata } from '@float/core';

export const metadata: Metadata = {
  title: {
    default: '${name}',
    template: '%s | ${name}',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    : `
export const metadata = {
  title: {
    default: '${name}',
    template: '%s | ${name}',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  fs.writeFileSync(path.join(appDir, `layout.${ext}`), layoutContent);

  // Create Float.js Welcome Home Page
  const pageContent = `
export default function HomePage() {
  return (
    <>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #fafafa;
          color: #171717;
          -webkit-font-smoothing: antialiased;
        }
        
        /* Header */
        .header {
          border-bottom: 1px solid #e5e5e5;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #171717;
        }
        .logo-img {
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }
        .header-nav {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .header-nav a {
          color: #737373;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .header-nav a:hover {
          color: #171717;
        }
        
        /* Hero */
        .hero {
          max-width: 900px;
          margin: 0 auto;
          padding: 120px 24px 80px;
          text-align: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: #f5f5f5;
          border: 1px solid #e5e5e5;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #525252;
          margin-bottom: 24px;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }
        .hero h1 {
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #0a0a0a;
        }
        .hero p {
          font-size: 20px;
          color: #737373;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: #0a0a0a;
          color: #ffffff;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: #171717;
          transform: translateY(-1px);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: #ffffff;
          color: #0a0a0a;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: #0a0a0a;
          transform: translateY(-1px);
        }
        
        /* Features */
        .features {
          max-width: 1200px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 32px;
          transition: all 0.3s;
        }
        .feature-card:hover {
          border-color: #0a0a0a;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          background: #f5f5f5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .feature-icon svg {
          width: 24px;
          height: 24px;
        }
        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #0a0a0a;
        }
        .feature-card p {
          font-size: 15px;
          line-height: 1.7;
          color: #737373;
          margin-bottom: 16px;
        }
        .feature-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #0a0a0a;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }
        .feature-link svg {
          width: 14px;
          height: 14px;
          transition: transform 0.2s;
        }
        .feature-link:hover svg {
          transform: translateX(3px);
        }
        
        /* Code Section */
        .code-section {
          max-width: 1200px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }
        .code-section h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 32px;
          text-align: center;
        }
        .code-block {
          background: #0a0a0a;
          border-radius: 12px;
          padding: 32px;
          overflow-x: auto;
        }
        .code-line {
          display: flex;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          line-height: 1.8;
        }
        .code-num {
          color: #525252;
          width: 40px;
          user-select: none;
          text-align: right;
          padding-right: 24px;
        }
        .code-content {
          color: #e5e5e5;
        }
        .code-comment {
          color: #737373;
        }
        .code-keyword {
          color: #a78bfa;
        }
        .code-string {
          color: #34d399;
        }
        
        /* Footer */
        .footer {
          border-top: 1px solid #e5e5e5;
          background: #ffffff;
          padding: 60px 24px 40px;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .footer-brand h4 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .footer-brand p {
          font-size: 14px;
          color: #737373;
          line-height: 1.6;
        }
        .footer-col h5 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #0a0a0a;
        }
        .footer-col ul {
          list-style: none;
        }
        .footer-col li {
          margin-bottom: 12px;
        }
        .footer-col a {
          color: #737373;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: #0a0a0a;
        }
        .footer-bottom {
          padding-top: 32px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #737373;
        }
        .footer-social {
          display: flex;
          gap: 16px;
        }
        .footer-social a {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 8px;
          color: #525252;
          transition: all 0.2s;
        }
        .footer-social a:hover {
          background: #0a0a0a;
          color: #ffffff;
        }
        .footer-social svg {
          width: 18px;
          height: 18px;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 20px;
          }
        }
      \`}</style>
      
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-img" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}></div>
            <span>Float.js</span>
          </div>
          <nav className="header-nav">
            <a href="https://github.com/float-js/float.js#readme">Docs</a>
            <a href="https://github.com/float-js/float.js/tree/main/examples">Examples</a>
            <a href="https://github.com/float-js/float.js">GitHub</a>
          </nav>
        </div>
      </header>
      
      <main>
        <section className="hero">
          <div className="badge">
            <span className="badge-dot"></span>
            Project created successfully
          </div>
          <h1>Welcome to Float.js</h1>
          <p>The ultra-modern web framework for building lightning-fast React applications with zero configuration. Start building now.</p>
          <div className="cta-buttons">
            <a href="https://github.com/float-js/float.js#readme" className="btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Read Documentation
            </a>
            <a href="https://github.com/float-js/float.js/tree/main/examples" className="btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              View Examples
            </a>
          </div>
        </section>
        
        <section className="features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>Built for speed with optimized builds, code splitting, and instant HMR for the best developer experience.</p>
              <a href="https://github.com/float-js/float.js#performance" className="feature-link">
                Learn more
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 3l6 5-6 5V3z"></path>
                </svg>
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <h3>File-based Routing</h3>
              <p>Intuitive file-system based routing with support for dynamic routes, layouts, and nested routing out of the box.</p>
              <a href="https://github.com/float-js/float.js#routing" className="feature-link">
                Learn more
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 3l6 5-6 5V3z"></path>
                </svg>
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3>Zero Config</h3>
              <p>Start building immediately with sensible defaults. No webpack config, no babel setup - just write code.</p>
              <a href="https://github.com/float-js/float.js#getting-started" className="feature-link">
                Learn more
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 3l6 5-6 5V3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        <section className="code-section">
          <h2>Get Started in Seconds</h2>
          <div className="code-block">
            <div className="code-line">
              <span className="code-num">1</span>
              <span className="code-content code-comment"># Start development server</span>
            </div>
            <div className="code-line">
              <span className="code-num">2</span>
              <span className="code-content"><span className="code-keyword">npx</span> float <span className="code-string">dev</span></span>
            </div>
            <div className="code-line"><span className="code-num">3</span><span></span></div>
            <div className="code-line">
              <span className="code-num">4</span>
              <span className="code-content code-comment"># Build for production</span>
            </div>
            <div className="code-line">
              <span className="code-num">5</span>
              <span className="code-content"><span className="code-keyword">npx</span> float <span className="code-string">build</span></span>
            </div>
            <div className="code-line"><span className="code-num">6</span><span></span></div>
            <div className="code-line">
              <span className="code-num">7</span>
              <span className="code-content code-comment"># Start production server</span>
            </div>
            <div className="code-line">
              <span className="code-num">8</span>
              <span className="code-content"><span className="code-keyword">npx</span> float <span className="code-string">start</span></span>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <h4>Float.js</h4>
              <p>The ultra-modern web framework for building lightning-fast React applications. Open source and production-ready.</p>
            </div>
            <div className="footer-col">
              <h5>Resources</h5>
              <ul>
                <li><a href="https://github.com/float-js/float.js#readme">Documentation</a></li>
                <li><a href="https://github.com/float-js/float.js/tree/main/examples">Examples</a></li>
                <li><a href="https://github.com/float-js/float.js#api">API Reference</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Community</h5>
              <ul>
                <li><a href="https://github.com/float-js/float.js">GitHub</a></li>
                <li><a href="https://github.com/float-js/float.js/issues">Issues</a></li>
                <li><a href="https://github.com/float-js/float.js/discussions">Discussions</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <ul>
                <li><a href="https://github.com/float-js/float.js/blob/main/LICENSE">License</a></li>
                <li><a href="https://github.com/float-js/float.js/blob/main/CODE_OF_CONDUCT.md">Code of Conduct</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Float.js. MIT Licensed. Edit <strong>app/page.tsx</strong> to get started.</p>
            <div className="footer-social">
              <a href="https://github.com/float-js/float.js">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://www.npmjs.com/package/@float.js/core">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 10v4h6v2H4v-2H2v4h4v2h4v-6H8v2H6v-4h2v4h2v-6H0zm12 0v6h2v-6h-2zm2 0h8v6h-2v-4h-2v4h-2v-4h-2v4h-2v-6z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
`;

  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  // Create Tailwind files if enabled
  if (tailwind) {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-rgb: 10, 10, 10;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;

    fs.writeFileSync(path.join(appDir, 'globals.css'), globalsCss);

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

    fs.writeFileSync(path.join(projectDir, 'tailwind.config.js'), tailwindConfig);

    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

    fs.writeFileSync(path.join(projectDir, 'postcss.config.js'), postcssConfig);
  }

  // Create public directory
  fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true });

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build
.float/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Env
.env
.env.local
`;

  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

  // Create README
  const readme = `# ${name}

Built with [Float.js](https://github.com/float/float.js) - Ultra Modern Web Framework

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## Learn More

- [Float.js Documentation](https://float.js.org/docs)
- [Examples](https://github.com/float/float.js/tree/main/examples)
`;

  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
}

main().catch(console.error);
