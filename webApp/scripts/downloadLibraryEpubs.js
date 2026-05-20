#!/usr/bin/env node
/**
 * Downloads EPUB files for all library books to public/Reader/.
 * Files are saved as pg{ebookId}.epub.noimages (preferred) or
 * pg{ebookId}.epub.images (fallback).
 *
 * Usage: node scripts/downloadLibraryEpubs.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CATEGORIES_PATH = path.join(__dirname, '../src/app/api/reader/library/categories.json');
const OUTPUT_DIR = path.join(__dirname, '../public/Reader');

const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf-8'));
const ebookIds = [...new Set(categories.flatMap((c) => c.books.map((b) => b.ebookId)))];

/** Map ebookId → coverUrl from the catalog (may be null). */
const coverUrlByEbookId = Object.fromEntries(
  categories.flatMap((c) => c.books.map((b) => [b.ebookId, b.coverUrl ?? null])),
);

/**
 * Download a URL to a local file path, following redirects manually.
 */
const downloadFile = (url, dest, redirectsLeft = 5) =>
  new Promise((resolve, reject) => {
    if (redirectsLeft === 0) {
      reject(new Error(`Too many redirects for ${url}`));
      return;
    }
    const file = fs.createWriteStream(dest);
    https
      .get(
        url,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; epub-downloader)' } },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
            file.close(() => {
              try {
                fs.unlinkSync(dest);
              } catch (_) {}
              const location = res.headers.location;
              const next = location.startsWith('http')
                ? location
                : new URL(location, url).toString();
              downloadFile(next, dest, redirectsLeft - 1)
                .then(resolve)
                .catch(reject);
            });
            res.resume();
            return;
          }
          if (res.statusCode !== 200) {
            file.close(() => {
              try {
                fs.unlinkSync(dest);
              } catch (_) {}
              reject(new Error(`HTTP ${res.statusCode}`));
            });
            res.resume();
            return;
          }
          res.pipe(file);
          file.on('finish', () => file.close(resolve));
          file.on('error', (err) => {
            try {
              fs.unlinkSync(dest);
            } catch (_) {}
            reject(err);
          });
        },
      )
      .on('error', (err) => {
        try {
          fs.unlinkSync(dest);
        } catch (_) {}
        reject(err);
      });
  });

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Downloading ${ebookIds.length} EPUBs to ${OUTPUT_DIR}\n`);

  for (const ebookId of ebookIds) {
    // Gutenberg serves EPUB via ebooks/{id}.epub.noimages which redirects
    // to the CDN at cache/epub/{id}/pg{id}.epub
    const variants = [
      {
        filename: `pg${ebookId}.epub`,
        url: `https://www.gutenberg.org/ebooks/${ebookId}.epub.noimages`,
      },
      {
        filename: `pg${ebookId}.epub`,
        url: `https://www.gutenberg.org/ebooks/${ebookId}.epub.images`,
      },
    ];

    let done = false;
    for (const { filename, url } of variants) {
      const dest = path.join(OUTPUT_DIR, filename);
      if (fs.existsSync(dest)) {
        const kb = Math.round(fs.statSync(dest).size / 1024);
        console.log(`  ✓ ${filename} (${kb} kB, already exists)`);
        done = true;
        break;
      }
      process.stdout.write(`  ↓ ${filename} ...`);
      try {
        await downloadFile(url, dest);
        const kb = Math.round(fs.statSync(dest).size / 1024);
        console.log(` ${kb} kB`);
        done = true;
        break;
      } catch (err) {
        console.log(` failed: ${err.message}`);
      }
    }

    if (!done) {
      console.error(`  ✗ Could not download ebook ${ebookId}`);
    }

    // Download cover image — Gutenberg's largest size is "medium" (~400px wide)
    const coverFilename = `pg${ebookId}.cover.jpg`;
    const coverUrl = `https://www.gutenberg.org/cache/epub/${ebookId}/pg${ebookId}.cover.medium.jpg`;
    const coverDest = path.join(OUTPUT_DIR, coverFilename);
    if (fs.existsSync(coverDest)) {
      console.log(`  ✓ ${coverFilename} (already exists)`);
    } else {
      process.stdout.write(`  ↓ ${coverFilename} ...`);
      try {
        await downloadFile(coverUrl, coverDest);
        const kb = Math.round(fs.statSync(coverDest).size / 1024);
        console.log(` ${kb} kB`);
      } catch (err) {
        console.log(` failed: ${err.message}`);
      }
    }
  }

  console.log('\nDone.');
})();
