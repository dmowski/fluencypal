export function isOnlyProfilePageOpen(search: string): boolean {
  const params = new URLSearchParams(search);
  const keys = Array.from(params.keys());
  return keys.length === 1 && keys[0] === 'page' && params.get('page') === 'profile';
}
