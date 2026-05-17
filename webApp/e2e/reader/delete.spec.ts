import { expect, test } from '@playwright/test';
import {
  BOOK_TITLE,
  createEmulatorTestUser,
  openSeededGatsbyBook,
  resetEmulatorState,
  shareBookViaUI,
  signInTestUserOnPage,
  waitForBookMissingForUser,
  waitForBookPresentForUser,
  waitForRemoteBookField,
  waitForRemoteReaderBooksCount,
  waitForSignedIn,
} from '../libs/reader';

const GATSBY_BOOK_ID = 'the-great-gatsby';

test.describe('Reader book deletion', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  // ------------------------------------------------------------------ //
  // SOLO OWNER                                                           //
  // ------------------------------------------------------------------ //

  test('solo owner deletes book with native confirm', async ({ page }) => {
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    // Navigate to books list
    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

    // Accept the native confirm dialog
    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Book card should be gone
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible({
      timeout: 10_000,
    });

    // Firestore doc should be removed
    await waitForRemoteReaderBooksCount(userA.uid, 0, { timeoutMs: 20_000 });
  });

  // ------------------------------------------------------------------ //
  // NON-OWNER                                                            //
  // ------------------------------------------------------------------ //

  test('non-owner sees "leave" modal and can leave the book', async ({ page, browser }) => {
    // Set up: userA owns the book, shares it with userB
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);
    await waitForBookPresentForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 20_000 });

    // Open a fresh context as userB
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

      // Open delete menu — non-owner should see the "leave" modal, not native confirm
      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Delete' }).click();

      await expect(pageB.getByTestId('delete-book-modal')).toBeVisible();
      await expect(pageB.getByTestId('delete-modal-leave-btn')).toBeVisible();
      // Should NOT see "Delete for all"
      await expect(pageB.getByTestId('delete-modal-delete-for-all-btn')).not.toBeVisible();

      // Click "Leave book"
      await pageB.getByTestId('delete-modal-leave-btn').click();

      // Wait for Firestore to reflect userB's departure (context still open so the
      // direct updateDoc can complete and the subscription can confirm removal).
      await waitForBookMissingForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 30_000 });

      // Book card should also be gone from userB's UI (onSnapshot fires → removeBookLocally)
      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await contextB.close();
    }

    // The book should still exist for userA
    await waitForBookPresentForUser(userA.uid, GATSBY_BOOK_ID, { timeoutMs: 20_000 });
  });

  // ------------------------------------------------------------------ //
  // OWNER WITH COLLABORATORS                                             //
  // ------------------------------------------------------------------ //

  test('owner with collaborators sees custom delete modal', async ({ page }) => {
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);

    // Now open delete menu — owner with collaborator should see custom modal
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    await expect(page.getByTestId('delete-book-modal')).toBeVisible();
    await expect(page.getByTestId('delete-modal-delete-for-all-btn')).toBeVisible();
    await expect(page.getByTestId('delete-modal-open-sharing-btn')).toBeVisible();
    // Should NOT see "Leave book" (that's for non-owners)
    await expect(page.getByTestId('delete-modal-leave-btn')).not.toBeVisible();
  });

  test('owner clicks "Delete for all" removes book for everyone', async ({ page, browser }) => {
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);
    await waitForBookPresentForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 20_000 });

    // Owner opens delete menu → custom modal → "Delete for all"
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByTestId('delete-book-modal')).toBeVisible();
    await page.getByTestId('delete-modal-delete-for-all-btn').click();

    // Book should disappear from userA's UI
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible({
      timeout: 15_000,
    });

    // Firestore doc should be gone for both users
    await waitForRemoteReaderBooksCount(userA.uid, 0, { timeoutMs: 20_000 });
    await waitForBookMissingForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 20_000 });
  });

  test('"Open sharing settings" from delete modal transitions to share modal', async ({ page }) => {
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);

    // Open delete modal
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByTestId('delete-book-modal')).toBeVisible();

    // Click "Open sharing settings"
    await page.getByTestId('delete-modal-open-sharing-btn').click();

    // Delete modal should close, share modal should open
    await expect(page.getByTestId('delete-book-modal')).not.toBeVisible();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
  });

  // ------------------------------------------------------------------ //
  // REASSIGN OWNER                                                       //
  // ------------------------------------------------------------------ //

  test('owner can reassign ownership to a collaborator', async ({ page, browser }) => {
    await openSeededGatsbyBook(page);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);
    await waitForRemoteReaderBooksCount(userA.uid, 1, { timeoutMs: 20_000 });

    await page.getByRole('button', { name: 'Back to books' }).click();
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);
    await waitForBookPresentForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 20_000 });

    // Open share modal and reassign ownership to userB
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();

    // Click "Make owner" for userB
    await page.getByTestId(`share-modal-make-owner-${userB.uid}`).click();

    // Share modal should close automatically
    await expect(page.getByTestId('share-book-modal')).not.toBeVisible({ timeout: 5_000 });

    // Firestore should reflect the new ownerUserId = userB
    await waitForRemoteBookField(
      userB.uid,
      GATSBY_BOOK_ID,
      'ownerUserId',
      (value) => value === userB.uid,
      { timeoutMs: 20_000 },
    );

    // userA should now be in userIds (was promoted to collaborator)
    await waitForRemoteBookField(
      userB.uid,
      GATSBY_BOOK_ID,
      'userIds',
      (value) => Array.isArray(value) && value.includes(userA.uid),
      { timeoutMs: 20_000 },
    );

    // Verify: userB (new owner) sees "Delete for all" modal when they try to delete
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

      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible({
        timeout: 25_000,
      });

      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Delete' }).click();

      // New owner (userB) should see the owner-shared delete modal
      await expect(pageB.getByTestId('delete-book-modal')).toBeVisible();
      await expect(pageB.getByTestId('delete-modal-delete-for-all-btn')).toBeVisible();
    } finally {
      await contextB.close();
    }
  });
});
