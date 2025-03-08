export function uniq(draftArray: string[]) {
  return draftArray.filter((x, i, a) => a.indexOf(x) == i);
}
