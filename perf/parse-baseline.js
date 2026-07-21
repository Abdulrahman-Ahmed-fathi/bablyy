const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'baseline');
const files = ['home', 'about', 'wishlist', 'products', 'products_pour-homme'];

for (const name of files) {
  const data = JSON.parse(fs.readFileSync(path.join(baseDir, `${name}.json`), 'utf8'));
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PAGE: ${name}`);
  console.log(`${'='.repeat(80)}`);

  // 1. Performance score
  const perfCategory = data.categories && data.categories.performance;
  const perfScore = perfCategory ? perfCategory.score : 'NOT FOUND';
  console.log(`\n--- PERFORMANCE SCORE ---`);
  console.log(`Score: ${perfScore} (${typeof perfScore === 'number' ? Math.round(perfScore * 100) : 'N/A'}/100)`);

  // 2. uses-responsive-images audit
  console.log(`\n--- USES-RESPONSIVE-IMAGES AUDIT ---`);
  const responsiveAudit = data.audits['uses-responsive-images'];
  if (responsiveAudit) {
    console.log(`Score: ${responsiveAudit.score}`);
    console.log(`Display: ${responsiveAudit.displayValue || 'none'}`);
    console.log(`Title: ${responsiveAudit.title}`);
    const overallSavings = responsiveAudit.details && responsiveAudit.details.overallSavingsBytes;
    console.log(`Overall savings (bytes): ${overallSavings}`);
    if (responsiveAudit.details && responsiveAudit.details.items && responsiveAudit.details.items.length > 0) {
      console.log(`Flagged images:`);
      for (const item of responsiveAudit.details.items) {
        console.log(`  URL: ${item.url}`);
        console.log(`    wastedBytes: ${item.wastedBytes}`);
        console.log(`    wastedPercent: ${item.wastedPercent}`);
        console.log(`    totalBytes: ${item.totalBytes}`);
        console.log(`    node label: ${item.node ? item.node.nodeLabel : 'N/A'}`);
        console.log(`    node snippet: ${item.node ? item.node.snippet : 'N/A'}`);
      }
    } else {
      console.log(`No flagged images (items array is empty or missing)`);
    }
  } else {
    console.log('Audit not found');
  }

  // Also check for modern-image-formats and offscreen-images
  for (const auditId of ['modern-image-formats', 'offscreen-images', 'uses-optimized-images', 'unsized-images']) {
    const audit = data.audits[auditId];
    if (audit && audit.details && audit.details.items && audit.details.items.length > 0) {
      console.log(`\n--- ${auditId.toUpperCase()} AUDIT ---`);
      console.log(`Score: ${audit.score}`);
      console.log(`Display: ${audit.displayValue || 'none'}`);
      console.log(`Overall savings (bytes): ${audit.details.overallSavingsBytes || 'N/A'}`);
      for (const item of audit.details.items) {
        console.log(`  URL: ${item.url}`);
        if (item.wastedBytes !== undefined) console.log(`    wastedBytes: ${item.wastedBytes}`);
        if (item.wastedPercent !== undefined) console.log(`    wastedPercent: ${item.wastedPercent}`);
        if (item.totalBytes !== undefined) console.log(`    totalBytes: ${item.totalBytes}`);
        if (item.node) console.log(`    node snippet: ${item.node.snippet}`);
      }
    }
  }

  // 3. mainthread-work-breakdown
  console.log(`\n--- MAINTHREAD-WORK-BREAKDOWN ---`);
  const mainthread = data.audits['mainthread-work-breakdown'];
  if (mainthread) {
    console.log(`Score: ${mainthread.score}`);
    console.log(`Display: ${mainthread.displayValue || 'none'}`);
    console.log(`numericValue (ms): ${mainthread.numericValue}`);
    if (mainthread.details && mainthread.details.items) {
      console.log(`Category breakdown:`);
      for (const item of mainthread.details.items) {
        console.log(`  ${item.group || item.groupLabel}: ${item.duration.toFixed(1)} ms`);
      }
    }
  } else {
    console.log('Audit not found');
  }

  // 4. bf-cache (only for products and products_pour-homme)
  if (name === 'products' || name === 'products_pour-homme') {
    console.log(`\n--- BF-CACHE AUDIT ---`);
    const bfcache = data.audits['bf-cache'];
    if (bfcache) {
      console.log(`Score: ${bfcache.score}`);
      console.log(`Display: ${bfcache.displayValue || 'none'}`);
      console.log(`Explanation: ${bfcache.explanation || 'none'}`);
      if (bfcache.details && bfcache.details.items) {
        for (const item of bfcache.details.items) {
          console.log(`  Failure type: ${item.failureType || 'N/A'}`);
          console.log(`  Reason: ${item.reason || JSON.stringify(item)}`);
          if (item.subItems && item.subItems.items) {
            for (const sub of item.subItems.items) {
              console.log(`    Sub-reason: ${sub.reason || JSON.stringify(sub)}`);
              if (sub.frameUrl) console.log(`    Frame URL: ${sub.frameUrl}`);
            }
          }
        }
      }
    } else {
      console.log('Audit not found');
    }
  }

  // Also dump key metrics for context
  console.log(`\n--- KEY METRICS ---`);
  const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'interactive'];
  for (const m of metrics) {
    const audit = data.audits[m];
    if (audit) {
      console.log(`  ${m}: ${audit.displayValue || audit.numericValue} (score: ${audit.score})`);
    }
  }
}
