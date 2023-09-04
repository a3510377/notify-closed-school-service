import * as cheerio from 'cheerio';

import { BASE } from './http';

export const WORK_SCHOOL_CLOSE_URL =
  'https://www.dgpa.gov.tw/typh/daily/nds.html';

export const NO_CLOSE = [
  '照常上班、照常上課',
  '尚未列入警戒區',
  // 未達停止上班及上課標準, 未達停止上班標準, 未達停止上課標準
  '未達停止',
];

export interface BaseCloseInfo {
  updatedTime: Date;
  executionDate: Date;
}

export interface CloseInfo extends BaseCloseInfo {
  cityInfo: CloseInfoDate;
}

export interface CloseInfoTmp extends BaseCloseInfo {
  cityInfo: string[];
}

export interface CloseInfoDate {
  today: string[];
  tomorrow: string[];
}

const hasClose = (value: string): boolean => {
  if (value.match(/\d{2}:\d{2}/) || value.includes(':')) return true;

  for (const key of NO_CLOSE) if (value.includes(key)) return false;

  return !!value;
};

const formatInfo = (city: string, values: string[]): CloseInfoDate => {
  const newValues: string[] = [];
  const polymerization: Record<string, string[]> = {};

  for (let value of values) {
    value = value
      .replaceAll(/\d{2}:\d{2}/g, (s) => ` ${s} `)
      .trim()
      .replace(
        /(?:起?已達)?(停止上[班課])[及、](?:停止)?(上[班課])(?:標準)?/,
        '$1及$2',
      )
      .replace(/照常(上班|上課)、/, '');

    const index = value.indexOf(':');
    if (index > 1 && !/^:\d/.test(value.slice(index))) {
      const [cityTmp, ...infos] = value.split(':');
      const info = infos.join(':');
      const town = cityTmp.replaceAll(' ', '');

      polymerization[info] ||= [];

      if (!(town in polymerization[info])) {
        polymerization[info].push(town);
      }
    } else if (value) newValues.push(value);
  }

  for (const [info, value] of Object.entries(polymerization)) {
    newValues.push(`${value.join('、')}${info}`);
  }

  const today: string[] = [];
  const tomorrow: string[] = [];
  for (let value of newValues) {
    if (!hasClose(value)) continue;

    if (!value.startsWith(city)) value = city + value;
    const [, mark] =
      value.match(/([今明])天(?:[上中下]午|[早晚]上|停止)/) || [];

    if (mark === '今') today.push(value);
    else if (mark === '明') tomorrow.push(value);
    else console.log(`Invalid date: ${value}`);
  }

  return { today, tomorrow };
};

export const getStatus = async (): Promise<CloseInfo | undefined> => {
  const $ = await BASE.get(WORK_SCHOOL_CLOSE_URL)
    .then(({ data }) => data)
    .then(cheerio.load);

  const [updatedTime] =
    $('#Content>.f_right.Content_Updata>h4')
      .text()
      .match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/) || [];

  const executionTextDate = [
    ...$('.Header_Div>.Header_YMD').text().matchAll(/\d+/g),
  ].join('/');

  const cityInfo: CloseInfoDate = { today: [], tomorrow: [] };
  $('#Table>.Table_Body>tr').map((_, el) => {
    const $el = cheerio.load(el);

    const city = $el('td[headers=city_Name]').text();
    const info = $el('td[headers=StopWorkSchool_Info]').text();

    if (city && info) {
      const { today, tomorrow } = formatInfo(
        city,
        info.split(/。|$/).map((s) => s.trim()),
      );

      cityInfo.today.push(...today);
      cityInfo.tomorrow.push(...tomorrow);
    }
  });

  if (updatedTime && executionTextDate) {
    const executionDate = new Date(executionTextDate);
    executionDate.setFullYear(executionDate.getFullYear() + 1911);

    return {
      cityInfo,
      updatedTime: new Date(updatedTime),
      executionDate,
    };
  }
};
