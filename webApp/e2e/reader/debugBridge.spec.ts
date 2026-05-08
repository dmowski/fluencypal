import { expect, test } from '@playwright/test';
import { openSeededGatsbyBook } from '../libs/books/navigation';

/**
 * Verifies the `window.__reader__` debug bridge is installed and exposes the
 * documented snapshot/invariant API to Playwright. Acts as a lightweight smoke
 * test alongside the DOM-level invariants spec.
 */
test.describe('reader debug bridge (__reader__)', () => {
  test('exposes paragraph snapshots and invariant reports via window.__reader__', async ({
    page,
  }) => {
    await openSeededGatsbyBook(page);

    const bridgeAvailable = await page.evaluate(() => typeof window.__reader__ === 'object');
    expect(bridgeAvailable).toBe(true);

    const snapshots = await page.evaluate(() => window.__reader__?.dumpAllParagraphs() ?? []);
    expect(snapshots.length).toBeGreaterThan(0);

    snapshots.forEach((snapshot) => {
      expect(snapshot.tokenCount).toBeGreaterThan(0);
      expect(snapshot.sourceTextLength).toBeGreaterThan(0);
      expect(snapshot.tokenMapViolation).toBeNull();
      // data-char-offset values must be unique and strictly monotonic per paragraph.
      const sorted = [...snapshot.charOffsets].sort((a, b) => a - b);
      const unique = Array.from(new Set(snapshot.charOffsets));
      expect(unique.length).toBe(snapshot.charOffsets.length);
      expect(snapshot.charOffsets).toEqual(sorted);
    });

    const firstSnapshot = await page.evaluate(
      () => window.__reader__?.dumpParagraphTokenMap(0) ?? null,
    );
    expect(firstSnapshot).not.toBeNull();
    expect(firstSnapshot?.paragraphIndex).toBe(0);

    const violations = await page.evaluate(() => window.__reader__?.assertInvariants() ?? []);
    expect(violations).toEqual([]);
  });
});
