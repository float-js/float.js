/**
 * Float.js Transform
 * On-the-fly TypeScript/JSX transformation
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Module cache for dev mode
const moduleCache = new Map<string, { module: any; mtime: number }>();

/**
 * Transform and import a file
 * Handles .ts, .tsx, .js, .jsx files
 */
export async function transformFile(filePath: string): Promise<any> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const stats = fs.statSync(absolutePath);
  const mtime = stats.mtimeMs;

  // Check cache
  const cached = moduleCache.get(absolutePath);
  if (cached && cached.mtime === mtime) {
    return cached.module;
  }

  // Read source
  const source = fs.readFileSync(absolutePath, 'utf-8');
  const ext = path.extname(absolutePath);

  // Determine loader
  const loader = getLoader(ext);

  // Transform with esbuild
  const result = await esbuild.transform(source, {
    loader,
    jsx: 'automatic',
    format: 'esm',
    target: 'node18',
    sourcemap: 'inline',
    sourcefile: absolutePath,
  });

  // Create temporary file for import
  const tempDir = path.join(process.cwd(), '.float', '.cache');
  fs.mkdirSync(tempDir, { recursive: true });

  // Use a stable filename based on the source file path
  const hash = Buffer.from(absolutePath).toString('base64').replace(/[/+=]/g, '_');
  const tempFile = path.join(tempDir, `${hash}.mjs`);

  // Rewrite imports to absolute paths
  let code = result.code;
  const baseDir = path.dirname(absolutePath);

  code = await rewriteImports(code, baseDir, tempDir);

  fs.writeFileSync(tempFile, code);

  try {
    // Dynamic import
    const module = await import(pathToFileURL(tempFile).href + '?t=' + mtime);

    // Cache the result
    moduleCache.set(absolutePath, { module, mtime });

    return module;
  } catch (error) {
    console.error(`[Float Error] Failed to import transformed file: ${tempFile}`);
    console.error(`[Float Error] Original file: ${absolutePath}`);
    console.error(`[Float Error] Stack:`, error);

    // Clean up on error
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch { }
    throw error;
  }
}

/**
 * Get esbuild loader for file extension
 */
function getLoader(ext: string): esbuild.Loader {
  switch (ext) {
    case '.ts': return 'ts';
    case '.tsx': return 'tsx';
    case '.jsx': return 'jsx';
    case '.js': return 'js';
    case '.mjs': return 'js';
    case '.json': return 'json';
    case '.css': return 'css';
    default: return 'ts';
  }
}

/**
 * Rewrite imports to absolute paths and handle aliases
 */
async function rewriteImports(code: string, baseDir: string, cacheDir: string): Promise<string> {
  const rootDir = process.cwd();

  // Match all strings in what looks like an import or export context
  const importRegex = /(?:import|export|from)\s+(['"`])(.*?)\1|import\((['"`])(.*?)\3\)/g;

  const matches = [...code.matchAll(importRegex)];

  for (const match of matches) {
    const quoteMatch = match[0].match(/(['"`])(.*?)\1/);
    if (!quoteMatch) continue;

    const importPath = quoteMatch[2];

    let resolvedPath: string;

    if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
      resolvedPath = path.resolve(rootDir, importPath.slice(2));
    } else if (importPath.startsWith('.')) {
      resolvedPath = path.resolve(baseDir, importPath);
    } else {
      // It's a bare import or absolute path. 
      continue;
    }

    // Try to find the file with various extensions
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.css', ''];
    let found = false;
    let finalPath = resolvedPath;

    for (const ext of extensions) {
      const tryPath = resolvedPath + ext;
      try {
        if (fs.existsSync(tryPath) && !fs.statSync(tryPath).isDirectory()) {
          finalPath = tryPath;
          found = true;
          break;
        }
      } catch (e) { }

      // Try index file
      const indexPath = path.join(resolvedPath, `index${ext}`);
      try {
        if (fs.existsSync(indexPath) && !fs.statSync(indexPath).isDirectory()) {
          finalPath = indexPath;
          found = true;
          break;
        }
      } catch (e) { }
    }

    if (!found) {
      continue;
    }

    // Mock non-JS/TS assets for SSR
    const assetExts = ['.css', '.scss', '.sass', '.less', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'];
    if (assetExts.some(ext => finalPath.endsWith(ext))) {
      code = code.replace(match[0], match[0].replace(importPath, `data:text/javascript,export default {}`));
      continue;
    }

    // For TypeScript/JavaScript files, transform them and point to the cached version
    const fileExt = path.extname(finalPath);
    if (['.ts', '.tsx', '.jsx'].includes(fileExt)) {
      // Generate stable cache filename
      const hash = Buffer.from(finalPath).toString('base64').replace(/[/+=]/g, '_');
      const cachedFile = path.join(cacheDir, `${hash}.mjs`);

      // Transform the file if not already cached or if modified
      if (!fs.existsSync(cachedFile) || fs.statSync(finalPath).mtimeMs > fs.statSync(cachedFile).mtimeMs) {
        const depSource = fs.readFileSync(finalPath, 'utf-8');
        const depResult = await esbuild.transform(depSource, {
          loader: getLoader(fileExt),
          jsx: 'automatic',
          format: 'esm',
          target: 'node18',
          sourcemap: 'inline',
          sourcefile: finalPath,
        });

        // Recursively rewrite imports in the dependency
        const depBaseDir = path.dirname(finalPath);
        const depCode = await rewriteImports(depResult.code, depBaseDir, cacheDir);
        fs.writeFileSync(cachedFile, depCode);
      }

      const newPath = pathToFileURL(cachedFile).href;
      code = code.replace(match[0], match[0].replace(importPath, newPath));
    } else if (fileExt === '.json') {
      // For JSON files, add import assertion
      const newPath = pathToFileURL(finalPath).href;
      // Check if the import already has an assertion
      if (!match[0].includes('assert') && !match[0].includes('with')) {
        // Add assertion after the import path
        const replacement = match[0].replace(importPath, newPath) + ' assert { type: "json" }';
        code = code.replace(match[0], replacement);
      } else {
        code = code.replace(match[0], match[0].replace(importPath, newPath));
      }
    } else {
      // For .js and .mjs files, use them directly
      const newPath = pathToFileURL(finalPath).href;
      code = code.replace(match[0], match[0].replace(importPath, newPath));
    }
  }

  // Post-processing: Add JSON import assertions
  // Match any import from a .json file that doesn't already have an assertion
  const jsonImportRegex = /(from\s+['"`][^'"` ]*\.json['"`])/g;
  code = code.replace(jsonImportRegex, (match) => {
    // Check if there's already an assertion nearby
    const contextStart = Math.max(0, code.indexOf(match) - 50);
    const contextEnd = Math.min(code.length, code.indexOf(match) + match.length + 50);
    const context = code.substring(contextStart, contextEnd);

    if (context.includes('assert') || context.includes('with')) {
      return match;
    }

    return match + ' assert { type: "json" }';
  });

  return code;
}

/**
 * Clear module cache (for HMR)
 */
export function clearModuleCache(filePath?: string) {
  if (filePath) {
    moduleCache.delete(path.resolve(filePath));
  } else {
    moduleCache.clear();
  }
}

/**
 * Transform source code without file operations
 */
export async function transformSource(
  source: string,
  options: { filename?: string; loader?: esbuild.Loader } = {}
): Promise<string> {
  const { filename = 'module.tsx', loader = 'tsx' } = options;

  const result = await esbuild.transform(source, {
    loader,
    jsx: 'automatic',
    format: 'esm',
    target: 'node18',
    sourcemap: 'inline',
    sourcefile: filename,
  });

  return result.code;
}
