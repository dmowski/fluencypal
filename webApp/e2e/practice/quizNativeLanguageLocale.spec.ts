import { expect, test } from '@playwright/test';
import { mockExternalIpServices } from '../libs/practice';

test.describe('Quiz native language locale', () => {
  test('Next after Russian goes straight to /ru/quiz teacher selection', async ({ page }) => {
    await mockExternalIpServices(page);

    const seenHrefs: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        seenHrefs.push(frame.url());
      }
    });

    await page.goto('/quiz?nativeLang=ru&currentStep=nativeLanguage');
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextButton).toBeEnabled();

    await nextButton.click();

    await expect(page).toHaveURL((url) => {
      return (
        url.pathname === '/ru/quiz' &&
        url.searchParams.get('nativeLang') === 'ru' &&
        url.searchParams.get('currentStep') === 'teacherSelection'
      );
    });
    await expect(page.getByTestId('quiz-teacher-selection')).toBeVisible();

    const unprefixedTeacherSelection = seenHrefs.filter((href) => {
      const url = new URL(href);
      return (
        url.pathname === '/quiz' && url.searchParams.get('currentStep') === 'teacherSelection'
      );
    });
    expect(unprefixedTeacherSelection).toEqual([]);
  });
});
