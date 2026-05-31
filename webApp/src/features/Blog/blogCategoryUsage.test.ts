import { categoryInUseErrorMessage } from './blogCategoryUsage';

describe('categoryInUseErrorMessage', () => {
  it('uses singular wording for one post', () => {
    expect(categoryInUseErrorMessage(['blog-1'])).toBe(
      'Category is in use by 1 other post. Remove the category from that post first.',
    );
  });

  it('uses plural wording for multiple posts', () => {
    expect(categoryInUseErrorMessage(['blog-1', 'blog-2'])).toBe(
      'Category is in use by 2 other posts. Remove the category from those posts first.',
    );
  });
});
