'use client';
import { Badge, Link, Stack, Typography } from '@mui/material';
import { Home, LucideProps, User, Users, VenetianMask } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes, useMemo } from 'react';
import { SupportedLanguage } from '../Lang/lang';
import { useLingui } from '@lingui/react';
import { useWindowSizes } from '../Layout/useWindowSizes';
import { PageType } from './types';
import { useAppNavigation } from './useAppNavigation';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { useSettings } from '../Settings/useSettings';
import { AppMode } from '@/common/user';
import { Avatar } from '../Game/Avatar';
import { useChatList } from '../Chat/useChatList';

export interface IconProps {
  color?: string;
  size?: string;
}

interface NavigationItem {
  name: PageType;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  badge?: number;
  title: string;
}

const activeColor = '#29b6f6'; // Define the active color for the icon
const inactiveColor = '#A0A0A0'; // Define the inactive color for the icon

export const NavigationBar: React.FC = () => {
  const appNavigation = useAppNavigation();

  const { i18n } = useLingui();
  const game = useGame();
  const auth = useAuth();
  const settings = useSettings();
  const appMode = settings.appMode;
  const userPhoto = game.gameAvatars?.[auth.uid] || '';
  const { bottomOffset } = useWindowSizes();
  const chatList = useChatList();

  const navigationItemsByMode: Record<AppMode, NavigationItem[]> = useMemo(
    () => ({
      interview: [
        {
          name: 'home',
          icon: Home,
          title: i18n._('Home'),
        },

        {
          name: 'profile',
          icon: User,
          title: i18n._('Profile'),
        },
      ],
      learning: [
        {
          name: 'home',
          icon: Home,
          title: i18n._('Home'),
        },
        {
          name: 'community',
          icon: Users,
          title: i18n._('Community'),
          badge: chatList.myUnreadCount,
        },
        {
          name: 'role-play',
          icon: VenetianMask,
          title: i18n._('Role Play'),
        },
        {
          name: 'profile',
          icon: User,
          title: i18n._('Profile'),
        },
      ],
    }),
    [appMode, chatList.myUnreadCount, chatList.unreadCountGlobal],
  );

  const navigationItems: NavigationItem[] = navigationItemsByMode[appMode || 'learning'];

  const navigateTo = (
    e: React.MouseEvent<HTMLAnchorElement> | React.TouchEvent<HTMLAnchorElement>,
    item: NavigationItem,
  ) => {
    const isTouchEvent = 'touches' in e;
    if (isTouchEvent) {
      e.stopPropagation();
      const touchEvent = e as React.TouchEvent<HTMLAnchorElement>;
      if (touchEvent.touches.length > 1) {
        return;
      }
    }

    try {
      e.stopPropagation();
    } catch (error) {
      console.log('Navigate error, stop propagation', e);
    }

    if (!isTouchEvent) {
      try {
        e.preventDefault();
      } catch (error) {
        console.log('Navigate error, prevent default', e);
      }
    }

    appNavigation.setCurrentPage(item.name);
  };

  return (
    <Stack
      component={'nav'}
      sx={{
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        zIndex: 999,

        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        marginBottom: '40px',
        '@media (max-width: 700px)': {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderBottom: 'none',
          marginBottom: '0px',
          position: 'fixed',
          bottom: 0,
          left: 0,
        },
      }}
    >
      <Stack sx={{ width: '100%', maxWidth: '700px', padding: '0 10px' }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            borderLeft: '1px solid rgba(255, 255, 255, 0.07)',
            borderRight: '1px solid rgba(255, 255, 255, 0.07)',
            '@media (max-width: 900px)': {
              border: 'none',
            },
          }}
        >
          {navigationItems.map((item) => {
            const isActive = appNavigation.currentPage === item.name;
            const color = isActive ? activeColor : inactiveColor;

            const isActiveBadge = item.badge !== undefined && item.badge > 0;

            const isProfile = item.name === 'profile';
            return (
              <Stack
                key={item.name}
                sx={{
                  listStyle: 'none',
                  color: color,
                  height: '100%',
                  padding: '0',
                  margin: '0',
                  width: '100%',
                  textDecoration: 'none',

                  ...(isActive
                    ? {
                        fontWeight: 'bold',
                      }
                    : {}),
                }}
              >
                <Link
                  href={`${appNavigation.pageUrl(item.name)}`}
                  onClick={(e) => e.preventDefault()}
                  onTouchStart={(e) => navigateTo(e, item)}
                  onMouseDown={(e) => navigateTo(e, item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      appNavigation.setCurrentPage(item.name);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    height: '100%',
                    width: '100%',
                    background: 'none',
                    color: 'inherit',
                    textDecoration: 'none',
                    padding: '0',
                    boxSizing: 'border-box',
                    paddingTop: '15px',
                    paddingBottom: `calc(10px + ${bottomOffset})`,
                    margin: '0',
                    gap: '5px',
                    transition: 'background-color 0.3s ease',
                    ':hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    },
                    '@media (max-width: 700px)': {
                      ':hover': {
                        backgroundColor: 'transparent',
                      },
                    },
                  }}
                >
                  <Badge color="error" badgeContent={isActiveBadge ? item.badge : 0}>
                    {isProfile && userPhoto ? (
                      <Avatar
                        avatarSize="20px"
                        url={userPhoto}
                        isActive={isActive}
                        activeColor={activeColor}
                      />
                    ) : (
                      <item.icon color={color} width={'20px'} height={'20px'} />
                    )}
                  </Badge>

                  <Stack
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      width: '100%',
                    }}
                  >
                    <Typography variant="caption" component={'span'} align="center">
                      {item.title}
                    </Typography>
                  </Stack>
                </Link>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
