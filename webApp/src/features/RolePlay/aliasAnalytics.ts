export function isAliasGameRolePlay(rolePlayId: string | null | undefined): boolean {
  return rolePlayId === 'alias-game';
}

export function isAliasGameSession(): boolean {
  if (typeof window === 'undefined') return false;
  return isAliasGameRolePlay(new URLSearchParams(window.location.search).get('rolePlayId'));
}
