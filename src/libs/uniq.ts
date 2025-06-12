export function uniq<T>(draftArray: T[]): T[] {
  return draftArray.filter((x, i, a) => a.indexOf(x) === i);
}
