import { Stack } from '@mui/material';
import { useAuth } from '../Auth/useAuth';
import { langFlags } from '../Lang/lang';
import { useSettings } from '../Settings/useSettings';

export const DevButton = () => {
  const auth = useAuth();
  const settings = useSettings();
  const rotateLearnLanguage = () => {
    const currentLanguage = settings.languageCode || 'en';
    const nextLanguage = currentLanguage === 'en' ? 'pl' : 'en';
    settings.setLanguage(nextLanguage);
  };

  const rotatePageLanguage = () => {
    const currentLanguage = settings.pageLanguageCode || 'en';
    const nextLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    settings.setPageLanguage(nextLanguage);
  };
  if (!auth.isFounder) return null;

  return (
    <Stack
      sx={{
        position: 'fixed',
        top: '60px',
        right: '10px',
        zIndex: 300,
        alignItems: 'flex-end',
        gap: '5px',
      }}
    >
      {langFlags[settings.languageCode || 'en'] && auth.isFounder && (
        <Switcher label="l" value={settings.languageCode || 'en'} onClick={rotateLearnLanguage} />
      )}

      {auth.isFounder && (
        <Switcher
          label="p"
          value={settings.pageLanguageCode || 'en'}
          onClick={rotatePageLanguage}
        />
      )}
    </Stack>
  );
};

const Switcher = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) => {
  return (
    <Stack
      component={'span'}
      onClick={onClick}
      sx={{
        width: 'max-content',
        padding: '5px 10px',

        display: 'inline',
        textAlign: 'right',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        opacity: 0.2,

        ':hover': {
          boxShadow: '0 0 8px 2px #29b6f6',
          border: '1px solid #29b6f6',
          transform: 'scale(1.2)',
        },
      }}
    >
      {label}: {value}
    </Stack>
  );
};
