'use client';

import { useLingui } from '@lingui/react';
import { Button } from '@mui/material';
import { type ReactNode } from 'react';
import { VoiceChatMemberStatus } from '../types';
import { VoiceChatChecklistRow } from './VoiceChatChecklistRow';

interface VoiceChatOnboardingChecklistProps {
  isEntitled: boolean;
  memberStatus?: VoiceChatMemberStatus | null;
  canRequestAccess: boolean;
  onStartMembership?: () => void;
  onRecordIntro?: () => void;
  /** Override default Record button (e.g. fixture renders a static button). */
  recordAction?: ReactNode;
  /** Override default Start button. */
  startAction?: ReactNode;
}

export const VoiceChatOnboardingChecklist = ({
  isEntitled,
  memberStatus,
  canRequestAccess,
  onStartMembership,
  onRecordIntro,
  recordAction,
  startAction,
}: VoiceChatOnboardingChecklistProps) => {
  const { i18n } = useLingui();

  return (
    <>
      <VoiceChatChecklistRow
        title={i18n._('Become a member')}
        info={i18n._(
          'Voice chat is for paying members. This keeps the room small and respectful.',
        )}
        done={isEntitled}
        action={
          !isEntitled
            ? (startAction ?? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onStartMembership}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {i18n._('Start')}
                </Button>
              ))
            : undefined
        }
      />

      <VoiceChatChecklistRow
        title={i18n._('Share a short intro (~30 sec)')}
        info={i18n._(
          'Record a short audio about yourself so others know who is joining. About 30 seconds is ideal.',
        )}
        done={memberStatus === 'pending' || memberStatus === 'approved'}
        action={
          canRequestAccess
            ? (recordAction ?? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onRecordIntro}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {i18n._('Record')}
                </Button>
              ))
            : undefined
        }
      />

      <VoiceChatChecklistRow
        title={i18n._('Wait for approval')}
        info={i18n._(
          'A host reviews your intro before you can listen and reply. This protects the group.',
        )}
        done={memberStatus === 'approved'}
      />
    </>
  );
};
