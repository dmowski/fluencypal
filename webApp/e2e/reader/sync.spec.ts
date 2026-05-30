import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  applyYellowHighlight,
  assertHighlightPopoverVisible,
  assertWordHighlightedYellow,
  BOOK_TITLE,
  createEmulatorTestUser,
  EmulatorTestUser,
  mockStorageUploads,
  openSeededGatsbyBook,
  resetEmulatorState,
  selectWheneverWordText,
  signInTestUserOnPage,
  signOutOnPage,
  waitForRemoteBookField,
  waitForRemoteReaderBooksCount,
  waitForSignedIn,
} from '../libs/reader';

const GATSBY_BOOK_ID = 'the-great-gatsby';

const signInOnSeededReader = async (page: Page, user: EmulatorTestUser) => {
  const uid = await signInTestUserOnPage(page, user);
  await waitForSignedIn(page, uid);
  return uid;
};

test.describe('Reader sync against Firebase emulator', () => {
  test.beforeEach(async ({ page }) => {
    await resetEmulatorState();
    await mockStorageUploads(page);
  });

  test('signing in uploads the locally seeded Gatsby book to Firestore', async ({ page }) => {
    test.setTimeout(60_000);

    await openSeededGatsbyBook(page);
    const user = await createEmulatorTestUser();
    await signInOnSeededReader(page, user);

    const remote = await waitForRemoteBookField(
      user.uid,
      GATSBY_BOOK_ID,
      'title',
      (value) => value === BOOK_TITLE,
      { timeoutMs: 15_000 },
    );
    expect(remote.id).toBe(GATSBY_BOOK_ID);
    expect(remote.memberIds).toContain(user.uid);
  });

  test('creating a highlight pushes the highlight payload to Firestore', async ({ page }) => {
    test.setTimeout(60_000);

    await openSeededGatsbyBook(page);
    const user = await createEmulatorTestUser();
    await signInOnSeededReader(page, user);

    await waitForRemoteReaderBooksCount(user.uid, 1);

    await selectWheneverWordText(page);
    await assertHighlightPopoverVisible(page);
    await applyYellowHighlight(page);

    // First wait for local UI confirmation before asserting remote sync.
    await assertWordHighlightedYellow(page, /whenever/i);

    const updated = await waitForRemoteBookField(
      user.uid,
      GATSBY_BOOK_ID,
      'highlights',
      (value) => Array.isArray(value) && value.length >= 1,
      { timeoutMs: 15_000 },
    );

    const highlights = updated.highlights as Array<{ color?: string }>;
    expect(typeof highlights[0]?.color).toBe('string');
    expect((highlights[0]?.color ?? '').length).toBeGreaterThan(0);
  });

  test('deleting a book locally removes the matching Firestore document', async ({ page }) => {
    test.setTimeout(60_000);

    await openSeededGatsbyBook(page);
    const user = await createEmulatorTestUser();
    await signInOnSeededReader(page, user);

    await waitForRemoteReaderBooksCount(user.uid, 1);

    // Navigate back to the books list using the in-reader close button so the
    // page does NOT fully reload (a full reload via page.goto would re-run
    // addInitScript, wiping localStorage and logging the user out).
    await page.getByRole('button', { name: 'Back to books' }).click();
    const gatsbyHeading = page.getByRole('heading', { name: BOOK_TITLE, level: 4 });
    await expect(gatsbyHeading).toBeVisible();

    // Open the book's options menu, then click Delete and accept the confirm dialog.
    await page.getByRole('button', { name: 'Book options' }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    await waitForRemoteReaderBooksCount(user.uid, 0);
  });

  test('a second browser context signed in as the same user sees the synced book', async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    let contextB: BrowserContext | null = null;
    try {
      await openSeededGatsbyBook(pageA);
      const user = await createEmulatorTestUser();
      await signInOnSeededReader(pageA, user);
      await waitForRemoteReaderBooksCount(user.uid, 1);

      contextB = await browser.newContext();
      const pageB = await contextB.newPage();

      // Clean local IndexedDB on B so the book can only arrive via remote sync.
      await pageB.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
        if (typeof indexedDB !== 'undefined') {
          indexedDB.deleteDatabase('readerBooksDb');
        }
      });
      await pageB.goto('/book');
      await signInOnSeededReader(pageB, user);

      const gatsbyOnB = pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 });
      await expect(gatsbyOnB).toBeVisible();
    } finally {
      await signOutOnPage(pageA).catch(() => undefined);
      await contextA.close();
      if (contextB) await contextB.close();
    }
  });
});
