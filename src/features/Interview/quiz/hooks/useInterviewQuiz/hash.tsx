import { fnv1aHash } from "@/libs/hash";

export const getHash = (input: string) => {
  if (!input) return "";
  return fnv1aHash(input);
};
