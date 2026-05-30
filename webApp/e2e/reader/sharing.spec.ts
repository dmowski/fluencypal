import { expect, test, type Page } from '@playwright/test';
import {
  BOOK_TITLE,
  createEmulatorTestUser,
  EmulatorTestUser,
  mockStorageUploads,
  openSeededGatsbyBook,
  resetEmulatorState,
  shareBookViaUI,
  signInTestUserOnPage,
  waitForBookMissingForUser,
  waitForRemoteBookField,
  waitForRemoteReaderBooksCount,
  waitForSignedIn,
} from '../libs/reader';

const GATSBY_BOOK_ID = 'the-great-gatsby';

const signInOnSeededBook = async (page: Page, user: EmulatorTestUser) => {
  await openSeededGatsbyBook(page);
  await signInTestUserOnPage(page, user);
  await waitForSignedIn(page, user.uid);
  await waitForRemoteReaderBooksCount(user.uid, 1);
};

const goToBooksList = async (page: Page) => {
  await page.getByRole('button', { name: 'Back to books' }).click();
  await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
};

test.describe('Reader book sharing', () => {
  test.beforeEach(async ({ page }) => {
    await resetEmulatorState();
    // Paragraphs blob upload can block push for ~60 s on the Storage emulator.
    // Mock uploads so sharing writes reach Firestore within test timeouts.
    await mockStorageUploads(page);
  });

  test('Share menu item opens share modal for authenticated user', async ({ page }) => {
    test.setTimeout(60_000);
    const userA = await createEmulatorTestUser();
    await signInOnSeededBook(page, userA);
    await goToBooksList(page);
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await expect(page.getByTestId('share-modal-owner-row')).toBeVisible();
  });

  test('sharing with a registered email adds the book to that user', async ({ page }) => {
    test.setTimeout(60_000);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();
    await signInOnSeededBook(page, userA);
    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    await waitForRemoteBookField(
      userA.uid,
      GATSBY_BOOK_ID,
      'memberIds',
      (value) => Array.isArray(value) && value.includes(userB.uid),
      { timeoutMs: 15_000 },
    );
  });

  test('sharing during initial blob upload keeps memberIds on Firestore', async ({ page }) => {
    test.setTimeout(60_000);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();

    await openSeededGatsbyBook(page);
    await signInTestUserOnPage(page, userA);
    await waitForSignedIn(page, userA.uid);

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    const remote = await waitForRemoteBookField(
      userA.uid,
      GATSBY_BOOK_ID,
      'memberIds',
      (value) => Array.isArray(value) && value.includes(userB.uid),
      { timeoutMs: 15_000 },
    );
    expect(remote.userIds).toContain(userB.uid);
  });

  test('sharing with a non-existent email shows invite error', async ({ page }) => {
    test.setTimeout(60_000);
    const userA = await createEmulatorTestUser();
    await signInOnSeededBook(page, userA);
    await goToBooksList(page);

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await page.getByTestId('share-email-input').fill('nobody@no-such-domain-xyz.com');
    await page.getByTestId('share-email-submit').click();
    await expect(page.getByTestId('share-error-message')).toBeVisible({ timeout: 15_000 });
  });

  test('non-owner does not see remove buttons in the share modal', async ({ page, browser }) => {
    test.setTimeout(90_000);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();
    await signInOnSeededBook(page, userA);
    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

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
        timeout: 15_000,
      });

      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Share' }).click();
      await expect(pageB.getByTestId('share-book-modal')).toBeVisible();
      await expect(pageB.getByTestId(`share-modal-remove-${userB.uid}`)).not.toBeVisible();
      await expect(pageB.getByTestId('share-email-input')).not.toBeVisible();
    } finally {
      await contextB.close();
    }
  });

  test('owner can remove a shared user from the book', async ({ page }) => {
    test.setTimeout(60_000);
    const userA = await createEmulatorTestUser();
    const userB = await createEmulatorTestUser();
    await signInOnSeededBook(page, userA);
    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
    await page.getByTestId(`share-modal-remove-${userB.uid}`).click();

    await waitForRemoteBookField(
      userA.uid,
      GATSBY_BOOK_ID,
      'memberIds',
      (value) => Array.isArray(value) && !value.includes(userB.uid),
      { timeoutMs: 15_000 },
    );
    await waitForBookMissingForUser(userB.uid, GATSBY_BOOK_ID, { timeoutMs: 15_000 });
  });
});
