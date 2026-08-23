import { applyLocalizedPatch, makeEmptyDraft } from './useBlogDraft';

describe('makeEmptyDraft', () => {
  it('starts with one empty author row', () => {
    expect(makeEmptyDraft().authors).toEqual([{ role: 'author', name: '', note: '' }]);
  });
});

describe('applyLocalizedPatch', () => {
  it('keeps translations from earlier languages when merging a new one', () => {
    const draft = makeEmptyDraft();
    draft.title.en = 'Hello';

    const afterFr = applyLocalizedPatch(draft, {
      title: { ...draft.title, fr: 'Bonjour' },
      subTitle: draft.subTitle,
      content: draft.content,
      keywords: draft.keywords,
    });

    const afterEs = applyLocalizedPatch(afterFr, {
      title: { ...afterFr.title, es: 'Hola' },
      subTitle: afterFr.subTitle,
      content: afterFr.content,
      keywords: afterFr.keywords,
    });

    expect(afterEs.title.fr).toBe('Bonjour');
    expect(afterEs.title.es).toBe('Hola');
  });

  it('documents the old bug: re-translating from the English-only draft drops prior langs', () => {
    const draft = makeEmptyDraft();
    draft.title.en = 'Hello';

    const frPatch = {
      title: { ...draft.title, fr: 'Bonjour' },
      subTitle: draft.subTitle,
      content: draft.content,
      keywords: draft.keywords,
    };
    let updated = { ...draft, ...frPatch };

    const esPatch = {
      title: { ...draft.title, es: 'Hola' },
      subTitle: draft.subTitle,
      content: draft.content,
      keywords: draft.keywords,
    };
    updated = { ...updated, ...esPatch };

    expect(updated.title.fr).toBe('');
    expect(updated.title.es).toBe('Hola');
  });
});
