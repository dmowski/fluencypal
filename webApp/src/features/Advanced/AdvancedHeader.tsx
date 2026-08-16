'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack } from '@mui/material';
import { useAuth } from '../Auth/useAuth';
import { LanguageSwitcher } from '../Lang/LanguageSwitcher';
import { fullLanguageName, SupportedLanguage } from '../Lang/lang';
import { useSettings } from '../Settings/useSettings';
import { useUrlParam } from '../Url/useUrlParam';
import { LogOut } from 'lucide-react';

export const AdvancedHeader = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const [, setIsShowLanguageModal] = useUrlParam('lang-selection');

  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || 'en';
  const targetLanguageCode = settings.languageCode || 'en';
  const nativeLanguageLabel =
    fullLanguageName[nativeLanguageCode as SupportedLanguage] || nativeLanguageCode;
  const targetLanguageLabel = fullLanguageName[targetLanguageCode] || targetLanguageCode;

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '12px',
      }}
    >
      <LanguageSwitcher
        isAuth={auth.isAuthorized}
        langToLearn={settings.languageCode || 'en'}
        setLanguageToLearn={settings.appMode === 'learning' ? settings.setLanguage : undefined}
        recentLearnLanguages={settings.recentLearnLanguages}
        setPageLanguage={settings.setPageLanguage}
        nativeLang={settings.userSettings?.nativeLanguageCode || 'en'}
        setNativeLanguage={settings.setNativeLanguage}
        isHidden
      />
      <Button
        variant="outlined"
        color="info"
        onClick={() => setIsShowLanguageModal(true)}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        {nativeLanguageLabel} {'→'} {targetLanguageLabel}
      </Button>
      <Button
        variant="text"
        endIcon={<LogOut size={16} />}
        color="inherit"
        onClick={() => void auth.logout()}
        sx={{
          textTransform: 'none',
          marginLeft: 'auto',
        }}
      >
        {i18n._('Log Out')}
      </Button>
    </Stack>
  );
};
