export function convertMapToNewUrl(
  record: Record<string, string>,
  defaultMap: Record<string, string>,
  location: { pathname: string; search: string },
): string {
  const newSearchParams = new URLSearchParams(location.search);
  for (const key in record) {
    const isDefault = record[key] === defaultMap[key];
    if (!isDefault) {
      newSearchParams.set(key, String(record[key]));
    } else {
      newSearchParams.delete(key);
    }
  }

  return `${location.pathname}?${newSearchParams.toString()}`;
}
