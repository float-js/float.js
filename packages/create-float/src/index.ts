import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATES = [
  { title: 'Basic', value: 'basic', description: 'Simple React app' },
  { title: 'Full', value: 'full', description: 'Full-featured app with routing' },
  { title: 'API', value: 'api', description: 'API-focused with backend routes' },
];

async function main() {
  console.log(pc.bold(pc.cyan('\n⚡ Create Float.js App\n')));

  const args = process.argv.slice(2);
  const projectName = args[0];

  const answers = await prompts([
    {
      type: projectName ? null : 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-float-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, dashes, and underscores';
        }
        return true;
      },
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: TEMPLATES,
    },
  ]);

  if (!answers.template) {
    console.log(pc.red('\n✖ Setup cancelled'));
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), projectName || answers.projectName);
  const template = answers.template;

  console.log(pc.cyan(`\nCreating project in ${targetDir}...`));

  await createProject(targetDir, template);

  console.log(pc.green('\n✓ Project created successfully!\n'));
  console.log(pc.bold('Next steps:\n'));
  console.log(`  cd ${path.basename(targetDir)}`);
  console.log('  pnpm install');
  console.log('  pnpm dev\n');
}

async function createProject(targetDir: string, template: string): Promise<void> {
  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates', template);
  await copyDir(templateDir, targetDir);

  // Create package.json
  const packageJson = {
    name: path.basename(targetDir),
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'float dev',
      build: 'float build',
      start: 'float start',
    },
    dependencies: {
      '@float/core': '^0.1.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@types/react': '^18.2.46',
      '@types/react-dom': '^18.2.18',
      typescript: '^5.3.3',
    },
  };

  await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
    },
    include: ['src/**/*'],
  };

  await fs.writeFile(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

  // Create .gitignore
  const gitignore = `node_modules
dist
.env
.env.local
*.log
`;

  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore);
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  try {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    // Template directory might not exist yet, that's ok
  }
}

main().catch((error) => {
  console.error(pc.red('Error:'), error);
  process.exit(1);
});
