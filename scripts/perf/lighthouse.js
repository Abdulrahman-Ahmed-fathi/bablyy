// scripts/perf/lighthouse.js
// Run Lighthouse on production server for key pages and save JSON reports
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',
  '/about',
  '/wishlist',
  '/products',
  '/products/pour-homme' // real slug from seed data
];

const outputDir = path.resolve(__dirname, '..', '..', 'perf', 'baseline');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

pages.forEach(page => {
  const PORT = process.env.PORT || 3000;
  const url = `http://localhost:${PORT}${page}`;
  const filename = page === '/' ? 'home' : page.replace(/\//g, '_').replace(/^_/, '');
  const outPath = path.join(outputDir, `${filename}.json`);
  console.log(`Running Lighthouse for ${url} -> ${outPath}`);
  try {
    execSync(`npx -y lighthouse ${url} --output=json --output-path=${outPath} --quiet --chrome-flags=\"--headless\"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Lighthouse failed for', url, e.message);
  }
});

console.log('Baseline collection completed');
