/**
 * Float.js CLI
 * Ultra Modern Web Framework
 */

import { cac } from 'cac';
import pc from 'picocolors';
import { createDevServer } from '../server/dev-server.js';
import { build } from '../build/index.js';
import { startProductionServer } from '../server/prod-server.js';
import { VERSION } from '../version.js';

const cli = cac('float');

// ASCII Art Banner
const banner = `
${pc.cyan('╔═══════════════════════════════════════╗')}
${pc.cyan('║')}  ${pc.bold(pc.magenta('⚡ Float.js'))} ${pc.dim(`v${VERSION}`)}                  ${pc.cyan('║')}
${pc.cyan('║')}  ${pc.dim('Ultra Modern Web Framework')}          ${pc.cyan('║')}
${pc.cyan('╚═══════════════════════════════════════╝')}
`;

// float dev - Development server
cli
  .command('dev', 'Start development server')
  .option('-p, --port <port>', 'Port to listen on', { default: 3000 })
  .option('-h, --host <host>', 'Host to bind to', { default: 'localhost' })
  .option('--open', 'Open browser on start', { default: false })
  .action(async (options) => {
    console.log(banner);
    console.log(pc.cyan('🚀 Starting development server...\n'));
    
    try {
      const server = await createDevServer({
        port: Number(options.port),
        host: options.host,
        open: options.open,
      });
      
      await server.start();
    } catch (error) {
      console.error(pc.red('❌ Failed to start dev server:'), error);
      process.exit(1);
    }
  });

// float build - Build for production
cli
  .command('build', 'Build for production')
  .option('--analyze', 'Analyze bundle size', { default: false })
  .action(async (options) => {
    console.log(banner);
    console.log(pc.cyan('📦 Building for production...\n'));
    
    try {
      const startTime = Date.now();
      await build({ analyze: options.analyze });
      const duration = Date.now() - startTime;
      
      console.log(pc.green(`\n✅ Build completed in ${duration}ms`));
    } catch (error) {
      console.error(pc.red('❌ Build failed:'), error);
      process.exit(1);
    }
  });

// float start - Production server
cli
  .command('start', 'Start production server')
  .option('-p, --port <port>', 'Port to listen on', { default: 3000 })
  .option('-h, --host <host>', 'Host to bind to', { default: '0.0.0.0' })
  .action(async (options) => {
    console.log(banner);
    console.log(pc.cyan('🌐 Starting production server...\n'));
    
    try {
      await startProductionServer({
        port: Number(options.port),
        host: options.host,
      });
    } catch (error) {
      console.error(pc.red('❌ Failed to start server:'), error);
      process.exit(1);
    }
  });

// float info - Show environment info
cli
  .command('info', 'Show environment information')
  .action(() => {
    console.log(banner);
    console.log(pc.bold('Environment Info:\n'));
    console.log(`  ${pc.dim('Float.js:')}    v${VERSION}`);
    console.log(`  ${pc.dim('Node.js:')}     ${process.version}`);
    console.log(`  ${pc.dim('Platform:')}    ${process.platform}`);
    console.log(`  ${pc.dim('Arch:')}        ${process.arch}`);
    console.log(`  ${pc.dim('CWD:')}         ${process.cwd()}`);
  });

cli.help();
cli.version(VERSION);

cli.parse();
