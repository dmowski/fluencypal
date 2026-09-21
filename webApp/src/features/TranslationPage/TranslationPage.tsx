'use client';

import { useLingui } from '@lingui/react';
import { Link, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useAuth } from '@/features/Auth/useAuth';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { TopOffset } from '@/features/Layout/TopOffset';
import { getTranslation } from '@/features/Translation/translationHelpers';
import { useDocumentTitle } from '@/libs/useDocumentTitle';
import { NativeLangCode } from '@/libs/language/type';
import { buildAutoSpeechQueue } from './buildAutoSpeechQueue';
import {
  MAX_TRANSLATION_LANGUAGES,
  MIN_TRANSLATION_LANGUAGES,
  TRANSLATION_DEBOUNCE_MS,
} from './constants';
import { generateUsageExamples } from './generateUsageExamples';
import { resolvePasteTargetLanguage, shouldInterceptDocumentPaste } from './resolvePasteTarget';
import { TranslationColumn } from './TranslationColumn';
import { TranslationSettingsBar } from './TranslationSettingsBar';
import { TranslationTexts, UsageExamplesState } from './types';
import { useTranslationPageSettings } from './useTranslationPageSettings';
import { useTranslationSpeech } from './useTranslationSpeech';

const emptyTextsFor = (languages: NativeLangCode[]): TranslationTexts => {
  return Object.fromEntries(languages.map((language) => [language, '']));
};

export const TranslationPage = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const textAi = useTextAi();
  const speech = useTranslationSpeech();
  const {
    settings,
    setLanguages,
    setVoiceOverEnabled,
    setAutoPronounceSource,
    setAutoPronounceResult,
  } = useTranslationPageSettings();

  useDocumentTitle(i18n._('Translate'));

  const [texts, setTexts] = useState<TranslationTexts>(() => emptyTextsFor(settings.languages));
  const [examplesByLanguage, setExamplesByLanguage] = useState<
    Partial<Record<NativeLangCode, UsageExamplesState>>
  >({});
  const [translatingFrom, setTranslatingFrom] = useState<NativeLangCode | null>(null);
  const [focusedLanguage, setFocusedLanguage] = useState<NativeLangCode | null>(null);
  const [hoveredLanguage, setHoveredLanguage] = useState<NativeLangCode | null>(null);

  const focusedLanguageRef = useRef<NativeLangCode | null>(null);
  const hoveredLanguageRef = useRef<NativeLangCode | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const translationGenerationRef = useRef(0);
  const settingsRef = useRef(settings);
  const textsRef = useRef(texts);
  const speechRef = useRef(speech);

  settingsRef.current = settings;
  textsRef.current = texts;
  speechRef.current = speech;
  focusedLanguageRef.current = focusedLanguage;
  hoveredLanguageRef.current = hoveredLanguage;

  const clearDebounce = () => {
    if (debounceTimeoutRef.current !== null) {
      window.clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  };

  const translateFrom = async (
    sourceLanguage: NativeLangCode,
    sourceText: string,
    fromPaste: boolean,
  ) => {
    const currentSettings = settingsRef.current;
    const targets = currentSettings.languages.filter((language) => language !== sourceLanguage);
    const generation = translationGenerationRef.current + 1;
    translationGenerationRef.current = generation;

    if (!sourceText.trim()) {
      setTexts((current) => {
        const next = { ...current, [sourceLanguage]: sourceText };
        for (const language of targets) {
          next[language] = '';
        }
        return next;
      });
      setTranslatingFrom(null);
      return;
    }

    setTranslatingFrom(sourceLanguage);
    const results = await Promise.all(
      targets.map(async (targetLanguage) => ({
        targetLanguage,
        translated: await getTranslation({
          text: sourceText,
          sourceLanguage,
          targetLanguage,
        }),
      })),
    );

    if (generation !== translationGenerationRef.current) {
      return;
    }

    const nextTexts: TranslationTexts = {
      ...textsRef.current,
      [sourceLanguage]: sourceText,
    };
    for (const result of results) {
      nextTexts[result.targetLanguage] = result.translated;
    }

    setTexts(nextTexts);
    setTranslatingFrom(null);

    if (fromPaste) {
      speechRef.current.play(
        buildAutoSpeechQueue({
          sourceLanguage,
          texts: nextTexts,
          settings: currentSettings,
        }),
      );
    }
  };

  const applySourceText = (
    sourceLanguage: NativeLangCode,
    sourceText: string,
    options: { fromPaste: boolean; immediate: boolean },
  ) => {
    setTexts((current) => ({ ...current, [sourceLanguage]: sourceText }));
    setExamplesByLanguage({});
    clearDebounce();

    if (options.immediate) {
      void translateFrom(sourceLanguage, sourceText, options.fromPaste);
      return;
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      void translateFrom(sourceLanguage, sourceText, false);
    }, TRANSLATION_DEBOUNCE_MS);
  };

  const applyPastedText = (sourceLanguage: NativeLangCode, pastedText: string) => {
    applySourceText(sourceLanguage, pastedText, { fromPaste: true, immediate: true });
  };

  const applyPastedTextRef = useRef(applyPastedText);
  applyPastedTextRef.current = applyPastedText;

  useEffect(() => {
    const onDocumentPaste = (event: ClipboardEvent) => {
      if (!shouldInterceptDocumentPaste(event.target)) {
        return;
      }

      const pastedText = event.clipboardData?.getData('text/plain');
      if (!pastedText) {
        return;
      }

      const targetLanguage = resolvePasteTargetLanguage({
        focusedLanguage: focusedLanguageRef.current,
        hoveredLanguage: hoveredLanguageRef.current,
        languages: settingsRef.current.languages,
      });
      if (!targetLanguage) {
        return;
      }

      event.preventDefault();
      applyPastedTextRef.current(targetLanguage, pastedText);
    };

    window.addEventListener('paste', onDocumentPaste);
    return () => {
      window.removeEventListener('paste', onDocumentPaste);
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleAddLanguage = (language: NativeLangCode) => {
    if (
      settings.languages.includes(language) ||
      settings.languages.length >= MAX_TRANSLATION_LANGUAGES
    ) {
      return;
    }

    const nextLanguages = [...settings.languages, language];
    setLanguages(nextLanguages);
    setTexts((current) => ({ ...current, [language]: '' }));

    const sourceLanguage = nextLanguages.find((item) => (texts[item] || '').trim()) || null;
    if (sourceLanguage) {
      void translateFrom(sourceLanguage, texts[sourceLanguage] || '', false);
    }
  };

  const handleRemoveLanguage = (language: NativeLangCode) => {
    if (settings.languages.length <= MIN_TRANSLATION_LANGUAGES) {
      return;
    }

    const nextLanguages = settings.languages.filter((item) => item !== language);
    setLanguages(nextLanguages);
    setTexts((current) => {
      const next = { ...current };
      delete next[language];
      return next;
    });
    setExamplesByLanguage((current) => {
      const next = { ...current };
      delete next[language];
      return next;
    });
    if (focusedLanguage === language) {
      setFocusedLanguage(null);
    }
    if (hoveredLanguage === language) {
      setHoveredLanguage(null);
    }
  };

  const handleChangeLanguage = (previousLanguage: NativeLangCode, nextLanguage: NativeLangCode) => {
    if (previousLanguage === nextLanguage || settings.languages.includes(nextLanguage)) {
      return;
    }

    const nextLanguages = settings.languages.map((item) =>
      item === previousLanguage ? nextLanguage : item,
    );
    setLanguages(nextLanguages);
    setTexts((current) => {
      const next = { ...current, [nextLanguage]: current[previousLanguage] || '' };
      delete next[previousLanguage];
      return next;
    });
    setExamplesByLanguage((current) => {
      const next = { ...current };
      if (current[previousLanguage]) {
        next[nextLanguage] = current[previousLanguage];
      }
      delete next[previousLanguage];
      return next;
    });
    if (focusedLanguage === previousLanguage) {
      setFocusedLanguage(nextLanguage);
    }
    if (hoveredLanguage === previousLanguage) {
      setHoveredLanguage(nextLanguage);
    }
  };

  const handleGiveExamples = async (language: NativeLangCode) => {
    const text = texts[language]?.trim() || '';
    if (!text) {
      return;
    }

    if (auth.loading) {
      return;
    }

    if (!auth.isAuthorized) {
      setExamplesByLanguage((current) => ({
        ...current,
        [language]: {
          loading: false,
          error: i18n._('Sign in to generate examples'),
          examples: [],
        },
      }));
      return;
    }

    setExamplesByLanguage((current) => ({
      ...current,
      [language]: { loading: true, error: null, examples: [] },
    }));

    try {
      const examples = await generateUsageExamples({ textAi, text, language });
      setExamplesByLanguage((current) => ({
        ...current,
        [language]: { loading: false, error: null, examples },
      }));
    } catch {
      setExamplesByLanguage((current) => ({
        ...current,
        [language]: {
          loading: false,
          error: i18n._('Could not generate examples'),
          examples: [],
        },
      }));
    }
  };

  const homeHref = `${getUrlStart(lang)}practice`;

  return (
    <Stack
      data-testid="translation-page"
      sx={{
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <TopOffset />
      <Stack
        sx={{
          width: '100%',
          maxWidth: '1400px',
          gap: '20px',
        }}
      >
        <Link href={homeHref} underline="hover" color="inherit">
          {i18n._('Back to practice')}
        </Link>
        <TranslationSettingsBar
          languages={settings.languages}
          voiceOverEnabled={settings.voiceOverEnabled}
          autoPronounceSource={settings.autoPronounceSource}
          autoPronounceResult={settings.autoPronounceResult}
          speechSupported={speech.isSupported}
          onToggleVoiceOver={() => {
            const nextEnabled = !settings.voiceOverEnabled;
            setVoiceOverEnabled(nextEnabled);
            if (!nextEnabled) {
              speech.stop();
            }
          }}
          onToggleAutoPronounceSource={setAutoPronounceSource}
          onToggleAutoPronounceResult={setAutoPronounceResult}
          onAddLanguage={handleAddLanguage}
        />
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: '12px',
            overflowX: 'auto',
            '@media (max-width: 800px)': {
              flexDirection: 'column',
            },
          }}
        >
          {settings.languages.map((language) => (
            <TranslationColumn
              key={language}
              language={language}
              languages={settings.languages}
              text={texts[language] || ''}
              isTranslating={translatingFrom !== null && translatingFrom !== language}
              isSpeaking={speech.speakingLanguage === language}
              canRemove={settings.languages.length > MIN_TRANSLATION_LANGUAGES}
              examples={examplesByLanguage[language]}
              onChangeText={(value) =>
                applySourceText(language, value, { fromPaste: false, immediate: false })
              }
              onPasteText={(value) => applyPastedText(language, value)}
              onChangeLanguage={(nextLanguage) => handleChangeLanguage(language, nextLanguage)}
              onRemove={() => handleRemoveLanguage(language)}
              onPlay={() => {
                const text = texts[language] || '';
                speech.play([{ language, text }]);
              }}
              onGiveExamples={() => void handleGiveExamples(language)}
              onFocus={() => setFocusedLanguage(language)}
              onBlur={() =>
                setFocusedLanguage((current) => (current === language ? null : current))
              }
              onHoverStart={() => setHoveredLanguage(language)}
              onHoverEnd={() =>
                setHoveredLanguage((current) => (current === language ? null : current))
              }
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
