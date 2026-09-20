import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const essaysDir = path.resolve(__dirname, '../src/content/essays');

// 1. Copy dist/index.html to dist/404.html (for GitHub Pages SPA fallback)
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Created dist/404.html for GitHub Pages SPA routing');

  // 2. Discover essay routes dynamically from src/content/essays/*.md
  let routes = [];
  if (fs.existsSync(essaysDir)) {
    routes = fs
      .readdirSync(essaysDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => `writing/${file.replace(/\.md$/, '')}`);
  }

  // Fallback defaults if no essays found
  if (routes.length === 0) {
    routes = [
      'writing/causal-measurement',
      'writing/design-what-cant-be-imagined',
      'writing/build-what-cant-be-defined',
    ];
  }

  const faviconPath = path.join(distDir, 'favicon.svg');

  routes.forEach((route) => {
    const routeDir = path.join(distDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
    if (fs.existsSync(faviconPath)) {
      fs.copyFileSync(faviconPath, path.join(routeDir, 'favicon.svg'));
    }
    console.log(`✓ Created dist/${route}/index.html for direct HTTP 200 routing`);
  });
}
