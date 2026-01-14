import { parseArgs } from 'node:util';
import { DevServer } from './dev-server';
import { build } from './build';
import pc from 'picocolors';

const HELP_TEXT = `
${pc.bold(pc.cyan('Float.js'))} - The React framework for the AI era

${pc.bold('Usage:')}
  float dev [options]     Start development server
  float build [options]   Build for production
  float start [options]   Start production server

${pc.bold('Options:')}
  --port, -p <number>     Port number (default: 3000)
  --help, -h              Show help
  --version, -v           Show version
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '-h' || command === '--help') {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (command === '-v' || command === '--version') {
    const pkg = await import('../package.json', { assert: { type: 'json' } });
    console.log(pkg.default.version);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'dev': {
        const { values } = parseArgs({
          args: args.slice(1),
          options: {
            port: { type: 'string', short: 'p', default: '3000' },
          },
        });
        const port = parseInt(values.port as string, 10);
        const server = new DevServer({ port, root: process.cwd() });
        await server.start();
        break;
      }

      case 'build': {
        console.log(pc.cyan('Building for production...'));
        await build({ root: process.cwd() });
        console.log(pc.green('✓ Build complete!'));
        break;
      }

      case 'start': {
        const { values } = parseArgs({
          args: args.slice(1),
          options: {
            port: { type: 'string', short: 'p', default: '3000' },
          },
        });
        const port = parseInt(values.port as string, 10);
        const { createServer } = await import('./server-impl');
        const server = createServer({ port, root: process.cwd() });
        server.listen(port, () => {
          console.log(pc.green(`✓ Server running at http://localhost:${port}`));
        });
        break;
      }

      default:
        console.error(pc.red(`Unknown command: ${command}`));
        console.log(HELP_TEXT);
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red('Error:'), error);
    process.exit(1);
  }
}

main();
