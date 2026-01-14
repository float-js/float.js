import * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pc from 'picocolors';

export interface BuildConfig {
  root: string;
  outDir?: string;
}

export async function build(config: BuildConfig): Promise<void> {
  const outDir = config.outDir || path.join(config.root, 'dist');
  const clientEntry = path.join(config.root, 'src', 'entry-client.tsx');
  const serverEntry = path.join(config.root, 'src', 'entry-server.tsx');

  // Clean output directory
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  // Build client bundle
  console.log(pc.cyan('Building client bundle...'));
  await esbuild.build({
    entryPoints: [clientEntry],
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    outfile: path.join(outDir, 'client.js'),
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    splitting: false,
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.jsx': 'jsx',
      '.js': 'js',
    },
  });

  // Build server bundle if exists
  try {
    await fs.access(serverEntry);
    console.log(pc.cyan('Building server bundle...'));
    await esbuild.build({
      entryPoints: [serverEntry],
      bundle: true,
      format: 'esm',
      jsx: 'automatic',
      outfile: path.join(outDir, 'server.js'),
      platform: 'node',
      target: 'node18',
      minify: true,
      sourcemap: true,
      external: ['react', 'react-dom'],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
      },
    });
  } catch {
    // Server entry doesn't exist, skip
  }

  // Copy static files
  try {
    const publicDir = path.join(config.root, 'public');
    await fs.access(publicDir);
    await copyDir(publicDir, path.join(outDir, 'public'));
  } catch {
    // Public directory doesn't exist, skip
  }

  console.log(pc.green('✓ Client bundle built'));
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
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
}
