import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const aliasPlugin = {
  name: 'alias-plugin',
  setup(build) {
    build.onResolve({ filter: /^@db/ }, (args) => {
      const modulePath = args.path.replace('@db', path.resolve(rootDir, 'db'));
      return { path: modulePath + (modulePath.endsWith('.ts') ? '' : '.ts') };
    });

    build.onResolve({ filter: /^@shared/ }, (args) => {
      const modulePath = args.path.replace('@shared', path.resolve(rootDir, 'shared'));
      return { path: modulePath + (modulePath.endsWith('.ts') ? '' : '.ts') };
    });
  },
};

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['server/index.prod.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: 'dist/index.js',
      banner: {
        js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
      },
      external: [
        '@neondatabase/serverless',
        'express',
        'cors',
        'helmet',
        'compression',
        'cookie-parser',
        'csurf',
        'express-rate-limit',
        'express-session',
        'memorystore',
        'passport',
        'passport-local',
        'bcryptjs',
        'jsonwebtoken',
        'otplib',
        'qrcode',
        'nodemailer',
        'multer',
        'sharp',
        'natural',
        'drizzle-orm',
        'drizzle-zod',
        'socket.io',
        'ws',
        'stripe',
        'openai',
        'winston',
        'winston-daily-rotate-file',
        'morgan',
        'uuid',
        'zod',
        'swagger-ui-express',
        'googleapis',
        'node-fetch',
        'node-cache',
        'memoizee',
        'agenda',
        'mongodb',
        '@sinclair/typebox',
        'inngest',
        '@mastra/core',
        '@mastra/memory',
        '@mastra/pg',
        '@mastra/inngest',
        '@ai-sdk/openai',
        '@anthropic-ai/sdk',
        '@opentelemetry/sdk-trace-base',
        '@opentelemetry/sdk-trace-node',
        'ua-parser-js',
        'cookie',
        'crypto-js',
        'http',
        'https',
        'path',
        'fs',
        'url',
        'util',
        'stream',
        'crypto',
        'events',
        'querystring',
        'net',
        'tls',
        'dns',
        'os',
        'child_process',
        'buffer',
        'assert',
        'process',
        'cluster',
        'perf_hooks'
      ],
      plugins: [aliasPlugin],
      sourcemap: false,
      minify: false,
      treeShaking: true,
      loader: {
        '.ts': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      logLevel: 'info',
    });
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
