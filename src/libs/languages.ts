export type NativeLangCode =
  | "ab"
  | "ace"
  | "ach"
  | "af"
  | "sq"
  | "alz"
  | "am"
  | "ar"
  | "hy"
  | "as"
  | "awa"
  | "ay"
  | "az"
  | "ban"
  | "bm"
  | "ba"
  | "eu"
  | "btx"
  | "bts"
  | "bbc"
  | "be"
  | "bem"
  | "bn"
  | "bew"
  | "bho"
  | "bik"
  | "bs"
  | "br"
  | "bg"
  | "bua"
  | "yue"
  | "ca"
  | "ceb"
  | "ny"
  | "zh"
  | "zh-CN"
  | "zh-TW"
  | "cv"
  | "co"
  | "crh"
  | "hr"
  | "cs"
  | "da"
  | "din"
  | "dv"
  | "doi"
  | "dov"
  | "nl"
  | "dz"
  | "en"
  | "eo"
  | "et"
  | "ee"
  | "fj"
  | "fil"
  | "tl"
  | "fi"
  | "fr"
  | "fr-FR"
  | "fr-CA"
  | "fy"
  | "ff"
  | "gaa"
  | "gl"
  | "lg"
  | "ka"
  | "de"
  | "el"
  | "gn"
  | "gu"
  | "ht"
  | "cnh"
  | "ha"
  | "haw"
  | "iw"
  | "he"
  | "hil"
  | "hi"
  | "hmn"
  | "hu"
  | "hrx"
  | "is"
  | "ig"
  | "ilo"
  | "id"
  | "ga"
  | "it"
  | "ja"
  | "jw"
  | "jv"
  | "kn"
  | "pam"
  | "kk"
  | "km"
  | "cgg"
  | "rw"
  | "ktu"
  | "gom"
  | "ko"
  | "kri"
  | "ku"
  | "ckb"
  | "ky"
  | "lo"
  | "ltg"
  | "la"
  | "lv"
  | "lij"
  | "li"
  | "ln"
  | "lt"
  | "lmo"
  | "luo"
  | "lb"
  | "mk"
  | "mai"
  | "mak"
  | "mg"
  | "ms"
  | "ms-Arab"
  | "ml"
  | "mt"
  | "mi"
  | "mr"
  | "chm"
  | "mni-Mtei"
  | "min"
  | "lus"
  | "mn"
  | "my"
  | "nr"
  | "new"
  | "ne"
  | "nso"
  | "no"
  | "nus"
  | "oc"
  | "or"
  | "om"
  | "pag"
  | "pap"
  | "ps"
  | "fa"
  | "pl"
  | "pt"
  | "pt-PT"
  | "pt-BR"
  | "pa"
  | "pa-Arab"
  | "qu"
  | "rom"
  | "ro"
  | "rn"
  | "ru"
  | "sm"
  | "sg"
  | "sa"
  | "gd"
  | "sr"
  | "st"
  | "crs"
  | "shn"
  | "sn"
  | "scn"
  | "szl"
  | "sd"
  | "si"
  | "sk"
  | "sl"
  | "so"
  | "es"
  | "su"
  | "sw"
  | "ss"
  | "sv"
  | "tg"
  | "ta"
  | "tt"
  | "te"
  | "tet"
  | "th"
  | "ti"
  | "ts"
  | "tn"
  | "tr"
  | "tk"
  | "ak"
  | "uk"
  | "ur"
  | "ug"
  | "uz"
  | "vi"
  | "cy"
  | "xh"
  | "yi"
  | "yo"
  | "yua"
  | "zu";

export interface LanguageInfo {
  languageCode: NativeLangCode;
  englishName: string;
  nativeName: string;
  flag: string; // Optional flag property for language icon
}

export const fullLanguagesMap: Record<NativeLangCode, LanguageInfo> = {
  "fr-CA": {
    languageCode: "fr-CA",
    englishName: "French (Canada)",
    nativeName: "français canadien",
    flag: `https://flagcdn.com/w80/ca.png`, // Canada (Quebec)
  },
  gaa: {
    languageCode: "gaa",
    englishName: "Ga",
    nativeName: "Gã",
    flag: `https://flagcdn.com/w80/gh.png`, // Ghana
  },
  alz: {
    languageCode: "alz",
    englishName: "Alur",
    nativeName: "Alur",
    flag: `https://flagcdn.com/w80/cd.png`, // DR Congo / Uganda
  },
  awa: {
    languageCode: "awa",
    englishName: "Awadhi",
    nativeName: "अवधी",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  cnh: {
    languageCode: "cnh",
    englishName: "Hakha Chin",
    nativeName: "Laiholh",
    flag: `https://flagcdn.com/w80/mm.png`, // Myanmar
  },
  haw: {
    languageCode: "haw",
    englishName: "Hawaiian",
    nativeName: "ʻŌlelo Hawaiʻi",
    flag: `https://flagcdn.com/w80/us.png`, // Hawaii (US)
  },
  iw: {
    languageCode: "iw",
    englishName: "Hebrew (old code)",
    nativeName: "עברית",
    flag: `https://flagcdn.com/w80/il.png`, // Israel
  },
  hil: {
    languageCode: "hil",
    englishName: "Hiligaynon",
    nativeName: "Ilonggo",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  hmn: {
    languageCode: "hmn",
    englishName: "Hmong",
    nativeName: "Hmoob",
    flag: `https://flagcdn.com/w80/la.png`, // Laos (also US, China, Vietnam)
  },
  hrx: {
    languageCode: "hrx",
    englishName: "Hunsrik",
    nativeName: "Hunsrik",
    flag: `https://flagcdn.com/w80/br.png`, // Brazil (Rio Grande do Sul)
  },
  ilo: {
    languageCode: "ilo",
    englishName: "Ilocano",
    nativeName: "Ilokano",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  jw: {
    languageCode: "jw",
    englishName: "Javanese (old code)",
    nativeName: "basa Jawa",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  pam: {
    languageCode: "pam",
    englishName: "Kapampangan",
    nativeName: "Kapampangan",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  cgg: {
    languageCode: "cgg",
    englishName: "Chiga",
    nativeName: "Rukiga",
    flag: `https://flagcdn.com/w80/ug.png`, // Uganda
  },
  ktu: {
    languageCode: "ktu",
    englishName: "Kituba",
    nativeName: "Kikongo ya Leta",
    flag: `https://flagcdn.com/w80/cg.png`, // Republic of the Congo
  },
  gom: {
    languageCode: "gom",
    englishName: "Konkani",
    nativeName: "कोंकणी",
    flag: `https://flagcdn.com/w80/in.png`, // India (Goa)
  },
  kri: {
    languageCode: "kri",
    englishName: "Krio",
    nativeName: "Krio",
    flag: `https://flagcdn.com/w80/sl.png`, // Sierra Leone
  },
  ckb: {
    languageCode: "ckb",
    englishName: "Kurdish (Sorani)",
    nativeName: "سۆرانی",
    flag: `https://flagcdn.com/w80/iq.png`, // Iraq
  },
  ltg: {
    languageCode: "ltg",
    englishName: "Latgalian",
    nativeName: "Latgalīšu volūda",
    flag: `https://flagcdn.com/w80/lv.png`, // Latvia
  },
  lij: {
    languageCode: "lij",
    englishName: "Ligurian",
    nativeName: "Líguru",
    flag: `https://flagcdn.com/w80/it.png`, // Italy (Liguria)
  },
  lmo: {
    languageCode: "lmo",
    englishName: "Lombard",
    nativeName: "Lombard",
    flag: `https://flagcdn.com/w80/it.png`, // Italy (Lombardy)
  },
  luo: {
    languageCode: "luo",
    englishName: "Luo",
    nativeName: "Dholuo",
    flag: `https://flagcdn.com/w80/ke.png`, // Kenya
  },
  mai: {
    languageCode: "mai",
    englishName: "Maithili",
    nativeName: "मैथिली",
    flag: `https://flagcdn.com/w80/in.png`, // India / Nepal
  },
  mak: {
    languageCode: "mak",
    englishName: "Makasar",
    nativeName: "ᨆᨀᨔᨑ",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia (Sulawesi)
  },
  "ms-Arab": {
    languageCode: "ms-Arab",
    englishName: "Malay (Jawi script)",
    nativeName: "بهاس ملايو‎",
    flag: `https://flagcdn.com/w80/my.png`, // Malaysia
  },
  chm: {
    languageCode: "chm",
    englishName: "Mari",
    nativeName: "марий йылме",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Mari El Republic)
  },
  "mni-Mtei": {
    languageCode: "mni-Mtei",
    englishName: "Manipuri (Meitei)",
    nativeName: "ꯃꯩꯇꯩ ꯂꯣꯟ",
    flag: `https://flagcdn.com/w80/in.png`, // India (Manipur)
  },
  min: {
    languageCode: "min",
    englishName: "Minangkabau",
    nativeName: "Baso Minang",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia (Sumatra)
  },
  lus: {
    languageCode: "lus",
    englishName: "Mizo",
    nativeName: "Mizo ṭawng",
    flag: `https://flagcdn.com/w80/in.png`, // India (Mizoram)
  },
  new: {
    languageCode: "new",
    englishName: "Newari",
    nativeName: "नेपाल भाषा",
    flag: `https://flagcdn.com/w80/np.png`, // Nepal
  },
  nso: {
    languageCode: "nso",
    englishName: "Northern Sotho",
    nativeName: "Sesotho sa Leboa",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  nus: {
    languageCode: "nus",
    englishName: "Nuer",
    nativeName: "Thok Nath",
    flag: `https://flagcdn.com/w80/ss.png`, // South Sudan
  },
  pag: {
    languageCode: "pag",
    englishName: "Pangasinan",
    nativeName: "Pangasinan",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  pap: {
    languageCode: "pap",
    englishName: "Papiamento",
    nativeName: "Papiamentu",
    flag: `https://flagcdn.com/w80/aw.png`, // Aruba / Curaçao
  },
  "pt-PT": {
    languageCode: "pt-PT",
    englishName: "Portuguese (Portugal)",
    nativeName: "Português",
    flag: `https://flagcdn.com/w80/pt.png`, // Portugal
  },
  "pt-BR": {
    languageCode: "pt-BR",
    englishName: "Portuguese (Brazil)",
    nativeName: "Português do Brasil",
    flag: `https://flagcdn.com/w80/br.png`, // Brazil
  },
  "pa-Arab": {
    languageCode: "pa-Arab",
    englishName: "Punjabi (Shahmukhi)",
    nativeName: "پنجابی",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  rom: {
    languageCode: "rom",
    englishName: "Romani",
    nativeName: "Romani",
    flag: `https://flagcdn.com/w80/ro.png`, // Romania (diaspora)
  },
  crs: {
    languageCode: "crs",
    englishName: "Seychellois Creole",
    nativeName: "Kreol Seselwa",
    flag: `https://flagcdn.com/w80/sc.png`, // Seychelles
  },
  shn: {
    languageCode: "shn",
    englishName: "Shan",
    nativeName: "ၵႂၢမ်းတႆး",
    flag: `https://flagcdn.com/w80/mm.png`, // Myanmar (Shan State)
  },
  scn: {
    languageCode: "scn",
    englishName: "Sicilian",
    nativeName: "Sicilianu",
    flag: `https://flagcdn.com/w80/it.png`, // Italy (Sicily)
  },
  szl: {
    languageCode: "szl",
    englishName: "Silesian",
    nativeName: "ślōnskŏ gŏdka",
    flag: `https://flagcdn.com/w80/pl.png`, // Poland (Silesia)
  },
  tet: {
    languageCode: "tet",
    englishName: "Tetum",
    nativeName: "Tetun",
    flag: `https://flagcdn.com/w80/tl.png`, // Timor-Leste
  },
  yua: {
    languageCode: "yua",
    englishName: "Yucatec Maya",
    nativeName: "Màaya T'àan",
    flag: `https://flagcdn.com/w80/mx.png`, // Mexico (Yucatán)
  },
  zu: {
    languageCode: "zu",
    englishName: "Zulu",
    nativeName: "isiZulu",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  dov: {
    languageCode: "dov",
    englishName: "Dombe",
    nativeName: "Cindombe",
    flag: `https://flagcdn.com/w80/mz.png`, // Mozambique (Dombe language region)
  },
  dz: {
    languageCode: "dz",
    englishName: "Dzongkha",
    nativeName: "རྫོང་ཁ",
    flag: `https://flagcdn.com/w80/bt.png`, // Bhutan
  },
  fil: {
    languageCode: "fil",
    englishName: "Filipino",
    nativeName: "Filipino",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  "fr-FR": {
    languageCode: "fr-FR",
    englishName: "French (France)",
    nativeName: "français",
    flag: `https://flagcdn.com/w80/fr.png`, // France
  },
  "zh-TW": {
    languageCode: "zh-TW",
    englishName: "Chinese (Traditional)",
    nativeName: "繁體中文",
    flag: `https://flagcdn.com/w80/tw.png`, // Taiwan
  },
  crh: {
    languageCode: "crh",
    englishName: "Crimean Tatar",
    nativeName: "Qırımtatarca",
    flag: `https://flagcdn.com/w80/ua.png`, // Ukraine (Crimea)
  },
  din: {
    languageCode: "din",
    englishName: "Dinka",
    nativeName: "Thuɔŋjäŋ",
    flag: `https://flagcdn.com/w80/ss.png`, // South Sudan
  },
  doi: {
    languageCode: "doi",
    englishName: "Dogri",
    nativeName: "डोगरी",
    flag: `https://flagcdn.com/w80/in.png`, // India (Jammu region)
  },
  bua: {
    languageCode: "bua",
    englishName: "Buryat",
    nativeName: "Буряад хэлэн",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Buryatia)
  },
  yue: {
    languageCode: "yue",
    englishName: "Cantonese",
    nativeName: "粵語",
    flag: `https://flagcdn.com/w80/hk.png`, // Hong Kong (Cantonese standard)
  },
  ceb: {
    languageCode: "ceb",
    englishName: "Cebuano",
    nativeName: "Binisaya",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  "zh-CN": {
    languageCode: "zh-CN",
    englishName: "Chinese (Simplified)",
    nativeName: "简体中文",
    flag: `https://flagcdn.com/w80/cn.png`, // Mainland China
  },
  bem: {
    languageCode: "bem",
    englishName: "Bemba",
    nativeName: "ChiBemba",
    flag: `https://flagcdn.com/w80/zm.png`, // Zambia
  },
  bew: {
    languageCode: "bew",
    englishName: "Betawi",
    nativeName: "Bahasa Betawi",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia (Jakarta region)
  },
  bho: {
    languageCode: "bho",
    englishName: "Bhojpuri",
    nativeName: "भोजपुरी",
    flag: `https://flagcdn.com/w80/in.png`, // India (also spoken in Nepal)
  },
  bik: {
    languageCode: "bik",
    englishName: "Bikol",
    nativeName: "Bikol",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines (Bicol region)
  },
  ban: {
    languageCode: "ban",
    englishName: "Balinese",
    nativeName: "Basa Bali",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  btx: {
    languageCode: "btx",
    englishName: "Batak",
    nativeName: "Basa Batak",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  bts: {
    languageCode: "bts",
    englishName: "Bashkort",
    nativeName: "башҡорт теле",
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  bbc: {
    languageCode: "bbc",
    englishName: "Bemba",
    nativeName: "Icibemba",
    flag: `https://flagcdn.com/w80/zm.png`,
  },
  ace: {
    languageCode: "ace",
    englishName: "Achinese",
    nativeName: "Basa Acèh",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  ach: {
    languageCode: "ach",
    englishName: "Acoli",
    nativeName: "Luo",
    flag: `https://flagcdn.com/w80/ug.png`,
  },

  ab: {
    languageCode: "ab",
    englishName: "Abkhaz",
    nativeName: "аҧсуа",
    flag: `https://flagcdn.com/w80/ge.png`,
  },
  af: {
    languageCode: "af",
    englishName: "Afrikaans",
    nativeName: "Afrikaans",
    flag: `https://flagcdn.com/w80/za.png`,
  },
  ak: {
    languageCode: "ak",
    englishName: "Akan",
    nativeName: "Akan",
    flag: `https://flagcdn.com/w80/gh.png`,
  },
  sq: {
    languageCode: "sq",
    englishName: "Albanian",
    nativeName: "Shqip",
    flag: `https://flagcdn.com/w80/al.png`,
  },
  am: {
    languageCode: "am",
    englishName: "Amharic",
    nativeName: "አማርኛ",
    flag: `https://flagcdn.com/w80/et.png`,
  },
  ar: {
    languageCode: "ar",
    englishName: "Arabic",
    nativeName: "العربية",
    flag: `https://flagcdn.com/w80/sa.png`,
  },
  hy: {
    languageCode: "hy",
    englishName: "Armenian",
    nativeName: "Հայերեն",
    flag: `https://flagcdn.com/w80/am.png`,
  },
  as: {
    languageCode: "as",
    englishName: "Assamese",
    nativeName: "অসমীয়া",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  ay: {
    languageCode: "ay",
    englishName: "Aymara",
    nativeName: "aymar aru",
    flag: `https://flagcdn.com/w80/bo.png`,
  },
  az: {
    languageCode: "az",
    englishName: "Azerbaijani",
    nativeName: "azərbaycan dili",
    flag: `https://flagcdn.com/w80/az.png`,
  },
  bm: {
    languageCode: "bm",
    englishName: "Bambara",
    nativeName: "bamanankan",
    flag: `https://flagcdn.com/w80/ml.png`,
  },
  ba: {
    languageCode: "ba",
    englishName: "Bashkir",
    nativeName: "башҡорт теле",
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  eu: {
    languageCode: "eu",
    englishName: "Basque",
    nativeName: "euskara, euskera",
    flag: `https://flagcdn.com/w80/es.png`,
  },
  be: {
    languageCode: "be",
    englishName: "Belarusian",
    nativeName: "Беларуская",
    flag: `https://flagcdn.com/w80/by.png`,
  },
  bn: {
    languageCode: "bn",
    englishName: "Bengali",
    nativeName: "বাংলা",
    flag: `https://flagcdn.com/w80/bd.png`,
  },
  bs: {
    languageCode: "bs",
    englishName: "Bosnian",
    nativeName: "bosanski jezik",
    flag: `https://flagcdn.com/w80/ba.png`,
  },
  br: {
    languageCode: "br",
    englishName: "Breton",
    nativeName: "brezhoneg",
    flag: `https://flagcdn.com/w80/fr.png`,
  },
  bg: {
    languageCode: "bg",
    englishName: "Bulgarian",
    nativeName: "български език",
    flag: `https://flagcdn.com/w80/bg.png`,
  },
  my: {
    languageCode: "my",
    englishName: "Burmese",
    nativeName: "ဗမာစာ",
    flag: `https://flagcdn.com/w80/mm.png`,
  },
  ca: {
    languageCode: "ca",
    englishName: "Catalan; Valencian",
    nativeName: "Català",
    flag: `https://flagcdn.com/w80/ad.png`,
  },
  ny: {
    languageCode: "ny",
    englishName: "Chichewa; Chewa; Nyanja",
    nativeName: "chiCheŵa, chinyanja",
    flag: `https://flagcdn.com/w80/mw.png`,
  },
  zh: {
    languageCode: "zh",
    englishName: "Chinese",
    nativeName: "中文 (Zhōngwén), 汉语, 漢語",
    flag: `https://flagcdn.com/w80/cn.png`,
  },
  cv: {
    languageCode: "cv",
    englishName: "Chuvash",
    nativeName: "чӑваш чӗлхи",
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  co: {
    languageCode: "co",
    englishName: "Corsican",
    nativeName: "corsu, lingua corsa",
    flag: `https://flagcdn.com/w80/fr.png`,
  },
  hr: {
    languageCode: "hr",
    englishName: "Croatian",
    nativeName: "hrvatski",
    flag: `https://flagcdn.com/w80/hr.png`,
  },
  cs: {
    languageCode: "cs",
    englishName: "Czech",
    nativeName: "česky, čeština",
    flag: `https://flagcdn.com/w80/cz.png`,
  },
  da: {
    languageCode: "da",
    englishName: "Danish",
    nativeName: "dansk",
    flag: `https://flagcdn.com/w80/dk.png`,
  },
  dv: {
    languageCode: "dv",
    englishName: "Divehi; Dhivehi; Maldivian",
    nativeName: "ދިވެހި",
    flag: `https://flagcdn.com/w80/mv.png`,
  },
  nl: {
    languageCode: "nl",
    englishName: "Dutch",
    nativeName: "Nederlands, Vlaams",
    flag: `https://flagcdn.com/w80/nl.png`,
  },
  en: {
    languageCode: "en",
    englishName: "English",
    nativeName: "English",
    flag: `https://flagcdn.com/w80/us.png`,
  },
  eo: {
    languageCode: "eo",
    englishName: "Esperanto",
    nativeName: "Esperanto",
    flag: `https://flagcdn.com/w80/un.png`,
  },
  et: {
    languageCode: "et",
    englishName: "Estonian",
    nativeName: "eesti, eesti keel",
    flag: `https://flagcdn.com/w80/ee.png`,
  },
  ee: {
    languageCode: "ee",
    englishName: "Ewe",
    nativeName: "Eʋegbe",
    flag: `https://flagcdn.com/w80/gh.png`,
  },
  fj: {
    languageCode: "fj",
    englishName: "Fijian",
    nativeName: "vosa Vakaviti",
    flag: `https://flagcdn.com/w80/fj.png`,
  },
  fi: {
    languageCode: "fi",
    englishName: "Finnish",
    nativeName: "suomi, suomen kieli",
    flag: `https://flagcdn.com/w80/fi.png`,
  },
  fr: {
    languageCode: "fr",
    englishName: "French",
    nativeName: "français, langue française",
    flag: `https://flagcdn.com/w80/fr.png`,
  },
  ff: {
    languageCode: "ff",
    englishName: "Fula; Fulah; Pulaar; Pular",
    nativeName: "Fulfulde, Pulaar, Pular",
    flag: `https://flagcdn.com/w80/sn.png`,
  },
  gl: {
    languageCode: "gl",
    englishName: "Galician",
    nativeName: "Galego",
    flag: `https://flagcdn.com/w80/es.png`,
  },
  ka: {
    languageCode: "ka",
    englishName: "Georgian",
    nativeName: "ქართული",
    flag: `https://flagcdn.com/w80/ge.png`,
  },
  de: {
    languageCode: "de",
    englishName: "German",
    nativeName: "Deutsch",
    flag: `https://flagcdn.com/w80/de.png`,
  },
  el: {
    languageCode: "el",
    englishName: "Greek, Modern",
    nativeName: "Ελληνικά",
    flag: `https://flagcdn.com/w80/gr.png`,
  },
  gn: {
    languageCode: "gn",
    englishName: "Guaraní",
    nativeName: "Avañeẽ",
    flag: `https://flagcdn.com/w80/py.png`,
  },
  gu: {
    languageCode: "gu",
    englishName: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  ht: {
    languageCode: "ht",
    englishName: "Haitian; Haitian Creole",
    nativeName: "Kreyòl ayisyen",
    flag: `https://flagcdn.com/w80/ht.png`,
  },
  ha: {
    languageCode: "ha",
    englishName: "Hausa",
    nativeName: "Hausa, هَوُسَ",
    flag: `https://flagcdn.com/w80/ng.png`,
  },
  he: {
    languageCode: "he",
    englishName: "Hebrew (modern)",
    nativeName: "עברית",
    flag: `https://flagcdn.com/w80/il.png`,
  },
  hi: {
    languageCode: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी, हिंदी",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  hu: {
    languageCode: "hu",
    englishName: "Hungarian",
    nativeName: "Magyar",
    flag: `https://flagcdn.com/w80/hu.png`,
  },
  id: {
    languageCode: "id",
    englishName: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  ga: {
    languageCode: "ga",
    englishName: "Irish",
    nativeName: "Gaeilge",
    flag: `https://flagcdn.com/w80/ie.png`,
  },
  ig: {
    languageCode: "ig",
    englishName: "Igbo",
    nativeName: "Asụsụ Igbo",
    flag: `https://flagcdn.com/w80/ng.png`,
  },
  is: {
    languageCode: "is",
    englishName: "Icelandic",
    nativeName: "Íslenska",
    flag: `https://flagcdn.com/w80/is.png`,
  },
  it: {
    languageCode: "it",
    englishName: "Italian",
    nativeName: "Italiano",
    flag: `https://flagcdn.com/w80/it.png`,
  },
  ja: {
    languageCode: "ja",
    englishName: "Japanese",
    nativeName: "日本語 (にほんご／にっぽんご)",
    flag: `https://flagcdn.com/w80/jp.png`,
  },
  jv: {
    languageCode: "jv",
    englishName: "Javanese",
    nativeName: "basa Jawa",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  kn: {
    languageCode: "kn",
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  kk: {
    languageCode: "kk",
    englishName: "Kazakh",
    nativeName: "Қазақ тілі",
    flag: `https://flagcdn.com/w80/kz.png`,
  },
  km: {
    languageCode: "km",
    englishName: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    flag: `https://flagcdn.com/w80/kh.png`,
  },
  rw: {
    languageCode: "rw",
    englishName: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
    flag: `https://flagcdn.com/w80/rw.png`,
  },
  ky: {
    languageCode: "ky",
    englishName: "Kirghiz, Kyrgyz",
    nativeName: "кыргыз тили",
    flag: `https://flagcdn.com/w80/kg.png`,
  },
  ko: {
    languageCode: "ko",
    englishName: "Korean",
    nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
    flag: `https://flagcdn.com/w80/kr.png`,
  },
  ku: {
    languageCode: "ku",
    englishName: "Kurdish",
    nativeName: "Kurdî, كوردی‎",
    flag: `https://flagcdn.com/w80/iq.png`,
  },
  la: {
    languageCode: "la",
    englishName: "Latin",
    nativeName: "latine, lingua latina",
    flag: `https://flagcdn.com/w80/va.png`,
  },
  lb: {
    languageCode: "lb",
    englishName: "Luxembourgish, Letzeburgesch",
    nativeName: "Lëtzebuergesch",
    flag: `https://flagcdn.com/w80/lu.png`,
  },
  lg: {
    languageCode: "lg",
    englishName: "Luganda",
    nativeName: "Luganda",
    flag: `https://flagcdn.com/w80/ug.png`,
  },
  li: {
    languageCode: "li",
    englishName: "Limburgish, Limburgan, Limburger",
    nativeName: "Limburgs",
    flag: `https://flagcdn.com/w80/nl.png`,
  },
  ln: {
    languageCode: "ln",
    englishName: "Lingala",
    nativeName: "Lingála",
    flag: `https://flagcdn.com/w80/cd.png`,
  },
  lo: {
    languageCode: "lo",
    englishName: "Lao",
    nativeName: "ພາສାລາວ",
    flag: `https://flagcdn.com/w80/la.png`,
  },
  lt: {
    languageCode: "lt",
    englishName: "Lithuanian",
    nativeName: "lietuvių kalba",
    flag: `https://flagcdn.com/w80/lt.png`,
  },
  lv: {
    languageCode: "lv",
    englishName: "Latvian",
    nativeName: "latviešu valoda",
    flag: `https://flagcdn.com/w80/lv.png`,
  },
  mk: {
    languageCode: "mk",
    englishName: "Macedonian",
    nativeName: "македонски јазик",
    flag: `https://flagcdn.com/w80/mk.png`,
  },
  mg: {
    languageCode: "mg",
    englishName: "Malagasy",
    nativeName: "Malagasy fiteny",
    flag: `https://flagcdn.com/w80/mg.png`,
  },
  ms: {
    languageCode: "ms",
    englishName: "Malay",
    nativeName: "bahasa Melayu, بهاس ملايو‎",
    flag: `https://flagcdn.com/w80/my.png`,
  },
  ml: {
    languageCode: "ml",
    englishName: "Malayalam",
    nativeName: "മലയാളം",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  mt: {
    languageCode: "mt",
    englishName: "Maltese",
    nativeName: "Malti",
    flag: `https://flagcdn.com/w80/mt.png`,
  },
  mi: {
    languageCode: "mi",
    englishName: "Māori",
    nativeName: "te reo Māori",
    flag: `https://flagcdn.com/w80/nz.png`,
  },
  mr: {
    languageCode: "mr",
    englishName: "Marathi (Marāṭhī)",
    nativeName: "मराठी",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  mn: {
    languageCode: "mn",
    englishName: "Mongolian",
    nativeName: "монгол",
    flag: `https://flagcdn.com/w80/mn.png`,
  },
  ne: {
    languageCode: "ne",
    englishName: "Nepali",
    nativeName: "नेपाली",
    flag: `https://flagcdn.com/w80/np.png`,
  },
  no: {
    languageCode: "no",
    englishName: "Norwegian",
    nativeName: "Norsk",
    flag: `https://flagcdn.com/w80/no.png`,
  },
  nr: {
    languageCode: "nr",
    englishName: "South Ndebele",
    nativeName: "isiNdebele",
    flag: `https://flagcdn.com/w80/za.png`,
  },
  oc: {
    languageCode: "oc",
    englishName: "Occitan",
    nativeName: "Occitan",
    flag: `https://flagcdn.com/w80/fr.png`,
  },
  om: {
    languageCode: "om",
    englishName: "Oromo",
    nativeName: "Afaan Oromoo",
    flag: `https://flagcdn.com/w80/et.png`,
  },
  or: {
    languageCode: "or",
    englishName: "Oriya",
    nativeName: "ଓଡ଼ିଆ",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  pa: {
    languageCode: "pa",
    englishName: "Panjabi, Punjabi",
    nativeName: "ਪੰਜਾਬੀ, پنجابی‎",
    flag: `https://flagcdn.com/w80/pk.png`,
  },
  fa: {
    languageCode: "fa",
    englishName: "Persian",
    nativeName: "فارسی",
    flag: `https://flagcdn.com/w80/ir.png`,
  },
  pl: {
    languageCode: "pl",
    englishName: "Polish",
    nativeName: "polski",
    flag: `https://flagcdn.com/w80/pl.png`,
  },
  ps: {
    languageCode: "ps",
    englishName: "Pashto, Pushto",
    nativeName: "پښتو",
    flag: `https://flagcdn.com/w80/af.png`,
  },
  pt: {
    languageCode: "pt",
    englishName: "Portuguese",
    nativeName: "Português",
    flag: `https://flagcdn.com/w80/pt.png`,
  },
  qu: {
    languageCode: "qu",
    englishName: "Quechua",
    nativeName: "Runa Simi, Kichwa",
    flag: `https://flagcdn.com/w80/pe.png`,
  },
  rn: {
    languageCode: "rn",
    englishName: "Kirundi",
    nativeName: "kiRundi",
    flag: `https://flagcdn.com/w80/bi.png`,
  },
  ro: {
    languageCode: "ro",
    englishName: "Romanian",
    nativeName: "română",
    flag: `https://flagcdn.com/w80/ro.png`,
  },
  ru: {
    languageCode: "ru",
    englishName: "Russian",
    nativeName: "русский",
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  sa: {
    languageCode: "sa",
    englishName: "Sanskrit",
    nativeName: "संस्कृतम्",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  sd: {
    languageCode: "sd",
    englishName: "Sindhi",
    nativeName: "سندھی‎",
    flag: `https://flagcdn.com/w80/pk.png`,
  },
  sm: {
    languageCode: "sm",
    englishName: "Samoan",
    nativeName: "gagana faa Samoa",
    flag: `https://flagcdn.com/w80/ws.png`,
  },
  sg: {
    languageCode: "sg",
    englishName: "Sango",
    nativeName: "yângâ tî sängö",
    flag: `https://flagcdn.com/w80/cf.png`,
  },
  sr: {
    languageCode: "sr",
    englishName: "Serbian",
    nativeName: "српски језик",
    flag: `https://flagcdn.com/w80/rs.png`,
  },
  gd: {
    languageCode: "gd",
    englishName: "Scottish Gaelic",
    nativeName: "Gàidhlig",
    flag: `https://flagcdn.com/w80/gb.png`,
  },
  sn: {
    languageCode: "sn",
    englishName: "Shona",
    nativeName: "chiShona",
    flag: `https://flagcdn.com/w80/zw.png`,
  },
  si: {
    languageCode: "si",
    englishName: "Sinhala",
    nativeName: "සිංහල",
    flag: `https://flagcdn.com/w80/lk.png`,
  },
  sk: {
    languageCode: "sk",
    englishName: "Slovak",
    nativeName: "slovenčina",
    flag: `https://flagcdn.com/w80/sk.png`,
  },
  sl: {
    languageCode: "sl",
    englishName: "Slovene",
    nativeName: "slovenščina",
    flag: `https://flagcdn.com/w80/si.png`,
  },
  so: {
    languageCode: "so",
    englishName: "Somali",
    nativeName: "Soomaaliga, af Soomaali",
    flag: `https://flagcdn.com/w80/so.png`,
  },
  st: {
    languageCode: "st",
    englishName: "Southern Sotho",
    nativeName: "Sesotho",
    flag: `https://flagcdn.com/w80/ls.png`,
  },
  es: {
    languageCode: "es",
    englishName: "Spanish",
    nativeName: "español, castellano",
    flag: `https://flagcdn.com/w80/es.png`,
  },
  su: {
    languageCode: "su",
    englishName: "Sundanese",
    nativeName: "Basa Sunda",
    flag: `https://flagcdn.com/w80/id.png`,
  },
  sw: {
    languageCode: "sw",
    englishName: "Swahili",
    nativeName: "Kiswahili",
    flag: `https://flagcdn.com/w80/tz.png`,
  },
  ss: {
    languageCode: "ss",
    englishName: "Swati",
    nativeName: "SiSwati",
    flag: `https://flagcdn.com/w80/sz.png`,
  },
  sv: {
    languageCode: "sv",
    englishName: "Swedish",
    nativeName: "svenska",
    flag: `https://flagcdn.com/w80/se.png`,
  },
  ta: {
    languageCode: "ta",
    englishName: "Tamil",
    nativeName: "தமிழ்",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  te: {
    languageCode: "te",
    englishName: "Telugu",
    nativeName: "తెలుగు",
    flag: `https://flagcdn.com/w80/in.png`,
  },
  tg: {
    languageCode: "tg",
    englishName: "Tajik",
    nativeName: "тоҷикӣ",
    flag: `https://flagcdn.com/w80/tj.png`,
  },
  th: {
    languageCode: "th",
    englishName: "Thai",
    nativeName: "ไทย",
    flag: `https://flagcdn.com/w80/th.png`,
  },
  ti: {
    languageCode: "ti",
    englishName: "Tigrinya",
    nativeName: "ትግርኛ",
    flag: `https://flagcdn.com/w80/er.png`,
  },
  tk: {
    languageCode: "tk",
    englishName: "Turkmen",
    nativeName: "Türkmen",
    flag: `https://flagcdn.com/w80/tm.png`,
  },
  tl: {
    languageCode: "tl",
    englishName: "Tagalog",
    nativeName: "Wikang Tagalog",
    flag: `https://flagcdn.com/w80/ph.png`,
  },
  tn: {
    languageCode: "tn",
    englishName: "Tswana",
    nativeName: "Setswana",
    flag: `https://flagcdn.com/w80/bw.png`,
  },
  tr: {
    languageCode: "tr",
    englishName: "Turkish",
    nativeName: "Türkçe",
    flag: `https://flagcdn.com/w80/tr.png`,
  },
  ts: {
    languageCode: "ts",
    englishName: "Tsonga",
    nativeName: "Xitsonga",
    flag: `https://flagcdn.com/w80/za.png`,
  },
  tt: {
    languageCode: "tt",
    englishName: "Tatar",
    nativeName: "татарча",
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  ug: {
    languageCode: "ug",
    englishName: "Uyghur",
    nativeName: "ئۇيغۇرچە‎",
    flag: `https://flagcdn.com/w80/cn.png`,
  },
  uk: {
    languageCode: "uk",
    englishName: "Ukrainian",
    nativeName: "українська",
    flag: `https://flagcdn.com/w80/ua.png`,
  },
  ur: {
    languageCode: "ur",
    englishName: "Urdu",
    nativeName: "اردو",
    flag: `https://flagcdn.com/w80/pk.png`,
  },
  uz: {
    languageCode: "uz",
    englishName: "Uzbek",
    nativeName: "Oʻzbek",
    flag: `https://flagcdn.com/w80/uz.png`,
  },
  vi: {
    languageCode: "vi",
    englishName: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: `https://flagcdn.com/w80/vn.png`,
  },
  cy: {
    languageCode: "cy",
    englishName: "Welsh",
    nativeName: "Cymraeg",
    flag: `https://flagcdn.com/w80/gb.png`,
  },
  fy: {
    languageCode: "fy",
    englishName: "Western Frisian",
    nativeName: "Frysk",
    flag: `https://flagcdn.com/w80/nl.png`,
  },
  xh: {
    languageCode: "xh",
    englishName: "Xhosa",
    nativeName: "isiXhosa",
    flag: `https://flagcdn.com/w80/za.png`,
  },
  yi: {
    languageCode: "yi",
    englishName: "Yiddish",
    nativeName: "ייִדיש",
    flag: `https://flagcdn.com/w80/il.png`,
  },
  yo: {
    languageCode: "yo",
    englishName: "Yoruba",
    nativeName: "Yorùbá",
    flag: `https://flagcdn.com/w80/ng.png`,
  },
};

export const fullLanguagesList: LanguageInfo[] = Object.keys(fullLanguagesMap)
  .sort((a, b) => a.localeCompare(b))
  .map((key) => {
    const nativeKey = key as unknown as NativeLangCode;
    return fullLanguagesMap[nativeKey];
  });
