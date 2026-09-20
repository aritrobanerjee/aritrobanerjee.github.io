import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// 1. Copy dist/index.html to dist/404.html (for GitHub Pages SPA fallback)
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Created dist/404.html for GitHub Pages SPA routing');

  // 2. Create physical folder dist/writing/causal-measurement/index.html for direct HTTP 200
  const essayDir = path.join(distDir, 'writing/causal-measurement');
  fs.mkdirSync(essayDir, { recursive: true });
  fs.copyFileSync(indexPath, path.join(essayDir, 'index.html'));
  console.log('✓ Created dist/writing/causal-measurement/index.html for direct HTTP 200 routing');
}
