import dayjs from 'dayjs';
import dayjsAr from 'dayjs/locale/ar';
import dayjsDa from 'dayjs/locale/da';
import dayjsDe from 'dayjs/locale/de';
//import dayjsEn from "dayjs/locale/en";
import dayjsEnGb from 'dayjs/locale/en-gb';
import dayjsEs from 'dayjs/locale/es';
import dayjsFr from 'dayjs/locale/fr';
import dayjsId from 'dayjs/locale/id';
import dayjsIt from 'dayjs/locale/it';
import dayjsJa from 'dayjs/locale/ja';
import dayjsKo from 'dayjs/locale/ko';
import dayjsMs from 'dayjs/locale/ms';
import dayjsNb from 'dayjs/locale/nb';
import dayjsPl from 'dayjs/locale/pl';
import dayjsPt from 'dayjs/locale/pt';
import ruDayjs from 'dayjs/locale/ru';
import dayjsSv from 'dayjs/locale/sv';
import dayjsTh from 'dayjs/locale/th';
import dayjsTr from 'dayjs/locale/tr';
import dayjsUk from 'dayjs/locale/uk';
import dayjsVi from 'dayjs/locale/vi';
import dayjsZh from 'dayjs/locale/zh';
import dayjsBe from 'dayjs/locale/be';
import updateLocale from 'dayjs/plugin/updateLocale';

import { SupportedLanguage } from './lang';

dayjs.extend(updateLocale);

interface DayJsRelativeTimes {
  future: string;
  past: string;
  s: string;
  m: string;
  mm: string;
  h: string;
  hh: string;
  d: string;
  dd: string;
  M: string;
  MM: string;
  y: string;
  yy: string;
}

export const dayJsRelativeShortTimeMap: Record<SupportedLanguage, DayJsRelativeTimes> = {
  en: {
    future: 'in %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1hr',
    hh: '%dhr',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1yr',
    yy: '%dyrs',
  },
  fr: {
    future: 'dans %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1h',
    hh: '%dh',
    d: '1j',
    dd: '%dj',
    M: '1mois',
    MM: '%dmois',
    y: '1an',
    yy: '%dans',
  },
  pl: {
    future: 'za %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1godz',
    hh: '%dgodz',
    d: '1d',
    dd: '%dd',
    M: '1mies',
    MM: '%dmies',
    y: '1rok',
    yy: '%dlat',
  },
  uk: {
    future: 'через %s',
    past: '%s',
    s: '<1хв',
    m: '1хв',
    mm: '%dхв',
    h: '1год',
    hh: '%dгод',
    d: '1д',
    dd: '%dд',
    M: '1міс',
    MM: '%dміс',
    y: '1р',
    yy: '%dр',
  },
  ru: {
    future: 'через %s',
    past: '%s',
    s: '<1мин',
    m: '1мин',
    mm: '%dмин',
    h: '1ч',
    hh: '%dч',
    d: '1д',
    dd: '%dд',
    M: '1мес',
    MM: '%dмес',
    y: '1г',
    yy: '%dг',
  },
  es: {
    future: 'en %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mes',
    MM: '%dmeses',
    y: '1año',
    yy: '%daños',
  },
  ar: {
    future: 'بعد %s',
    past: '%s',
    s: '<دقيقة',
    m: '1دقيقة',
    mm: '%dد',
    h: '1س',
    hh: '%dس',
    d: '1ي',
    dd: '%dي',
    M: '1ش',
    MM: '%dش',
    y: '1س',
    yy: '%dس',
  },
  de: {
    future: 'in %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1std',
    hh: '%dstd',
    d: '1tag',
    dd: '%dtage',
    M: '1mon',
    MM: '%dmon',
    y: '1j',
    yy: '%dj',
  },
  id: {
    future: 'dalam %s',
    past: '%s',
    s: '<1mnt',
    m: '1mnt',
    mm: '%dmnt',
    h: '1j',
    hh: '%dj',
    d: '1h',
    dd: '%dh',
    M: '1bln',
    MM: '%dbln',
    y: '1thn',
    yy: '%dthn',
  },
  it: {
    future: 'tra %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1h',
    hh: '%dh',
    d: '1g',
    dd: '%dg',
    M: '1mese',
    MM: '%dmesi',
    y: '1anno',
    yy: '%danni',
  },
  ja: {
    future: '%s後',
    past: '%s',
    s: '<1分',
    m: '1分',
    mm: '%d分',
    h: '1時間',
    hh: '%d時間',
    d: '1日',
    dd: '%d日',
    M: '1ヶ月',
    MM: '%dヶ月',
    y: '1年',
    yy: '%d年',
  },
  ko: {
    future: '%s 후',
    past: '%s',
    s: '<1분',
    m: '1분',
    mm: '%d분',
    h: '1시간',
    hh: '%d시간',
    d: '1일',
    dd: '%d일',
    M: '1개월',
    MM: '%d개월',
    y: '1년',
    yy: '%d년',
  },
  ms: {
    future: 'dalam %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1j',
    hh: '%dj',
    d: '1h',
    dd: '%dh',
    M: '1bln',
    MM: '%dbln',
    y: '1thn',
    yy: '%dthn',
  },
  pt: {
    future: 'em %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mês',
    MM: '%dmeses',
    y: '1ano',
    yy: '%danos',
  },
  th: {
    future: 'ในอีก %s',
    past: '%s',
    s: '<1นาที',
    m: '1นาที',
    mm: '%dนาที',
    h: '1ชม.',
    hh: '%dชม.',
    d: '1วัน',
    dd: '%dวัน',
    M: '1เดือน',
    MM: '%dเดือน',
    y: '1ปี',
    yy: '%dปี',
  },
  tr: {
    future: '%s sonra',
    past: '%s',
    s: '<1dk',
    m: '1dk',
    mm: '%ddk',
    h: '1sa',
    hh: '%dsa',
    d: '1g',
    dd: '%dg',
    M: '1ay',
    MM: '%day',
    y: '1yıl',
    yy: '%dyıl',
  },
  vi: {
    future: 'trong %s',
    past: '%s',
    s: '<1phút',
    m: '1phút',
    mm: '%dphút',
    h: '1giờ',
    hh: '%dgiờ',
    d: '1ngày',
    dd: '%dngày',
    M: '1tháng',
    MM: '%dtháng',
    y: '1năm',
    yy: '%dnăm',
  },
  zh: {
    future: '%s后',
    past: '%s',
    s: '<1分钟',
    m: '1分钟',
    mm: '%d分钟',
    h: '1小时',
    hh: '%d小时',
    d: '1天',
    dd: '%d天',
    M: '1个月',
    MM: '%d个月',
    y: '1年',
    yy: '%d年',
  },
  da: {
    future: 'om %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1t',
    hh: '%dt',
    d: '1d',
    dd: '%dd',
    M: '1md',
    MM: '%dmd',
    y: '1år',
    yy: '%dår',
  },

  sv: {
    future: 'om %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1t',
    hh: '%dt',
    d: '1d',
    dd: '%dd',
    M: '1mån',
    MM: '%dmån',
    y: '1år',
    yy: '%dår',
  },
  no: {
    future: 'om %s',
    past: '%s',
    s: '<1min',
    m: '1min',
    mm: '%dmin',
    h: '1t',
    hh: '%dt',
    d: '1d',
    dd: '%dd',
    M: '1mnd',
    MM: '%dmnd',
    y: '1år',
    yy: '%dår',
  },
  be: {
    future: 'праз %s',
    past: '%s',
    s: '<1хв',
    m: '1хв',
    mm: '%dхв',
    h: '1год',
    hh: '%dгод',
    d: '1д',
    dd: '%dд',
    M: '1мес',
    MM: '%дмес',
    y: '1гад',
    yy: '%дгад',
  },
};

const dayJsLocalesMap: Record<SupportedLanguage, ILocale> = {
  en: dayjsEnGb,
  es: dayjsEs,
  fr: dayjsFr,
  pl: dayjsPl,
  ru: ruDayjs,
  ar: dayjsAr,
  de: dayjsDe,
  id: dayjsId,
  it: dayjsIt,
  ja: dayjsJa,
  ko: dayjsKo,
  ms: dayjsMs,
  pt: dayjsPt,
  th: dayjsTh,
  tr: dayjsTr,
  vi: dayjsVi,
  uk: dayjsUk,
  zh: dayjsZh,
  da: dayjsDa, // Danish
  sv: dayjsSv,
  no: dayjsNb,
  be: dayjsBe,
};

export const initDayJsLocale = (locale: SupportedLanguage) => {
  const dayJsLocale = dayJsLocalesMap[locale];
  const shortTime = dayJsRelativeShortTimeMap[locale];
  if (locale === 'en') {
    dayjs.locale(locale + '-gb');
    dayjs.updateLocale(locale + '-gb', {
      ...dayJsLocale,
      weekStart: 1,
      relativeTime: shortTime,
    });
    return;
  }

  dayjs.locale(locale);
  if (dayJsLocale && shortTime) {
    dayjs.updateLocale(locale, {
      ...dayJsLocale,
      relativeTime: shortTime,
    });
  }
};
