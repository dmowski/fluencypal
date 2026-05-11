import { expect, test } from '@playwright/test';
import {
  BOOK_TITLE,
  createEmulatorTestUser,
  openSeededGatsbyBook,
  resetEmulatorState,
  signInTestUserOnPage,
  waitForRemoteBookField,
  waitForRemoteReaderBooksCount,
  waitForSignedIn,
} from '../libs/reader';

const GATSBY_BOOK_ID = 'the-great-gatsby';

test.describe('Reader book sharing', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('Share menu item opens share modal for authenticated user', async ({ page }) => {
    test.setTimeout(60_000);

    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);

    await waitForRemoteReaderBooksCount(userA.uid, 1);

    // Navigate back to the books list
    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

    // Open book menu and click Share
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();

    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await expect(page.getByTestId('share-modal-owner-row')).toBeVisible();
  });

  test('sharing with a registered email adds the book to that user', async ({ page }) => {
    test.setTimeout(90_000);

    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1);

    // Navigate back to books list
    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

    // Open share modal
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();

    // Enter user B's email and submit
    await page.getByTestId('share-email-input').fill(userB.email);
    await page.getByTestId('share-email-submit').click();

    // Assert success message
    await expect(page.getByTestId('share-success-message')).toBeVisible({ timeout: 20_000 });

    // Verify userB.uid appears in userIds on the remote Firestore doc
    await waitForRemoteBookField(
      userA.uid,
      GATSBY_BOOK_ID,
      'userIds',
      (value) => Array.isArray(value) && value.includes(userB.uid),
      { timeoutMs: 20_000 },
    );

    // Verify user B can now see the book via their own memberIds subscription
    await waitForRemoteReaderBooksCount(userB.uid, 1, { timeoutMs: 20_000 });
  });

  test('sharing with a non-existent email shows invite error', async ({ page }) => {
    test.setTimeout(60_000);

    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1);

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();

    await page.getByTestId('share-email-input').fill('nobody@no-such-domain-xyz.com');
    await page.getByTestId('share-email-submit').click();

    await expect(page.getByTestId('share-error-message')).toBeVisible({ timeout: 15_000 });
  });

  test('non-owner does not see remove buttons in the share modal', async ({ page, browser }) => {
    test.setTimeout(90_000);

    // Set up: user A owns the book and shares it with user B
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1);

    // Share with user B via the modal
    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await page.getByTestId('share-email-input').fill(userB.email);
    await page.getByTestId('share-email-submit').click();
    await expect(page.getByTestId('share-success-message')).toBeVisible({ timeout: 20_000 });

    // Wait for userB to appear in Firestore
    await waitForRemoteReaderBooksCount(userB.uid, 1, { timeoutMs: 20_000 });

    // Now open a fresh context as user B and verify no remove buttons
    const contextB = await browser.newContext();
    try {
      const pageB = await contextB.newPage();
      await pageB.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
        if (typeof indexedDB !== 'undefined') {
          indexedDB.deleteDatabase('readerBooksDb');
        }
      });
      await pageB.goto('/book');
      await signInTestUserOnPage(pageB, userB);
      await waitForSignedIn(pageB, userB.uid);

      // Wait for the shared book to appear
      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible({
        timeout: 25_000,
      });

      // Open the share modal as user B
      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Share' }).click();
      await expect(pageB.getByTestId('share-book-modal')).toBeVisible();

      // Remove button for user B's own uid should NOT exist (non-owner)
      await expect(pageB.getByTestId(`share-modal-remove-${userB.uid}`)).not.toBeVisible();
      // Email input for adding new users should NOT exist (non-owner)
      await expect(pageB.getByTestId('share-email-input')).not.toBeVisible();
    } finally {
      await contextB.close();
    }
  });

  test('owner can remove a shared user from the book', async ({ page }) => {
    test.setTimeout(90_000);

    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1);

    // Share with user B
    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await page.getByTestId('share-email-input').fill(userB.email);
    await page.getByTestId('share-email-submit').click();
    await expect(page.getByTestId('share-success-message')).toBeVisible({ timeout: 20_000 });
    await waitForRemoteReaderBooksCount(userB.uid, 1, { timeoutMs: 20_000 });

    // Remove user B via the remove button
    await page.getByTestId(`share-modal-remove-${userB.uid}`).click();

    // Verify userIds is empty in Firestore
    await waitForRemoteBookField(
      userA.uid,
      GATSBY_BOOK_ID,
      'userIds',
      (value) => Array.isArray(value) && !value.includes(userB.uid),
      { timeoutMs: 20_000 },
    );

    // Verify user B can no longer see the book
    await waitForRemoteReaderBooksCount(userB.uid, 0, { timeoutMs: 20_000 });
  });
});
