import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';

type UserMenuProps = {
  user: User;
  authStatusText: string;
  onSignOut: () => Promise<void>;
};

const getInitials = (user: User): string => {
  const name = user.displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const email = user.email?.trim();
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return 'U';
};

export const UserMenu = ({ user, authStatusText, onSignOut }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    void onSignOut();
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <p id="auth-status" className="visually-hidden">
        {authStatusText}
      </p>
      <button
        type="button"
        className="user-avatar"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="user-avatar-image" />
        ) : (
          <span className="user-avatar-initials">{getInitials(user)}</span>
        )}
      </button>
      {open ? (
        <div className="user-menu-dropdown" role="menu">
          <p className="user-menu-email">{user.email ?? user.uid}</p>
          <button id="sign-out" type="button" className="user-menu-item" role="menuitem" onClick={handleSignOut}>
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
};
