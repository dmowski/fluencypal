import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { useGame } from '../../Game/useGame';
import { Markdown } from '../../uiKit/Markdown/Markdown';

export const MessageContent = ({
  children,
  contentFontSize,
}: {
  children: string;
  contentFontSize?: string;
}) => {
  const game = useGame();

  const onClickOnUserName = (userName: string) => {
    if (!game.userNames) return;

    const userIds = Object.keys(game.userNames || {});
    const foundUserId = userIds.find((userId) => game.userNames?.[userId] === userName);
    if (foundUserId) {
      game.showUserInModal(foundUserId);
    }
  };

  const wrapUserNamesAsLinks = (text: string) => {
    let modifiedText = text;
    // find text that starts with @ and is followed by word characters
    const messageUserNames = modifiedText.match(/@(\w+)/g);

    if (messageUserNames) {
      messageUserNames.forEach((userNameWithAt) => {
        const hrefLink = `#user-${userNameWithAt.substring(1)}`;
        const markdownLink = `[${userNameWithAt}](${hrefLink})`;
        modifiedText = modifiedText.replace(
          new RegExp(`\\${userNameWithAt}\\b`, 'g'),
          markdownLink,
        );
      });
    }
    return '\n' + modifiedText.trim();
  };

  const contentToShow = useMemo(() => {
    return wrapUserNamesAsLinks(children);
  }, [children]);

  const onClick = (e: React.MouseEvent) => {
    const isLink = (e.target as HTMLElement).tagName === 'A';
    if (!isLink) return;

    const href = (e.target as HTMLAnchorElement).getAttribute('href') || '';
    const isUserLink = href?.startsWith('#user-');
    if (isUserLink) {
      const userName = href.replace('#user-', '');
      onClickOnUserName(userName);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const myUserName = game.myUserName;
  const myHrefLink = `#user-${myUserName}`;

  return (
    <Stack
      onClick={onClick}
      sx={{
        a: {
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 500,
        },

        // if my user name is mentioned, make it bold
        [`a[href="${myHrefLink}"]`]: {
          color: '#29B3E5',
        },

        // Link started with "/"
        'a[href^="/"]': {
          textDecoration: 'underline',
          color: '#16bbf7',
        },

        '* p': {
          fontSize: contentFontSize || '15px',
        },
      }}
    >
      <Markdown variant="small">{contentToShow}</Markdown>
    </Stack>
  );
};
