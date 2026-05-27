import { isHostedNewsImageUrl, needsNewsImageUpload } from './newsImageUrl';

describe('isHostedNewsImageUrl', () => {
  it('recognizes Firebase / GCS bucket URLs', () => {
    expect(
      isHostedNewsImageUrl(
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/newsImages%2Fabc.jpg',
      ),
    ).toBe(true);
    expect(
      isHostedNewsImageUrl('https://firebasestorage.googleapis.com/v0/b/dark-lang/o/newsImages%2Fabc.jpg'),
    ).toBe(true);
    expect(
      isHostedNewsImageUrl('http://localhost:9199/dark-lang.firebasestorage.app/newsImages%2Fabc.jpg'),
    ).toBe(true);
  });

  it('rejects third-party hosts', () => {
    expect(isHostedNewsImageUrl('https://v.wpimg.pl/example.jpg')).toBe(false);
    expect(isHostedNewsImageUrl('https://images.unsplash.com/photo.jpg')).toBe(false);
  });
});

describe('needsNewsImageUpload', () => {
  it('requires upload when only a source URL is present', () => {
    expect(
      needsNewsImageUpload({
        imageUrl: '',
        sourceImageUrl: 'https://v.wpimg.pl/example.jpg',
      }),
    ).toBe(true);
  });

  it('requires upload when imageUrl still points at the publisher', () => {
    expect(
      needsNewsImageUpload({
        imageUrl: 'https://v.wpimg.pl/example.jpg',
        sourceImageUrl: 'https://v.wpimg.pl/example.jpg',
      }),
    ).toBe(true);
  });

  it('skips upload when imageUrl is already hosted', () => {
    expect(
      needsNewsImageUpload({
        imageUrl: 'https://storage.googleapis.com/dark-lang.firebasestorage.app/newsImages%2Fabc.jpg',
        sourceImageUrl: 'https://v.wpimg.pl/example.jpg',
      }),
    ).toBe(false);
  });
});
