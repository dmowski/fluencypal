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

// TODO: ALL NativeLangCode should be represented here

export const fullLanguages: LanguageInfo[] = [
  {
    languageCode: "ab",
    englishName: "Abkhaz",
    nativeName: "аҧсуа",
    flag: `https://flagcdn.com/w80/ge.png`,
  },

  {
    languageCode: "af",
    englishName: "Afrikaans",
    nativeName: "Afrikaans",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    languageCode: "ak",
    englishName: "Akan",
    nativeName: "Akan",
    flag: `https://flagcdn.com/w80/gh.png`, // Ghana
  },
  {
    languageCode: "sq",
    englishName: "Albanian",
    nativeName: "Shqip",
    flag: `https://flagcdn.com/w80/al.png`, // Albania
  },
  {
    languageCode: "am",
    englishName: "Amharic",
    nativeName: "አማርኛ",
    flag: `https://flagcdn.com/w80/et.png`, // Ethiopia
  },
  {
    languageCode: "ar",
    englishName: "Arabic",
    nativeName: "العربية",
    // Arabic is used in many countries; Saudi Arabia’s flag is a common default
    flag: `https://flagcdn.com/w80/sa.png`,
  },

  {
    languageCode: "hy",
    englishName: "Armenian",
    nativeName: "Հայերեն",
    flag: `https://flagcdn.com/w80/am.png`, // Armenia
  },
  {
    languageCode: "as",
    englishName: "Assamese",
    nativeName: "অসমীয়া",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "ay",
    englishName: "Aymara",
    nativeName: "aymar aru",
    // Official in Bolivia (and Peru); Bolivia chosen
    flag: `https://flagcdn.com/w80/bo.png`,
  },
  {
    languageCode: "az",
    englishName: "Azerbaijani",
    nativeName: "azərbaycan dili",
    flag: `https://flagcdn.com/w80/az.png`, // Azerbaijan
  },
  {
    languageCode: "bm",
    englishName: "Bambara",
    nativeName: "bamanankan",
    flag: `https://flagcdn.com/w80/ml.png`, // Mali – Bambara is a national language
  },
  {
    languageCode: "ba",
    englishName: "Bashkir",
    nativeName: "башҡорт теле",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Republic of Bashkortostan)
  },
  {
    languageCode: "eu",
    englishName: "Basque",
    nativeName: "euskara, euskera",
    flag: `https://flagcdn.com/w80/es.png`, // Spain (Basque Country)
  },
  {
    languageCode: "be",
    englishName: "Belarusian",
    nativeName: "Беларуская",
    flag: `https://flagcdn.com/w80/by.png`, // Belarus (unchanged from your original)
  },
  {
    languageCode: "bn",
    englishName: "Bengali",
    nativeName: "বাংলা",
    flag: `https://flagcdn.com/w80/bd.png`, // Bangladesh – Bengali is the sole official language
  },
  {
    languageCode: "bs",
    englishName: "Bosnian",
    nativeName: "bosanski jezik",
    flag: `https://flagcdn.com/w80/ba.png`, // Bosnia & Herzegovina
  },
  {
    languageCode: "br",
    englishName: "Breton",
    nativeName: "brezhoneg",
    flag: `https://flagcdn.com/w80/fr.png`, // France (region of Brittany)
  },
  {
    languageCode: "bg",
    englishName: "Bulgarian",
    nativeName: "български език",
    flag: `https://flagcdn.com/w80/bg.png`, // Bulgaria
  },
  {
    languageCode: "my",
    englishName: "Burmese",
    nativeName: "ဗမာစာ",
    flag: `https://flagcdn.com/w80/mm.png`, // Myanmar (ISO-3166 “mm”)
  },
  {
    languageCode: "ca",
    englishName: "Catalan; Valencian",
    nativeName: "Català",
    // Catalan is co-official in Spain but the only nationwide official in Andorra
    flag: `https://flagcdn.com/w80/ad.png`, // Andorra
  },
  {
    languageCode: "ny",
    englishName: "Chichewa; Chewa; Nyanja",
    nativeName: "chiCheŵa, chinyanja",
    flag: `https://flagcdn.com/w80/mw.png`, // Malawi – Chichewa is national language
  },
  {
    languageCode: "zh",
    englishName: "Chinese",
    nativeName: "中文 (Zhōngwén), 汉语, 漢語",
    flag: `https://flagcdn.com/w80/cn.png`, // China (standard default for “Chinese”)
  },
  {
    languageCode: "cv",
    englishName: "Chuvash",
    nativeName: "чӑваш чӗлхи",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Chuvash Republic)
  },
  {
    languageCode: "co",
    englishName: "Corsican",
    nativeName: "corsu, lingua corsa",
    flag: `https://flagcdn.com/w80/fr.png`, // France (island of Corsica)
  },
  {
    languageCode: "hr",
    englishName: "Croatian",
    nativeName: "hrvatski",
    flag: `https://flagcdn.com/w80/hr.png`, // Croatia
  },
  {
    languageCode: "cs",
    englishName: "Czech",
    nativeName: "česky, čeština",
    flag: `https://flagcdn.com/w80/cz.png`, // Czechia
  },
  {
    languageCode: "da",
    englishName: "Danish",
    nativeName: "dansk",
    flag: `https://flagcdn.com/w80/dk.png`, // Denmark
  },
  {
    languageCode: "dv",
    englishName: "Divehi; Dhivehi; Maldivian",
    nativeName: "ދިވެހި",
    flag: `https://flagcdn.com/w80/mv.png`, // Maldives
  },
  {
    languageCode: "nl",
    englishName: "Dutch",
    nativeName: "Nederlands, Vlaams",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    languageCode: "en",
    englishName: "English",
    nativeName: "English",
    // Many pickers use the UK flag; swap to `us` if you prefer
    flag: `https://flagcdn.com/w80/us.png`,
  },
  {
    languageCode: "eo",
    englishName: "Esperanto",
    nativeName: "Esperanto",
    // Constructed language — UN flag is a common fallback
    flag: `https://flagcdn.com/w80/un.png`,
  },
  {
    languageCode: "et",
    englishName: "Estonian",
    nativeName: "eesti, eesti keel",
    flag: `https://flagcdn.com/w80/ee.png`, // Estonia
  },
  {
    languageCode: "ee",
    englishName: "Ewe",
    nativeName: "Eʋegbe",
    // Spoken in both Ghana & Togo — Ghana chosen
    flag: `https://flagcdn.com/w80/gh.png`,
  },
  {
    languageCode: "fj",
    englishName: "Fijian",
    nativeName: "vosa Vakaviti",
    flag: `https://flagcdn.com/w80/fj.png`, // Fiji
  },
  {
    languageCode: "fi",
    englishName: "Finnish",
    nativeName: "suomi, suomen kieli",
    flag: `https://flagcdn.com/w80/fi.png`, // Finland
  },
  {
    languageCode: "fr",
    englishName: "French",
    nativeName: "français, langue française",
    flag: `https://flagcdn.com/w80/fr.png`, // France
  },
  {
    languageCode: "ff",
    englishName: "Fula; Fulah; Pulaar; Pular",
    nativeName: "Fulfulde, Pulaar, Pular",
    // Official in several West-African states — Senegal is a common default
    flag: `https://flagcdn.com/w80/sn.png`,
  },
  {
    languageCode: "gl",
    englishName: "Galician",
    nativeName: "Galego",
    flag: `https://flagcdn.com/w80/es.png`, // Spain
  },
  {
    languageCode: "ka",
    englishName: "Georgian",
    nativeName: "ქართული",
    flag: `https://flagcdn.com/w80/ge.png`, // Georgia
  },
  {
    languageCode: "de",
    englishName: "German",
    nativeName: "Deutsch",
    flag: `https://flagcdn.com/w80/de.png`, // Germany
  },
  {
    languageCode: "el",
    englishName: "Greek, Modern",
    nativeName: "Ελληνικά",
    flag: `https://flagcdn.com/w80/gr.png`, // Greece
  },
  {
    languageCode: "gn",
    englishName: "Guaraní",
    nativeName: "Avañeẽ",
    flag: `https://flagcdn.com/w80/py.png`, // Paraguay
  },
  {
    languageCode: "gu",
    englishName: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "ht",
    englishName: "Haitian; Haitian Creole",
    nativeName: "Kreyòl ayisyen",
    flag: `https://flagcdn.com/w80/ht.png`, // Haiti
  },
  {
    languageCode: "ha",
    englishName: "Hausa",
    nativeName: "Hausa, هَوُسَ",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    languageCode: "he",
    englishName: "Hebrew (modern)",
    nativeName: "עברית",
    flag: `https://flagcdn.com/w80/il.png`, // Israel
  },
  {
    languageCode: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी, हिंदी",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "hu",
    englishName: "Hungarian",
    nativeName: "Magyar",
    flag: `https://flagcdn.com/w80/hu.png`, // Hungary
  },
  {
    languageCode: "id",
    englishName: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    languageCode: "ga",
    englishName: "Irish",
    nativeName: "Gaeilge",
    flag: `https://flagcdn.com/w80/ie.png`, // Ireland
  },
  {
    languageCode: "ig",
    englishName: "Igbo",
    nativeName: "Asụsụ Igbo",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    languageCode: "is",
    englishName: "Icelandic",
    nativeName: "Íslenska",
    flag: `https://flagcdn.com/w80/is.png`, // Iceland
  },
  {
    languageCode: "it",
    englishName: "Italian",
    nativeName: "Italiano",
    flag: `https://flagcdn.com/w80/it.png`, // Italy
  },
  {
    languageCode: "ja",
    englishName: "Japanese",
    nativeName: "日本語 (にほんご／にっぽんご)",
    flag: `https://flagcdn.com/w80/jp.png`, // Japan
  },
  {
    languageCode: "jv",
    englishName: "Javanese",
    nativeName: "basa Jawa",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    languageCode: "kn",
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "kk",
    englishName: "Kazakh",
    nativeName: "Қазақ тілі",
    flag: `https://flagcdn.com/w80/kz.png`, // Kazakhstan
  },
  {
    languageCode: "km",
    englishName: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    flag: `https://flagcdn.com/w80/kh.png`, // Cambodia
  },
  {
    languageCode: "rw",
    englishName: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
    flag: `https://flagcdn.com/w80/rw.png`, // Rwanda
  },
  {
    languageCode: "ky",
    englishName: "Kirghiz, Kyrgyz",
    nativeName: "кыргыз тили",
    flag: `https://flagcdn.com/w80/kg.png`, // Kyrgyzstan
  },
  {
    languageCode: "ko",
    englishName: "Korean",
    nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
    flag: `https://flagcdn.com/w80/kr.png`, // South Korea
  },
  {
    languageCode: "ku",
    englishName: "Kurdish",
    nativeName: "Kurdî, كوردی‎",
    flag: `https://flagcdn.com/w80/iq.png`, // Iraq (Kurdistan Region)
  },
  {
    languageCode: "la",
    englishName: "Latin",
    nativeName: "latine, lingua latina",
    flag: `https://flagcdn.com/w80/va.png`, // Vatican City
  },
  {
    languageCode: "lb",
    englishName: "Luxembourgish, Letzeburgesch",
    nativeName: "Lëtzebuergesch",
    flag: `https://flagcdn.com/w80/lu.png`, // Luxembourg
  },
  {
    languageCode: "lg",
    englishName: "Luganda",
    nativeName: "Luganda",
    flag: `https://flagcdn.com/w80/ug.png`, // Uganda
  },
  {
    languageCode: "li",
    englishName: "Limburgish, Limburgan, Limburger",
    nativeName: "Limburgs",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    languageCode: "ln",
    englishName: "Lingala",
    nativeName: "Lingála",
    flag: `https://flagcdn.com/w80/cd.png`, // DR Congo
  },
  {
    languageCode: "lo",
    englishName: "Lao",
    nativeName: "ພາສາລາວ",
    flag: `https://flagcdn.com/w80/la.png`, // Laos
  },
  {
    languageCode: "lt",
    englishName: "Lithuanian",
    nativeName: "lietuvių kalba",
    flag: `https://flagcdn.com/w80/lt.png`, // Lithuania
  },
  {
    languageCode: "lv",
    englishName: "Latvian",
    nativeName: "latviešu valoda",
    flag: `https://flagcdn.com/w80/lv.png`, // Latvia
  },
  {
    languageCode: "mk",
    englishName: "Macedonian",
    nativeName: "македонски јазик",
    flag: `https://flagcdn.com/w80/mk.png`, // North Macedonia
  },
  {
    languageCode: "mg",
    englishName: "Malagasy",
    nativeName: "Malagasy fiteny",
    flag: `https://flagcdn.com/w80/mg.png`, // Madagascar
  },
  {
    languageCode: "ms",
    englishName: "Malay",
    nativeName: "bahasa Melayu, بهاس ملايو‎",
    flag: `https://flagcdn.com/w80/my.png`, // Malaysia
  },
  {
    languageCode: "ml",
    englishName: "Malayalam",
    nativeName: "മലയാളം",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "mt",
    englishName: "Maltese",
    nativeName: "Malti",
    flag: `https://flagcdn.com/w80/mt.png`, // Malta
  },
  {
    languageCode: "mi",
    englishName: "Māori",
    nativeName: "te reo Māori",
    flag: `https://flagcdn.com/w80/nz.png`, // New Zealand
  },
  {
    languageCode: "mr",
    englishName: "Marathi (Marāṭhī)",
    nativeName: "मराठी",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "mn",
    englishName: "Mongolian",
    nativeName: "монгол",
    flag: `https://flagcdn.com/w80/mn.png`, // Mongolia
  },
  {
    languageCode: "ne",
    englishName: "Nepali",
    nativeName: "नेपाली",
    flag: `https://flagcdn.com/w80/np.png`, // Nepal
  },
  {
    languageCode: "no",
    englishName: "Norwegian",
    nativeName: "Norsk",
    flag: `https://flagcdn.com/w80/no.png`, // Norway
  },
  {
    languageCode: "nr",
    englishName: "South Ndebele",
    nativeName: "isiNdebele",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    languageCode: "oc",
    englishName: "Occitan",
    nativeName: "Occitan",
    flag: `https://flagcdn.com/w80/fr.png`, // France
  },
  {
    languageCode: "om",
    englishName: "Oromo",
    nativeName: "Afaan Oromoo",
    flag: `https://flagcdn.com/w80/et.png`, // Ethiopia
  },
  {
    languageCode: "or",
    englishName: "Oriya",
    nativeName: "ଓଡ଼ିଆ",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "pa",
    englishName: "Panjabi, Punjabi",
    nativeName: "ਪੰਜਾਬੀ, پنجابی‎",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    languageCode: "fa",
    englishName: "Persian",
    nativeName: "فارسی",
    flag: `https://flagcdn.com/w80/ir.png`, // Iran
  },
  {
    languageCode: "pl",
    englishName: "Polish",
    nativeName: "polski",
    flag: `https://flagcdn.com/w80/pl.png`, // Poland
  },
  {
    languageCode: "ps",
    englishName: "Pashto, Pushto",
    nativeName: "پښتو",
    flag: `https://flagcdn.com/w80/af.png`, // Afghanistan
  },
  {
    languageCode: "pt",
    englishName: "Portuguese",
    nativeName: "Português",
    flag: `https://flagcdn.com/w80/pt.png`, // Portugal
  },
  {
    languageCode: "qu",
    englishName: "Quechua",
    nativeName: "Runa Simi, Kichwa",
    flag: `https://flagcdn.com/w80/pe.png`, // Peru
  },
  {
    languageCode: "rn",
    englishName: "Kirundi",
    nativeName: "kiRundi",
    flag: `https://flagcdn.com/w80/bi.png`, // Burundi
  },
  {
    languageCode: "ro",
    englishName: "Romanian",
    nativeName: "română",
    flag: `https://flagcdn.com/w80/ro.png`, // Romania
  },
  {
    languageCode: "ru",
    englishName: "Russian",
    nativeName: "русский",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia
  },
  {
    languageCode: "sa",
    englishName: "Sanskrit",
    nativeName: "संस्कृतम्",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "sd",
    englishName: "Sindhi",
    nativeName: "سندھی‎",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    languageCode: "sm",
    englishName: "Samoan",
    nativeName: "gagana faa Samoa",
    flag: `https://flagcdn.com/w80/ws.png`, // Samoa
  },
  {
    languageCode: "sg",
    englishName: "Sango",
    nativeName: "yângâ tî sängö",
    flag: `https://flagcdn.com/w80/cf.png`, // Central African Republic
  },
  {
    languageCode: "sr",
    englishName: "Serbian",
    nativeName: "српски језик",
    flag: `https://flagcdn.com/w80/rs.png`, // Serbia
  },
  {
    languageCode: "gd",
    englishName: "Scottish Gaelic",
    nativeName: "Gàidhlig",
    flag: `https://flagcdn.com/w80/gb.png`, // United Kingdom
  },
  {
    languageCode: "sn",
    englishName: "Shona",
    nativeName: "chiShona",
    flag: `https://flagcdn.com/w80/zw.png`, // Zimbabwe
  },
  {
    languageCode: "si",
    englishName: "Sinhala",
    nativeName: "සිංහල",
    flag: `https://flagcdn.com/w80/lk.png`, // Sri Lanka
  },
  {
    languageCode: "sk",
    englishName: "Slovak",
    nativeName: "slovenčina",
    flag: `https://flagcdn.com/w80/sk.png`, // Slovakia
  },
  {
    languageCode: "sl",
    englishName: "Slovene",
    nativeName: "slovenščina",
    flag: `https://flagcdn.com/w80/si.png`, // Slovenia
  },
  {
    languageCode: "so",
    englishName: "Somali",
    nativeName: "Soomaaliga, af Soomaali",
    flag: `https://flagcdn.com/w80/so.png`, // Somalia
  },
  {
    languageCode: "st",
    englishName: "Southern Sotho",
    nativeName: "Sesotho",
    flag: `https://flagcdn.com/w80/ls.png`, // Lesotho
  },
  {
    languageCode: "es",
    englishName: "Spanish",
    nativeName: "español, castellano",
    flag: `https://flagcdn.com/w80/es.png`, // Spain
  },
  {
    languageCode: "su",
    englishName: "Sundanese",
    nativeName: "Basa Sunda",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    languageCode: "sw",
    englishName: "Swahili",
    nativeName: "Kiswahili",
    flag: `https://flagcdn.com/w80/tz.png`, // Tanzania
  },
  {
    languageCode: "ss",
    englishName: "Swati",
    nativeName: "SiSwati",
    flag: `https://flagcdn.com/w80/sz.png`, // Eswatini
  },
  {
    languageCode: "sv",
    englishName: "Swedish",
    nativeName: "svenska",
    flag: `https://flagcdn.com/w80/se.png`, // Sweden
  },
  {
    languageCode: "ta",
    englishName: "Tamil",
    nativeName: "தமிழ்",
    flag: `https://flagcdn.com/w80/in.png`, // India (Tamil Nadu)
  },
  {
    languageCode: "te",
    englishName: "Telugu",
    nativeName: "తెలుగు",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    languageCode: "tg",
    englishName: "Tajik",
    nativeName: "тоҷикӣ",
    flag: `https://flagcdn.com/w80/tj.png`, // Tajikistan
  },
  {
    languageCode: "th",
    englishName: "Thai",
    nativeName: "ไทย",
    flag: `https://flagcdn.com/w80/th.png`, // Thailand
  },
  {
    languageCode: "ti",
    englishName: "Tigrinya",
    nativeName: "ትግርኛ",
    flag: `https://flagcdn.com/w80/er.png`, // Eritrea
  },
  {
    languageCode: "tk",
    englishName: "Turkmen",
    nativeName: "Türkmen",
    flag: `https://flagcdn.com/w80/tm.png`, // Turkmenistan
  },
  {
    languageCode: "tl",
    englishName: "Tagalog",
    nativeName: "Wikang Tagalog",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  {
    languageCode: "tn",
    englishName: "Tswana",
    nativeName: "Setswana",
    flag: `https://flagcdn.com/w80/bw.png`, // Botswana
  },
  {
    languageCode: "tr",
    englishName: "Turkish",
    nativeName: "Türkçe",
    flag: `https://flagcdn.com/w80/tr.png`, // Turkey
  },
  {
    languageCode: "ts",
    englishName: "Tsonga",
    nativeName: "Xitsonga",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    languageCode: "tt",
    englishName: "Tatar",
    nativeName: "татарча",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia
  },
  {
    languageCode: "ug",
    englishName: "Uyghur",
    nativeName: "ئۇيغۇرچە‎",
    flag: `https://flagcdn.com/w80/cn.png`, // China (Xinjiang)
  },
  {
    languageCode: "uk",
    englishName: "Ukrainian",
    nativeName: "українська",
    flag: `https://flagcdn.com/w80/ua.png`, // Ukraine
  },
  {
    languageCode: "ur",
    englishName: "Urdu",
    nativeName: "اردو",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    languageCode: "uz",
    englishName: "Uzbek",
    nativeName: "Oʻzbek",
    flag: `https://flagcdn.com/w80/uz.png`, // Uzbekistan
  },
  {
    languageCode: "vi",
    englishName: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: `https://flagcdn.com/w80/vn.png`, // Vietnam
  },
  {
    languageCode: "cy",
    englishName: "Welsh",
    nativeName: "Cymraeg",
    flag: `https://flagcdn.com/w80/gb.png`, // United Kingdom (Wales)
  },
  {
    languageCode: "fy",
    englishName: "Western Frisian",
    nativeName: "Frysk",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    languageCode: "xh",
    englishName: "Xhosa",
    nativeName: "isiXhosa",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    languageCode: "yi",
    englishName: "Yiddish",
    nativeName: "ייִדיש",
    flag: `https://flagcdn.com/w80/il.png`, // Israel
  },
  {
    languageCode: "yo",
    englishName: "Yoruba",
    nativeName: "Yorùbá",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
];
