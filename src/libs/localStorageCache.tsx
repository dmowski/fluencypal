import { fnv1aHash } from "./hash";

export interface GetDataFromCacheProps {
  inputValue: string;
  storageSpace: string;
}

export const getDataFromCache = async ({
  inputValue,
  storageSpace,
}: GetDataFromCacheProps) => {
  const uniqId = fnv1aHash(inputValue);

  const cachedStore = (localStorage.getItem(storageSpace) || "{}") as string;
  const cachedData = JSON.parse(cachedStore) as Record<string, string>;

  if (cachedData[uniqId]) {
    return cachedData[uniqId];
  }
  return null;
};

export interface SetDataToCacheProps {
  inputValue: string;
  outputValue: string;
  storageSpace: string;
}
export const setDataToCache = async ({
  inputValue,
  outputValue,
  storageSpace,
}: SetDataToCacheProps) => {
  const uniqId = fnv1aHash(inputValue);
  const cachedStore = (localStorage.getItem(storageSpace) || "{}") as string;
  const cachedData = JSON.parse(cachedStore) as Record<string, string>;
  cachedData[uniqId] = outputValue;
  localStorage.setItem(storageSpace, JSON.stringify(cachedData));
};
