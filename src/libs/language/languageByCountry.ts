import { NativeLangCode } from "./type";

export const COUNTRY_TO_LANGS: Record<string, NativeLangCode[]> = {
  // Europe
  PL: ["pl", "uk", "en", "ru"],
  UA: ["uk", "ru", "en", "pl"],
  DE: ["de", "en", "tr"],
  AT: ["de", "en"],
  CH: ["de", "fr", "it", "en"], // Romansh (rm)
  FR: ["fr", "en", "ar"],
  ES: ["es", "ca", "eu", "gl", "en"],
  PT: ["pt-PT", "pt", "en"],
  IT: ["it", "en"],
  NL: ["nl", "en"],
  BE: ["nl", "fr", "de", "en"],
  IE: ["en", "ga"],
  GB: ["en", "cy", "gd"],
  NO: ["no", "en"],
  SE: ["sv", "en"],
  DK: ["da", "en"],
  CZ: ["cs", "en"],
  SK: ["sk", "en"],
  SI: ["sl", "en"],
  HR: ["hr", "en"],
  RS: ["sr", "en"],
  BA: ["bs", "hr", "sr"],
  MK: ["mk", "sq"],
  RO: ["ro", "hu", "de", "en"],
  BG: ["bg", "en", "tr"],
  GR: ["el", "en"],
  HU: ["hu", "en"],
  LT: ["lt", "ru", "en"],
  LV: ["lv", "ru", "en"],
  EE: ["et", "ru", "en"],

  // Americas
  US: ["en", "es", "zh", "fr"],
  CA: ["en", "fr"],
  MX: ["es", "en"],
  AR: ["es"],
  CL: ["es"],
  CO: ["es"],
  PE: ["es", "qu"],
  BR: ["pt-BR", "pt", "en"],

  // MENA
  SA: ["ar", "en"],
  AE: ["ar", "en"],
  EG: ["ar", "en"],
  MA: ["ar", "fr", "en"], // (Tamazight/ber not in GT; keep if you support)
  DZ: ["ar", "fr"],
  TN: ["ar", "fr"],
  IR: ["fa"],
  IQ: ["ar", "ckb", "ku"],

  // CIS
  RU: ["ru", "tt", "ba"],
  BY: ["be", "ru"],
  KZ: ["kk", "ru"],
  UZ: ["uz", "ru"],
  GE: ["ka", "ru", "en"],
  AM: ["hy", "ru"],

  // Africa
  ZA: ["en", "zu", "xh", "af", "st", "tn", "ss", "ts", "nr", "nso"],
  NG: ["en", "ha", "ig", "yo"],
  KE: ["sw", "en"],
  TZ: ["sw", "en"],
  ET: ["am", "om", "ti", "so"],
  RW: ["rw", "fr", "en"],
  UG: ["lg", "en", "sw"],
  CD: ["fr", "ln", "sw"],
  CM: ["fr", "en"],
  GH: ["en", "ak", "ee"],
  SN: ["fr", "ff"],

  // South & East Asia
  IN: ["hi", "en", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa", "or"],
  PK: ["ur", "en", "pa", "sd", "ps"],
  BD: ["bn", "en"],
  NP: ["ne"],
  LK: ["si", "ta", "en"],
  TH: ["th"],
  VN: ["vi"],
  LA: ["lo"],
  KH: ["km"],
  MY: ["ms", "en", "zh", "ta"],
  SG: ["en", "zh", "ms", "ta"],
  ID: ["id", "jv", "su"],

  // East Asia
  CN: ["zh", "yue", "ug"],
  TW: ["zh-TW"],
  HK: ["yue", "zh", "en"],
  MO: ["yue", "zh", "pt"],
  JP: ["ja"],
  KR: ["ko"],

  // Oceania
  AU: ["en"],
  NZ: ["en", "mi"],
};

export function guessLanguagesByCountry(countryCode: string): NativeLangCode[] {
  return COUNTRY_TO_LANGS[countryCode.toUpperCase()] ?? [];
}
