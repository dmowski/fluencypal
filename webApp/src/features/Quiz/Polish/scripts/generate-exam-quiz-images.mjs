#!/usr/bin/env node
/**
 * Generate B1 exam speaking photos with OpenAI and save to public/examQuiz/.
 *
 * Usage (from webApp/):
 *   pnpm generate:exam-quiz-images
 *   pnpm generate:exam-quiz-images -- --force
 *   pnpm generate:exam-quiz-images -- --id park
 *   pnpm generate:exam-quiz-images -- --concurrency 5
 *
 * Defaults: model gpt-image-2, quality high, concurrency 5 (parallel).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import OpenAI from 'openai';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webAppRoot = path.resolve(__dirname, '../../../../..');
const publicDir = path.join(webAppRoot, 'public', 'examQuiz');
const manifestPath = path.join(__dirname, '../speaking/examQuiz-manifest.json');
const catalogPath = path.join(__dirname, '../speaking/examQuizImageCatalog.ts');

const DEFAULT_MODEL = 'gpt-image-2';
const DEFAULT_QUALITY = 'high';
const DEFAULT_SIZE = '1024x1024';
const DEFAULT_CONCURRENCY = 5;

const args = process.argv.slice(2);
const force = args.includes('--force');
const idFilter =
  args.find((arg) => arg.startsWith('--id='))?.slice(5) ??
  (args.includes('--id') ? args[args.indexOf('--id') + 1] : null);
const model =
  args.find((arg) => arg.startsWith('--model='))?.slice(8) ??
  process.env.OPENAI_EXAM_IMAGE_MODEL ??
  DEFAULT_MODEL;
const quality =
  args.find((arg) => arg.startsWith('--quality='))?.slice(10) ??
  process.env.OPENAI_EXAM_IMAGE_QUALITY ??
  DEFAULT_QUALITY;
const concurrency = Number(
  args.find((arg) => arg.startsWith('--concurrency='))?.slice(14) ??
    process.env.EXAM_QUIZ_IMAGE_CONCURRENCY ??
    DEFAULT_CONCURRENCY,
);

if (!Number.isFinite(concurrency) || concurrency < 1) {
  throw new Error(`Invalid concurrency: ${concurrency}`);
}

const loadCatalog = async () => {
  const catalogUrl = pathToFileURL(catalogPath).href;
  const mod = await import(catalogUrl);
  return mod.EXAM_QUIZ_IMAGE_SPECS;
};

const describeImageBase64 = async (client, base64Png) => {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You analyze photographs for language-learning activities. Describe what is objectively visible in 4–6 English sentences. Include main subjects, setting, actions, and objects. Do not identify real people by name.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What does this image show? Be factual and specific.' },
          {
            type: 'image_url',
            image_url: { url: `data:image/png;base64,${base64Png}` },
          },
        ],
      },
    ],
  });

  const description = completion.choices[0]?.message?.content?.trim() ?? '';
  if (!description) throw new Error('Empty vision description');
  return description;
};

const optimizeToWebp = async (pngBuffer) =>
  sharp(pngBuffer)
    .rotate()
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

const runPool = async (items, worker, limit) => {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker()),
  );

  return results;
};

const generateOne = async (client, spec) => {
  const outputPath = path.join(publicDir, spec.fileName);
  console.log(`generate ${spec.id} → ${spec.fileName} (${model}, ${quality})`);

  const result = await client.images.generate({
    model,
    prompt: spec.generationPrompt,
    size: DEFAULT_SIZE,
    quality,
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image data for ${spec.id}`);

  const pngBuffer = Buffer.from(b64, 'base64');
  const webpBuffer = await optimizeToWebp(pngBuffer);
  await fs.writeFile(outputPath, webpBuffer);

  const description = await describeImageBase64(client, b64);
  console.log(
    `  done ${spec.id}: ${(webpBuffer.length / 1024).toFixed(0)} KB, described (${description.length} chars)`,
  );

  return {
    id: spec.id,
    fileName: spec.fileName,
    url: `/examQuiz/${spec.fileName}`,
    description,
  };
};

const main = async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set (use --env-file=.env.tool)');
  }

  const client = new OpenAI({ apiKey });
  const specs = await loadCatalog();
  const selected = idFilter ? specs.filter((spec) => spec.id === idFilter) : specs;

  if (selected.length === 0) {
    throw new Error(idFilter ? `Unknown image id: ${idFilter}` : 'No image specs found');
  }

  await fs.mkdir(publicDir, { recursive: true });

  let manifest = { images: [] };
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    // fresh manifest
  }

  const manifestById = new Map(manifest.images.map((entry) => [entry.id, entry]));

  const pending = [];
  for (const spec of selected) {
    const outputPath = path.join(publicDir, spec.fileName);
    const exists = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);

    if (exists && !force && manifestById.has(spec.id)) {
      console.log(`skip ${spec.id} (${spec.fileName}) — already generated`);
      continue;
    }

    pending.push(spec);
  }

  if (pending.length === 0) {
    console.log('nothing to generate');
    return;
  }

  console.log(
    `generating ${pending.length} image(s) with concurrency ${concurrency} (${model}, quality=${quality})`,
  );

  const generated = await runPool(
    pending,
    (spec) => generateOne(client, spec),
    concurrency,
  );

  for (const entry of generated) {
    manifestById.set(entry.id, entry);
  }

  manifest.images = specs.map((spec) => manifestById.get(spec.id)).filter(Boolean);

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(
    `manifest → ${path.relative(webAppRoot, manifestPath)} (${manifest.images.length} images)`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
