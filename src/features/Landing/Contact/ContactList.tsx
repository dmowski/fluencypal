import GitHubIcon from '@mui/icons-material/GitHub';

import { Link, Stack, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import MailIcon from '@mui/icons-material/Mail';
import { CONTACTS } from './data';

export const ContactList = ({ isShowGitHub = false }: { isShowGitHub?: boolean }) => {
  return (
    <Stack gap={'10px'}>
      <Stack
        sx={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: '10px',
        }}
      >
        <MailIcon
          sx={{
            width: '25px',
            height: '25px',
          }}
        />
        <Typography>
          <Link href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</Link>
        </Typography>
      </Stack>

      <Stack
        sx={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: '10px',
        }}
      >
        <InstagramIcon
          sx={{
            width: '25px',
            height: '25px',
          }}
        />
        <Typography>
          <Link href={`${CONTACTS.instagram}`} target="_blank" rel="noopener noreferrer">
            dmowskii
          </Link>
        </Typography>
      </Stack>

      {isShowGitHub && (
        <Stack
          sx={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: '10px',
          }}
        >
          <GitHubIcon
            sx={{
              width: '25px',
              height: '25px',
            }}
          />
          <Typography>
            <Link href={`${CONTACTS.instagram}`} target="_blank" rel="noopener noreferrer">
              dmowski/fluencypal
            </Link>
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
