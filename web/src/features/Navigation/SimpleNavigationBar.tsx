'use client';
import { Badge, Button, Link, Stack, Typography } from '@mui/material';
import { Home, LucideProps, Star, User, Users, VenetianMask } from 'lucide-react';
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLingui } from '@lingui/react';
import { useWindowSizes } from '../Layout/useWindowSizes';
import { PageType } from './types';
import { useAppNavigation } from './useAppNavigation';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { useSettings } from '../Settings/useSettings';
import { AppMode } from '@/common/userSettings';
import { Avatar } from '../Game/Avatar';
import { useChatList } from '../Chat/useChatList';
import { useBattle } from '../Game/Battle/useBattle';
import { useAccess } from '../Usage/useAccess';
import { useRouter } from 'next/navigation';
import { DevButton } from './DevButton';
import { langFlags } from '../Lang/lang';

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

export const SimpleNavigationBar: React.FC = () => {
  const appNavigation = useAppNavigation();
  const router = useRouter();

  const [internalPageType, setInternalPageType] = useState<PageType | null>(null);
  const internalPageRef = useRef<PageType | null>(appNavigation.currentPage);

  const setCurrentPage = async (pageType: PageType) => {
    if (internalPageRef.current === pageType) {
      return;
    }
    setInternalPageType(pageType);
    internalPageRef.current = pageType;
    const searchParams = new URLSearchParams();
    if (pageType !== 'home') {
      searchParams.set('page', pageType);
    }

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl === newUrl) {
      return;
    }
    router.push(newUrl);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInternalPageType(null);
      internalPageRef.current = null;
    }, 300);
    return () => clearTimeout(timeout);
  }, [internalPageType]);

  const { i18n } = useLingui();
  const game = useGame();
  const auth = useAuth();
  const settings = useSettings();

  const appMode = settings.appMode;
  const userPhoto = game.gameAvatars?.[auth.uid] || '';
  const { bottomOffset } = useWindowSizes();
  const chatList = useChatList();
  const battles = useBattle();
  const access = useAccess();

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
          badge: !access.canUseCommunity ? undefined : chatList.myUnreadCount,
        },

        {
          name: 'profile',
          icon: User,
          title: i18n._('Profile'),
        },
      ],
    }),
    [
      appMode,
      chatList.myUnreadCount,
      chatList.unreadCountGlobal,
      battles.countOfBattlesNeedToAttention,
      access.canUseCommunity,
    ],
  );

  const navigationItems: NavigationItem[] = navigationItemsByMode[appMode || 'learning'];

  const navigateTo = (
    e: React.MouseEvent<HTMLAnchorElement> | React.TouchEvent<HTMLAnchorElement>,
    itemName: PageType,
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

    setCurrentPage(itemName);
  };

  const currentLanguage = settings.languageCode || 'en';
  const langIcon = langFlags[settings.languageCode || 'en'];

  return (
    <>
      <Stack
        component={'nav'}
        sx={{
          width: '100%',
          alignItems: 'center',
          position: 'relative',
          zIndex: 999,
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: '700px', padding: '10px', position: 'relative' }}>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/*Language icon*/}
            <Avatar avatarSize="30px" url={langIcon} activeColor={activeColor} />

            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {!access.isFullAppAccess && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'rgba(218, 68, 248, 0.2)',
                    color: '#F8BCFF',
                    fontWeight: 'bold',
                    borderRadius: '20px',
                  }}
                  startIcon={<Star size={20} color="#F8BCFF" />}
                  onClick={() => {
                    access.showPaymentModal();
                  }}
                >
                  {i18n._('Update')}
                </Button>
              )}
              <Link
                href={`${appNavigation.pageUrl('profile')}`}
                onClick={(e) => navigateTo(e, 'profile')}
                sx={{
                  cursor: 'pointer',
                }}
              >
                {userPhoto ? (
                  <Avatar
                    onClick={() => {}}
                    avatarSize="40px"
                    url={userPhoto}
                    activeColor={activeColor}
                  />
                ) : (
                  <User width={'40px'} height={'40px'} />
                )}
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <DevButton />
    </>
  );
};
