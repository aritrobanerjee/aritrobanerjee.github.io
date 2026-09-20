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

  // 2. Create physical folder routes for direct HTTP 200 on GitHub Pages
  const routes = [
    'writing/causal-measurement',
    'writing/design-what-cant-be-imagined',
  ];

  routes.forEach((route) => {
    const routeDir = path.join(distDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
    console.log(`✓ Created dist/${route}/index.html for direct HTTP 200 routing`);
  });
}
