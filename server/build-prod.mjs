import * as esbuild from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const dbProdPlugin = {
  name: 'db-prod-redirect',
  setup(build) {
    build.onResolve({ filter: /\/db$/ }, async (args) => {
      const prodPath = args.path.replace(/\/db$/, '/db.prod');
      const result = await build.resolve(prodPath, {
        kind: args.kind,
        resolveDir: args.resolveDir,
      });
      if (result.errors.length > 0) {
        return null;
      }
      return { path: result.path };
    });

    build.onResolve({ filter: /^\.\.?\/db$/ }, async (args) => {
      const prodPath = args.path.replace(/\/db$/, '/db.prod');
      const result = await build.resolve(prodPath, {
        kind: args.kind,
        resolveDir: args.resolveDir,
      });
      if (result.errors.length > 0) {
        return null;
      }
      return { path: result.path };
    });
  },
};

async function buildProduction() {
  try {
    const result = await esbuild.build({
      entryPoints: [resolve(rootDir, 'server/index.prod.ts')],
      bundle: true,
      platform: 'node',
      packages: 'external',
      format: 'esm',
      outfile: resolve(rootDir, 'dist/index.js'),
      plugins: [dbProdPlugin],
      metafile: true,
      logLevel: 'info',
    });

    const inputs = Object.keys(result.metafile.inputs);
    const usesNeonDb = inputs.some(f => f.includes('db.ts') && !f.includes('db.prod.ts'));
    const usesPgDb = inputs.some(f => f.includes('db.prod.ts'));
    
    console.log('\n=== Build Verification ===');
    console.log(`Uses db.prod.ts (pg driver): ${usesPgDb ? 'YES' : 'NO'}`);
    console.log(`Uses db.ts (neon driver): ${usesNeonDb ? 'YES (may cause SSL issues)' : 'NO'}`);
    
    if (usesPgDb && !usesNeonDb) {
      console.log('\nProduction build configured for local PostgreSQL');
    }

    // Copy static assets to dist (critical for production)
    const staticAssets = [
      { src: 'server/openapi.json', dest: 'dist/openapi.json', critical: true },
    ];
    
    console.log('\n=== Copying Static Assets ===');
    for (const asset of staticAssets) {
      const srcPath = resolve(rootDir, asset.src);
      const destPath = resolve(rootDir, asset.dest);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${asset.src} → ${asset.dest}`);
      } else if (asset.critical) {
        console.error(`✗ CRITICAL: Missing required asset ${asset.src}`);
        process.exit(1);
      } else {
        console.warn(`⚠ Missing optional asset ${asset.src}`);
      }
    }

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildProduction();
