'use client';
import { Avatar, Button } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';

interface Props {
  onClick: () => void;
}

export const ReaderAuthButton = ({ onClick }: Props) => {
  const auth = useAuth();
  const { i18n } = useLingui();

  if (auth.isAuthorized) {
    return (
      <Button
        onClick={onClick}
        startIcon={
          auth.userInfo?.photoURL ? (
            <Avatar
              src={auth.userInfo.photoURL}
              alt={auth.userInfo.displayName || ''}
              sx={{ width: 28, height: 28 }}
            />
          ) : undefined
        }
        sx={{ textTransform: 'none' }}
      >
        {auth.userInfo?.displayName || auth.userInfo?.email || i18n._('Account')}
      </Button>
    );
  }

  return (
    <Button variant="outlined" onClick={onClick}>
      {i18n._('Sign In')}
    </Button>
  );
};
