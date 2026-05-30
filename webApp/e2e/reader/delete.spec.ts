import { expect, test, type Page } from '@playwright/test';
import {
  BOOK_TITLE,
  createEmulatorTestUser,
  mockStorageUploads,
  openFreshReaderPageForUser,
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

const signInOwnerWithSeededBook = async (page: Page) => {
  await openSeededGatsbyBook(page);
  const user = await createEmulatorTestUser();
  await signInTestUserOnPage(page, user);
  await waitForSignedIn(page, user.uid);
  await waitForRemoteReaderBooksCount(user.uid, 1);
  return user;
};

const goToBooksList = async (page: Page) => {
  await page.getByRole('button', { name: 'Back to books' }).click();
  await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();
};

test.describe('Reader book deletion', () => {
  test.beforeEach(async ({ page }) => {
    await resetEmulatorState();
    await mockStorageUploads(page);
  });

  // ------------------------------------------------------------------ //
  // SOLO OWNER                                                           //
  // ------------------------------------------------------------------ //

  test('solo owner deletes book with native confirm', async ({ page }) => {
    const userA = await signInOwnerWithSeededBook(page);

    await goToBooksList(page);

    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    await waitForRemoteReaderBooksCount(userA.uid, 0);
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible();
  });

  // ------------------------------------------------------------------ //
  // NON-OWNER                                                            //
  // ------------------------------------------------------------------ //

  test('non-owner sees "leave" modal and can leave the book', async ({ page, browser }) => {
    test.setTimeout(90_000);

    const userA = await signInOwnerWithSeededBook(page);
    const userB = await createEmulatorTestUser();

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    const { context: contextB, page: pageB } = await openFreshReaderPageForUser(browser, userB);
    try {
      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Delete' }).click();

      await expect(pageB.getByTestId('delete-book-modal')).toBeVisible();
      await expect(pageB.getByTestId('delete-modal-leave-btn')).toBeVisible();
      await expect(pageB.getByTestId('delete-modal-delete-for-all-btn')).not.toBeVisible();

      await pageB.getByTestId('delete-modal-leave-btn').click();

      await waitForBookMissingForUser(userB.uid, GATSBY_BOOK_ID);
      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible();
    } finally {
      await contextB.close();
    }

    await waitForRemoteReaderBooksCount(userA.uid, 1);
  });

  // ------------------------------------------------------------------ //
  // OWNER WITH COLLABORATORS                                             //
  // ------------------------------------------------------------------ //

  test('owner with collaborators sees custom delete modal', async ({ page }) => {
    const userA = await signInOwnerWithSeededBook(page);
    const userB = await createEmulatorTestUser();

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    await expect(page.getByTestId('delete-book-modal')).toBeVisible();
    await expect(page.getByTestId('delete-modal-delete-for-all-btn')).toBeVisible();
    await expect(page.getByTestId('delete-modal-open-sharing-btn')).toBeVisible();
    await expect(page.getByTestId('delete-modal-leave-btn')).not.toBeVisible();
  });

  test('owner clicks "Delete for all" removes book for everyone', async ({ page }) => {
    test.setTimeout(90_000);

    const userA = await signInOwnerWithSeededBook(page);
    const userB = await createEmulatorTestUser();

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByTestId('delete-book-modal')).toBeVisible();
    await page.getByTestId('delete-modal-delete-for-all-btn').click();

    await waitForRemoteReaderBooksCount(userA.uid, 0);
    await waitForBookMissingForUser(userB.uid, GATSBY_BOOK_ID);
    await expect(page.getByRole('heading', { name: BOOK_TITLE, level: 4 })).not.toBeVisible();
  });

  test('"Open sharing settings" from delete modal transitions to share modal', async ({ page }) => {
    const userA = await signInOwnerWithSeededBook(page);
    const userB = await createEmulatorTestUser();

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email);

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByTestId('delete-book-modal')).toBeVisible();

    await page.getByTestId('delete-modal-open-sharing-btn').click();

    await expect(page.getByTestId('delete-book-modal')).not.toBeVisible();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();
  });

  // ------------------------------------------------------------------ //
  // REASSIGN OWNER                                                       //
  // ------------------------------------------------------------------ //

  test('owner can reassign ownership to a collaborator', async ({ page, browser }) => {
    test.setTimeout(90_000);

    const userA = await signInOwnerWithSeededBook(page);
    const userB = await createEmulatorTestUser();

    await goToBooksList(page);
    await shareBookViaUI(page, GATSBY_BOOK_ID, userB.email, { sharedUserUid: userB.uid });

    await page.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
    await page.getByRole('menuitem', { name: 'Share' }).click();
    await expect(page.getByTestId('share-book-modal')).toBeVisible();

    await page.getByTestId(`share-modal-make-owner-${userB.uid}`).click();

    await expect(page.getByTestId('share-book-modal')).not.toBeVisible();

    await waitForRemoteBookField(
      userB.uid,
      GATSBY_BOOK_ID,
      'ownerUserId',
      (value) => value === userB.uid,
    );
    await waitForRemoteBookField(
      userB.uid,
      GATSBY_BOOK_ID,
      'userIds',
      (value) => Array.isArray(value) && value.includes(userA.uid),
    );

    const { context: contextB, page: pageB } = await openFreshReaderPageForUser(browser, userB);
    try {
      await expect(pageB.getByRole('heading', { name: BOOK_TITLE, level: 4 })).toBeVisible();

      await pageB.getByTestId(`book-menu-${GATSBY_BOOK_ID}`).click();
      await pageB.getByRole('menuitem', { name: 'Delete' }).click();

      await expect(pageB.getByTestId('delete-book-modal')).toBeVisible();
      await expect(pageB.getByTestId('delete-modal-delete-for-all-btn')).toBeVisible();
    } finally {
      await contextB.close();
    }
  });
});
