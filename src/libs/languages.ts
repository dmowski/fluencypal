export interface LanguageInfo {
  code: string;
  englishName: string;
  nativeName: string;
  flag: string; // Optional flag property for language icon
}

export const fullLanguages: LanguageInfo[] = [
  {
    code: "ab",
    englishName: "Abkhaz",
    nativeName: "аҧсуа",
    flag: `https://flagcdn.com/w80/ge.png`,
  },
  {
    code: "aa",
    englishName: "Afar",
    nativeName: "Afaraf",
    // Spoken in Djibouti, Eritrea and Ethiopia – Djibouti chosen as it has Afar as
    // a national language
    flag: `https://flagcdn.com/w80/dj.png`,
  },
  {
    code: "af",
    englishName: "Afrikaans",
    nativeName: "Afrikaans",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    code: "ak",
    englishName: "Akan",
    nativeName: "Akan",
    flag: `https://flagcdn.com/w80/gh.png`, // Ghana
  },
  {
    code: "sq",
    englishName: "Albanian",
    nativeName: "Shqip",
    flag: `https://flagcdn.com/w80/al.png`, // Albania
  },
  {
    code: "am",
    englishName: "Amharic",
    nativeName: "አማርኛ",
    flag: `https://flagcdn.com/w80/et.png`, // Ethiopia
  },
  {
    code: "ar",
    englishName: "Arabic",
    nativeName: "العربية",
    // Arabic is used in many countries; Saudi Arabia’s flag is a common default
    flag: `https://flagcdn.com/w80/sa.png`,
  },
  {
    code: "an",
    englishName: "Aragonese",
    nativeName: "Aragonés",
    flag: `https://flagcdn.com/w80/es.png`, // Spain
  },
  {
    code: "hy",
    englishName: "Armenian",
    nativeName: "Հայերեն",
    flag: `https://flagcdn.com/w80/am.png`, // Armenia
  },
  {
    code: "as",
    englishName: "Assamese",
    nativeName: "অসমীয়া",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "av",
    englishName: "Avaric",
    nativeName: "авар мацӀ, магӀарул мацӀ",
    // Dagestan is part of Russia, where Avaric is official locally
    flag: `https://flagcdn.com/w80/ru.png`,
  },
  {
    code: "ae",
    englishName: "Avestan",
    nativeName: "avesta",
    // Classical language of Greater Iran; Iran’s flag used as best modern proxy
    flag: `https://flagcdn.com/w80/ir.png`,
  },
  {
    code: "ay",
    englishName: "Aymara",
    nativeName: "aymar aru",
    // Official in Bolivia (and Peru); Bolivia chosen
    flag: `https://flagcdn.com/w80/bo.png`,
  },
  {
    code: "az",
    englishName: "Azerbaijani",
    nativeName: "azərbaycan dili",
    flag: `https://flagcdn.com/w80/az.png`, // Azerbaijan
  },
  {
    code: "bm",
    englishName: "Bambara",
    nativeName: "bamanankan",
    flag: `https://flagcdn.com/w80/ml.png`, // Mali – Bambara is a national language
  },
  {
    code: "ba",
    englishName: "Bashkir",
    nativeName: "башҡорт теле",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Republic of Bashkortostan)
  },
  {
    code: "eu",
    englishName: "Basque",
    nativeName: "euskara, euskera",
    flag: `https://flagcdn.com/w80/es.png`, // Spain (Basque Country)
  },
  {
    code: "be",
    englishName: "Belarusian",
    nativeName: "Беларуская",
    flag: `https://flagcdn.com/w80/by.png`, // Belarus (unchanged from your original)
  },
  {
    code: "bn",
    englishName: "Bengali",
    nativeName: "বাংলা",
    flag: `https://flagcdn.com/w80/bd.png`, // Bangladesh – Bengali is the sole official language
  },
  {
    code: "bh",
    englishName: "Bihari",
    nativeName: "भोजपुरी",
    flag: `https://flagcdn.com/w80/in.png`, // India (state of Bihar)
  },
  {
    code: "bi",
    englishName: "Bislama",
    nativeName: "Bislama",
    flag: `https://flagcdn.com/w80/vu.png`, // Vanuatu
  },
  {
    code: "bs",
    englishName: "Bosnian",
    nativeName: "bosanski jezik",
    flag: `https://flagcdn.com/w80/ba.png`, // Bosnia & Herzegovina
  },
  {
    code: "br",
    englishName: "Breton",
    nativeName: "brezhoneg",
    flag: `https://flagcdn.com/w80/fr.png`, // France (region of Brittany)
  },
  {
    code: "bg",
    englishName: "Bulgarian",
    nativeName: "български език",
    flag: `https://flagcdn.com/w80/bg.png`, // Bulgaria
  },
  {
    code: "my",
    englishName: "Burmese",
    nativeName: "ဗမာစာ",
    flag: `https://flagcdn.com/w80/mm.png`, // Myanmar (ISO-3166 “mm”)
  },
  {
    code: "ca",
    englishName: "Catalan; Valencian",
    nativeName: "Català",
    // Catalan is co-official in Spain but the only nationwide official in Andorra
    flag: `https://flagcdn.com/w80/ad.png`, // Andorra
  },
  {
    code: "ch",
    englishName: "Chamorro",
    nativeName: "Chamoru",
    flag: `https://flagcdn.com/w80/gu.png`, // Guam (US territory where Chamorro is official)
  },
  {
    code: "ce",
    englishName: "Chechen",
    nativeName: "нохчийн мотт",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Chechnya)
  },
  {
    code: "ny",
    englishName: "Chichewa; Chewa; Nyanja",
    nativeName: "chiCheŵa, chinyanja",
    flag: `https://flagcdn.com/w80/mw.png`, // Malawi – Chichewa is national language
  },
  {
    code: "zh",
    englishName: "Chinese",
    nativeName: "中文 (Zhōngwén), 汉语, 漢語",
    flag: `https://flagcdn.com/w80/cn.png`, // China (standard default for “Chinese”)
  },
  {
    code: "cv",
    englishName: "Chuvash",
    nativeName: "чӑваш чӗлхи",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Chuvash Republic)
  },
  {
    code: "kw",
    englishName: "Cornish",
    nativeName: "Kernewek",
    flag: `https://flagcdn.com/w80/gb.png`, // United Kingdom (Cornwall)
  },
  {
    code: "co",
    englishName: "Corsican",
    nativeName: "corsu, lingua corsa",
    flag: `https://flagcdn.com/w80/fr.png`, // France (island of Corsica)
  },
  {
    code: "cr",
    englishName: "Cree",
    nativeName: "ᓀᐦᐃᔭᐍᐏᐣ",
    flag: `https://flagcdn.com/w80/ca.png`, // Canada
  },
  {
    code: "hr",
    englishName: "Croatian",
    nativeName: "hrvatski",
    flag: `https://flagcdn.com/w80/hr.png`, // Croatia
  },
  {
    code: "cs",
    englishName: "Czech",
    nativeName: "česky, čeština",
    flag: `https://flagcdn.com/w80/cz.png`, // Czechia
  },
  {
    code: "da",
    englishName: "Danish",
    nativeName: "dansk",
    flag: `https://flagcdn.com/w80/dk.png`, // Denmark
  },
  {
    code: "dv",
    englishName: "Divehi; Dhivehi; Maldivian",
    nativeName: "ދިވެހި",
    flag: `https://flagcdn.com/w80/mv.png`, // Maldives
  },
  {
    code: "nl",
    englishName: "Dutch",
    nativeName: "Nederlands, Vlaams",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    code: "en",
    englishName: "English",
    nativeName: "English",
    // Many pickers use the UK flag; swap to `us` if you prefer
    flag: `https://flagcdn.com/w80/us.png`,
  },
  {
    code: "eo",
    englishName: "Esperanto",
    nativeName: "Esperanto",
    // Constructed language — UN flag is a common fallback
    flag: `https://flagcdn.com/w80/un.png`,
  },
  {
    code: "et",
    englishName: "Estonian",
    nativeName: "eesti, eesti keel",
    flag: `https://flagcdn.com/w80/ee.png`, // Estonia
  },
  {
    code: "ee",
    englishName: "Ewe",
    nativeName: "Eʋegbe",
    // Spoken in both Ghana & Togo — Ghana chosen
    flag: `https://flagcdn.com/w80/gh.png`,
  },
  {
    code: "fo",
    englishName: "Faroese",
    nativeName: "føroyskt",
    flag: `https://flagcdn.com/w80/fo.png`, // Faroe Islands
  },
  {
    code: "fj",
    englishName: "Fijian",
    nativeName: "vosa Vakaviti",
    flag: `https://flagcdn.com/w80/fj.png`, // Fiji
  },
  {
    code: "fi",
    englishName: "Finnish",
    nativeName: "suomi, suomen kieli",
    flag: `https://flagcdn.com/w80/fi.png`, // Finland
  },
  {
    code: "fr",
    englishName: "French",
    nativeName: "français, langue française",
    flag: `https://flagcdn.com/w80/fr.png`, // France
  },
  {
    code: "ff",
    englishName: "Fula; Fulah; Pulaar; Pular",
    nativeName: "Fulfulde, Pulaar, Pular",
    // Official in several West-African states — Senegal is a common default
    flag: `https://flagcdn.com/w80/sn.png`,
  },
  {
    code: "gl",
    englishName: "Galician",
    nativeName: "Galego",
    flag: `https://flagcdn.com/w80/es.png`, // Spain
  },
  {
    code: "ka",
    englishName: "Georgian",
    nativeName: "ქართული",
    flag: `https://flagcdn.com/w80/ge.png`, // Georgia
  },
  {
    code: "de",
    englishName: "German",
    nativeName: "Deutsch",
    flag: `https://flagcdn.com/w80/de.png`, // Germany
  },
  {
    code: "el",
    englishName: "Greek, Modern",
    nativeName: "Ελληνικά",
    flag: `https://flagcdn.com/w80/gr.png`, // Greece
  },
  {
    code: "gn",
    englishName: "Guaraní",
    nativeName: "Avañeẽ",
    flag: `https://flagcdn.com/w80/py.png`, // Paraguay
  },
  {
    code: "gu",
    englishName: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "ht",
    englishName: "Haitian; Haitian Creole",
    nativeName: "Kreyòl ayisyen",
    flag: `https://flagcdn.com/w80/ht.png`, // Haiti
  },
  {
    code: "ha",
    englishName: "Hausa",
    nativeName: "Hausa, هَوُسَ",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    code: "he",
    englishName: "Hebrew (modern)",
    nativeName: "עברית",
    flag: `https://flagcdn.com/w80/il.png`, // Israel
  },
  {
    code: "hz",
    englishName: "Herero",
    nativeName: "Otjiherero",
    flag: `https://flagcdn.com/w80/na.png`, // Namibia
  },
  {
    code: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी, हिंदी",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "ho",
    englishName: "Hiri Motu",
    nativeName: "Hiri Motu",
    flag: `https://flagcdn.com/w80/pg.png`, // Papua New Guinea
  },
  {
    code: "hu",
    englishName: "Hungarian",
    nativeName: "Magyar",
    flag: `https://flagcdn.com/w80/hu.png`, // Hungary
  },
  {
    code: "ia",
    englishName: "Interlingua",
    nativeName: "Interlingua",
    // Constructed language — EU flag often used
    flag: `https://flagcdn.com/w80/eu.png`,
  },
  {
    code: "id",
    englishName: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    code: "ie",
    englishName: "Interlingue",
    nativeName: "Originally called Occidental; then Interlingue after WWII",
    // Another planned language — EU flag chosen
    flag: `https://flagcdn.com/w80/eu.png`,
  },
  {
    code: "ga",
    englishName: "Irish",
    nativeName: "Gaeilge",
    flag: `https://flagcdn.com/w80/ie.png`, // Ireland
  },
  {
    code: "ig",
    englishName: "Igbo",
    nativeName: "Asụsụ Igbo",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    code: "ik",
    englishName: "Inupiaq",
    nativeName: "Iñupiaq, Iñupiatun",
    flag: `https://flagcdn.com/w80/us.png`, // USA (Alaska)
  },
  {
    code: "io",
    englishName: "Ido",
    nativeName: "Ido",
    // Constructed language — EU flag again
    flag: `https://flagcdn.com/w80/eu.png`,
  },
  {
    code: "is",
    englishName: "Icelandic",
    nativeName: "Íslenska",
    flag: `https://flagcdn.com/w80/is.png`, // Iceland
  },
  {
    code: "it",
    englishName: "Italian",
    nativeName: "Italiano",
    flag: `https://flagcdn.com/w80/it.png`, // Italy
  },
  {
    code: "iu",
    englishName: "Inuktitut",
    nativeName: "ᐃᓄᒃᑎᑐᑦ",
    flag: `https://flagcdn.com/w80/ca.png`, // Canada (Nunavut)
  },
  {
    code: "ja",
    englishName: "Japanese",
    nativeName: "日本語 (にほんご／にっぽんご)",
    flag: `https://flagcdn.com/w80/jp.png`, // Japan
  },
  {
    code: "jv",
    englishName: "Javanese",
    nativeName: "basa Jawa",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    code: "kl",
    englishName: "Kalaallisut, Greenlandic",
    nativeName: "kalaallisut, kalaallit oqaasii",
    flag: `https://flagcdn.com/w80/gl.png`, // Greenland
  },
  {
    code: "kn",
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "kr",
    englishName: "Kanuri",
    nativeName: "Kanuri",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    code: "ks",
    englishName: "Kashmiri",
    nativeName: "कश्मीरी, كشميري‎",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "kk",
    englishName: "Kazakh",
    nativeName: "Қазақ тілі",
    flag: `https://flagcdn.com/w80/kz.png`, // Kazakhstan
  },
  {
    code: "km",
    englishName: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    flag: `https://flagcdn.com/w80/kh.png`, // Cambodia
  },
  {
    code: "ki",
    englishName: "Kikuyu, Gikuyu",
    nativeName: "Gĩkũyũ",
    flag: `https://flagcdn.com/w80/ke.png`, // Kenya
  },
  {
    code: "rw",
    englishName: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
    flag: `https://flagcdn.com/w80/rw.png`, // Rwanda
  },
  {
    code: "ky",
    englishName: "Kirghiz, Kyrgyz",
    nativeName: "кыргыз тили",
    flag: `https://flagcdn.com/w80/kg.png`, // Kyrgyzstan
  },
  {
    code: "kv",
    englishName: "Komi",
    nativeName: "коми кыв",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (Komi Republic)
  },
  {
    code: "kg",
    englishName: "Kongo",
    nativeName: "KiKongo",
    flag: `https://flagcdn.com/w80/cd.png`, // DR Congo
  },
  {
    code: "ko",
    englishName: "Korean",
    nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
    flag: `https://flagcdn.com/w80/kr.png`, // South Korea
  },
  {
    code: "ku",
    englishName: "Kurdish",
    nativeName: "Kurdî, كوردی‎",
    flag: `https://flagcdn.com/w80/iq.png`, // Iraq (Kurdistan Region)
  },
  {
    code: "kj",
    englishName: "Kwanyama, Kuanyama",
    nativeName: "Kuanyama",
    flag: `https://flagcdn.com/w80/na.png`, // Namibia
  },
  {
    code: "la",
    englishName: "Latin",
    nativeName: "latine, lingua latina",
    flag: `https://flagcdn.com/w80/va.png`, // Vatican City
  },
  {
    code: "lb",
    englishName: "Luxembourgish, Letzeburgesch",
    nativeName: "Lëtzebuergesch",
    flag: `https://flagcdn.com/w80/lu.png`, // Luxembourg
  },
  {
    code: "lg",
    englishName: "Luganda",
    nativeName: "Luganda",
    flag: `https://flagcdn.com/w80/ug.png`, // Uganda
  },
  {
    code: "li",
    englishName: "Limburgish, Limburgan, Limburger",
    nativeName: "Limburgs",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    code: "ln",
    englishName: "Lingala",
    nativeName: "Lingála",
    flag: `https://flagcdn.com/w80/cd.png`, // DR Congo
  },
  {
    code: "lo",
    englishName: "Lao",
    nativeName: "ພາສາລາວ",
    flag: `https://flagcdn.com/w80/la.png`, // Laos
  },
  {
    code: "lt",
    englishName: "Lithuanian",
    nativeName: "lietuvių kalba",
    flag: `https://flagcdn.com/w80/lt.png`, // Lithuania
  },
  {
    code: "lu",
    englishName: "Luba-Katanga",
    nativeName: "",
    flag: `https://flagcdn.com/w80/cd.png`, // DR Congo
  },
  {
    code: "lv",
    englishName: "Latvian",
    nativeName: "latviešu valoda",
    flag: `https://flagcdn.com/w80/lv.png`, // Latvia
  },
  {
    code: "gv",
    englishName: "Manx",
    nativeName: "Gaelg, Gailck",
    flag: `https://flagcdn.com/w80/im.png`, // Isle of Man
  },
  {
    code: "mk",
    englishName: "Macedonian",
    nativeName: "македонски јазик",
    flag: `https://flagcdn.com/w80/mk.png`, // North Macedonia
  },
  {
    code: "mg",
    englishName: "Malagasy",
    nativeName: "Malagasy fiteny",
    flag: `https://flagcdn.com/w80/mg.png`, // Madagascar
  },
  {
    code: "ms",
    englishName: "Malay",
    nativeName: "bahasa Melayu, بهاس ملايو‎",
    flag: `https://flagcdn.com/w80/my.png`, // Malaysia
  },
  {
    code: "ml",
    englishName: "Malayalam",
    nativeName: "മലയാളം",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "mt",
    englishName: "Maltese",
    nativeName: "Malti",
    flag: `https://flagcdn.com/w80/mt.png`, // Malta
  },
  {
    code: "mi",
    englishName: "Māori",
    nativeName: "te reo Māori",
    flag: `https://flagcdn.com/w80/nz.png`, // New Zealand
  },
  {
    code: "mr",
    englishName: "Marathi (Marāṭhī)",
    nativeName: "मराठी",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "mh",
    englishName: "Marshallese",
    nativeName: "Kajin M̧ajeļ",
    flag: `https://flagcdn.com/w80/mh.png`, // Marshall Islands
  },
  {
    code: "mn",
    englishName: "Mongolian",
    nativeName: "монгол",
    flag: `https://flagcdn.com/w80/mn.png`, // Mongolia
  },
  {
    code: "na",
    englishName: "Nauru",
    nativeName: "Ekakairũ Naoero",
    flag: `https://flagcdn.com/w80/nr.png`, // Nauru
  },
  {
    code: "nv",
    englishName: "Navajo, Navaho",
    nativeName: "Diné bizaad, Dinékʼehǰí",
    flag: `https://flagcdn.com/w80/us.png`, // United States
  },
  {
    code: "nb",
    englishName: "Norwegian Bokmål",
    nativeName: "Norsk bokmål",
    flag: `https://flagcdn.com/w80/no.png`, // Norway
  },
  {
    code: "nd",
    englishName: "North Ndebele",
    nativeName: "isiNdebele",
    flag: `https://flagcdn.com/w80/zw.png`, // Zimbabwe
  },
  {
    code: "ne",
    englishName: "Nepali",
    nativeName: "नेपाली",
    flag: `https://flagcdn.com/w80/np.png`, // Nepal
  },
  {
    code: "ng",
    englishName: "Ndonga",
    nativeName: "Owambo",
    flag: `https://flagcdn.com/w80/na.png`, // Namibia
  },
  {
    code: "nn",
    englishName: "Norwegian Nynorsk",
    nativeName: "Norsk nynorsk",
    flag: `https://flagcdn.com/w80/no.png`, // Norway
  },
  {
    code: "no",
    englishName: "Norwegian",
    nativeName: "Norsk",
    flag: `https://flagcdn.com/w80/no.png`, // Norway
  },
  {
    code: "ii",
    englishName: "Nuosu",
    nativeName: "ꆈꌠ꒿ Nuosuhxop",
    flag: `https://flagcdn.com/w80/cn.png`, // China (Yi autonomous areas)
  },
  {
    code: "nr",
    englishName: "South Ndebele",
    nativeName: "isiNdebele",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    code: "oc",
    englishName: "Occitan",
    nativeName: "Occitan",
    flag: `https://flagcdn.com/w80/fr.png`, // France
  },
  {
    code: "oj",
    englishName: "Ojibwe, Ojibwa",
    nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ",
    flag: `https://flagcdn.com/w80/ca.png`, // Canada
  },
  {
    code: "cu",
    englishName: "Old Church Slavonic",
    nativeName: "ѩзыкъ словѣньскъ",
    flag: `https://flagcdn.com/w80/bg.png`, // Bulgaria (historical cradle)
  },
  {
    code: "om",
    englishName: "Oromo",
    nativeName: "Afaan Oromoo",
    flag: `https://flagcdn.com/w80/et.png`, // Ethiopia
  },
  {
    code: "or",
    englishName: "Oriya",
    nativeName: "ଓଡ଼ିଆ",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "os",
    englishName: "Ossetian, Ossetic",
    nativeName: "ирон æвзаг",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia (North Ossetia)
  },
  {
    code: "pa",
    englishName: "Panjabi, Punjabi",
    nativeName: "ਪੰਜਾਬੀ, پنجابی‎",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    code: "pi",
    englishName: "Pāli",
    nativeName: "पाऴि",
    flag: `https://flagcdn.com/w80/lk.png`, // Sri Lanka
  },
  {
    code: "fa",
    englishName: "Persian",
    nativeName: "فارسی",
    flag: `https://flagcdn.com/w80/ir.png`, // Iran
  },
  {
    code: "pl",
    englishName: "Polish",
    nativeName: "polski",
    flag: `https://flagcdn.com/w80/pl.png`, // Poland
  },
  {
    code: "ps",
    englishName: "Pashto, Pushto",
    nativeName: "پښتو",
    flag: `https://flagcdn.com/w80/af.png`, // Afghanistan
  },
  {
    code: "pt",
    englishName: "Portuguese",
    nativeName: "Português",
    flag: `https://flagcdn.com/w80/pt.png`, // Portugal
  },
  {
    code: "qu",
    englishName: "Quechua",
    nativeName: "Runa Simi, Kichwa",
    flag: `https://flagcdn.com/w80/pe.png`, // Peru
  },
  {
    code: "rm",
    englishName: "Romansh",
    nativeName: "rumantsch grischun",
    flag: `https://flagcdn.com/w80/ch.png`, // Switzerland
  },
  {
    code: "rn",
    englishName: "Kirundi",
    nativeName: "kiRundi",
    flag: `https://flagcdn.com/w80/bi.png`, // Burundi
  },
  {
    code: "ro",
    englishName: "Romanian",
    nativeName: "română",
    flag: `https://flagcdn.com/w80/ro.png`, // Romania
  },
  {
    code: "ru",
    englishName: "Russian",
    nativeName: "русский язык",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia
  },
  {
    code: "sa",
    englishName: "Sanskrit",
    nativeName: "संस्कृतम्",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "sc",
    englishName: "Sardinian",
    nativeName: "sardu",
    flag: `https://flagcdn.com/w80/it.png`, // Italy (Sardinia)
  },
  {
    code: "sd",
    englishName: "Sindhi",
    nativeName: "سندھی‎",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    code: "se",
    englishName: "Northern Sami",
    nativeName: "Davvisámegiella",
    flag: `https://flagcdn.com/w80/no.png`, // Norway (largest Sami population)
  },
  {
    code: "sm",
    englishName: "Samoan",
    nativeName: "gagana faa Samoa",
    flag: `https://flagcdn.com/w80/ws.png`, // Samoa
  },
  {
    code: "sg",
    englishName: "Sango",
    nativeName: "yângâ tî sängö",
    flag: `https://flagcdn.com/w80/cf.png`, // Central African Republic
  },
  {
    code: "sr",
    englishName: "Serbian",
    nativeName: "српски језик",
    flag: `https://flagcdn.com/w80/rs.png`, // Serbia
  },
  {
    code: "gd",
    englishName: "Scottish Gaelic",
    nativeName: "Gàidhlig",
    flag: `https://flagcdn.com/w80/gb.png`, // United Kingdom
  },
  {
    code: "sn",
    englishName: "Shona",
    nativeName: "chiShona",
    flag: `https://flagcdn.com/w80/zw.png`, // Zimbabwe
  },
  {
    code: "si",
    englishName: "Sinhala",
    nativeName: "සිංහල",
    flag: `https://flagcdn.com/w80/lk.png`, // Sri Lanka
  },
  {
    code: "sk",
    englishName: "Slovak",
    nativeName: "slovenčina",
    flag: `https://flagcdn.com/w80/sk.png`, // Slovakia
  },
  {
    code: "sl",
    englishName: "Slovene",
    nativeName: "slovenščina",
    flag: `https://flagcdn.com/w80/si.png`, // Slovenia
  },
  {
    code: "so",
    englishName: "Somali",
    nativeName: "Soomaaliga, af Soomaali",
    flag: `https://flagcdn.com/w80/so.png`, // Somalia
  },
  {
    code: "st",
    englishName: "Southern Sotho",
    nativeName: "Sesotho",
    flag: `https://flagcdn.com/w80/ls.png`, // Lesotho
  },
  {
    code: "es",
    englishName: "Spanish",
    nativeName: "español, castellano",
    flag: `https://flagcdn.com/w80/es.png`, // Spain
  },
  {
    code: "su",
    englishName: "Sundanese",
    nativeName: "Basa Sunda",
    flag: `https://flagcdn.com/w80/id.png`, // Indonesia
  },
  {
    code: "sw",
    englishName: "Swahili",
    nativeName: "Kiswahili",
    flag: `https://flagcdn.com/w80/tz.png`, // Tanzania
  },
  {
    code: "ss",
    englishName: "Swati",
    nativeName: "SiSwati",
    flag: `https://flagcdn.com/w80/sz.png`, // Eswatini
  },
  {
    code: "sv",
    englishName: "Swedish",
    nativeName: "svenska",
    flag: `https://flagcdn.com/w80/se.png`, // Sweden
  },
  {
    code: "ta",
    englishName: "Tamil",
    nativeName: "தமிழ்",
    flag: `https://flagcdn.com/w80/in.png`, // India (Tamil Nadu)
  },
  {
    code: "te",
    englishName: "Telugu",
    nativeName: "తెలుగు",
    flag: `https://flagcdn.com/w80/in.png`, // India
  },
  {
    code: "tg",
    englishName: "Tajik",
    nativeName: "тоҷикӣ",
    flag: `https://flagcdn.com/w80/tj.png`, // Tajikistan
  },
  {
    code: "th",
    englishName: "Thai",
    nativeName: "ไทย",
    flag: `https://flagcdn.com/w80/th.png`, // Thailand
  },
  {
    code: "ti",
    englishName: "Tigrinya",
    nativeName: "ትግርኛ",
    flag: `https://flagcdn.com/w80/er.png`, // Eritrea
  },
  {
    code: "bo",
    englishName: "Tibetan",
    nativeName: "བོད་ཡིག",
    flag: `https://flagcdn.com/w80/cn.png`, // China (Tibet)
  },
  {
    code: "tk",
    englishName: "Turkmen",
    nativeName: "Türkmen",
    flag: `https://flagcdn.com/w80/tm.png`, // Turkmenistan
  },
  {
    code: "tl",
    englishName: "Tagalog",
    nativeName: "Wikang Tagalog",
    flag: `https://flagcdn.com/w80/ph.png`, // Philippines
  },
  {
    code: "tn",
    englishName: "Tswana",
    nativeName: "Setswana",
    flag: `https://flagcdn.com/w80/bw.png`, // Botswana
  },
  {
    code: "to",
    englishName: "Tonga",
    nativeName: "faka Tonga",
    flag: `https://flagcdn.com/w80/to.png`, // Tonga
  },
  {
    code: "tr",
    englishName: "Turkish",
    nativeName: "Türkçe",
    flag: `https://flagcdn.com/w80/tr.png`, // Turkey
  },
  {
    code: "ts",
    englishName: "Tsonga",
    nativeName: "Xitsonga",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    code: "tt",
    englishName: "Tatar",
    nativeName: "татарча",
    flag: `https://flagcdn.com/w80/ru.png`, // Russia
  },
  {
    code: "tw",
    englishName: "Twi",
    nativeName: "Twi",
    flag: `https://flagcdn.com/w80/gh.png`, // Ghana
  },
  {
    code: "ty",
    englishName: "Tahitian",
    nativeName: "Reo Tahiti",
    flag: `https://flagcdn.com/w80/pf.png`, // French Polynesia
  },
  {
    code: "ug",
    englishName: "Uyghur",
    nativeName: "ئۇيغۇرچە‎",
    flag: `https://flagcdn.com/w80/cn.png`, // China (Xinjiang)
  },
  {
    code: "uk",
    englishName: "Ukrainian",
    nativeName: "українська",
    flag: `https://flagcdn.com/w80/ua.png`, // Ukraine
  },
  {
    code: "ur",
    englishName: "Urdu",
    nativeName: "اردو",
    flag: `https://flagcdn.com/w80/pk.png`, // Pakistan
  },
  {
    code: "uz",
    englishName: "Uzbek",
    nativeName: "Oʻzbek",
    flag: `https://flagcdn.com/w80/uz.png`, // Uzbekistan
  },
  {
    code: "ve",
    englishName: "Venda",
    nativeName: "Tshivenḓa",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    code: "vi",
    englishName: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: `https://flagcdn.com/w80/vn.png`, // Vietnam
  },
  {
    code: "vo",
    englishName: "Volapük",
    nativeName: "Volapük",
    flag: `https://flagcdn.com/w80/un.png`, // Constructed language (UN flag)
  },
  {
    code: "wa",
    englishName: "Walloon",
    nativeName: "Walon",
    flag: `https://flagcdn.com/w80/be.png`, // Belgium
  },
  {
    code: "cy",
    englishName: "Welsh",
    nativeName: "Cymraeg",
    flag: `https://flagcdn.com/w80/gb.png`, // United Kingdom
  },
  {
    code: "wo",
    englishName: "Wolof",
    nativeName: "Wollof",
    flag: `https://flagcdn.com/w80/sn.png`, // Senegal
  },
  {
    code: "fy",
    englishName: "Western Frisian",
    nativeName: "Frysk",
    flag: `https://flagcdn.com/w80/nl.png`, // Netherlands
  },
  {
    code: "xh",
    englishName: "Xhosa",
    nativeName: "isiXhosa",
    flag: `https://flagcdn.com/w80/za.png`, // South Africa
  },
  {
    code: "yi",
    englishName: "Yiddish",
    nativeName: "ייִדיש",
    flag: `https://flagcdn.com/w80/il.png`, // Israel
  },
  {
    code: "yo",
    englishName: "Yoruba",
    nativeName: "Yorùbá",
    flag: `https://flagcdn.com/w80/ng.png`, // Nigeria
  },
  {
    code: "za",
    englishName: "Zhuang, Chuang",
    nativeName: "Saɯ cueŋƅ",
    flag: `https://flagcdn.com/w80/cn.png`, // China (Guangxi)
  },
];
