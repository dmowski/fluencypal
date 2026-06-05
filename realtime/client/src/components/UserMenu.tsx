import { Avatar, Menu, Text, UnstyledButton, VisuallyHidden } from "@mantine/core";
import type { User } from "firebase/auth";

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

  return "U";
};

export const UserMenu = ({ user, authStatusText, onSignOut }: UserMenuProps) => {
  return (
    <Menu shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton aria-label="Account menu">
          <Avatar src={user.photoURL ?? undefined} radius="xl">
            {getInitials(user)}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <VisuallyHidden>
          <p id="auth-status">{authStatusText}</p>
        </VisuallyHidden>
        <Menu.Label>
          <Text size="xs" style={{ wordBreak: "break-word" }}>
            {user.email ?? user.uid}
          </Text>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item id="sign-out" onClick={() => void onSignOut()}>
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
