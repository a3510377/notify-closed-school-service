import { VERSION } from '@';
import { enumToDict } from './utils';

export const UA = `notifyNotifyClosedSchoolService(https://github.com/a3510377, ${VERSION})`;

export const TMP_FILE_PATH = 'data/tmp';
export const DATABASE_PATH = 'data/data.db';

// last update: 2023/09/04
// https://www.taiwan.net.tw/m1.aspx?sNo=0001016
// https://bthr.gov.taipei/News_Content.aspx
// https://tnmao70.tainan.gov.tw/News_Content.aspx?n=10228&s=83174
export enum TaiwanCitys {
  // 北
  A = '臺北市',
  F = '新北市',
  C = '基隆市',
  G = '宜蘭縣',
  H = '桃園市',
  J = '新竹縣',
  O = '新竹市',

  // 中
  B = '臺中市',
  K = '苗栗縣',
  N = '彰化縣',
  M = '南投縣',
  P = '雲林縣',

  // 南
  D = '臺南市',
  E = '高雄市',
  I = '嘉義市',
  Q = '嘉義縣',
  T = '屏東縣',

  // 東
  U = '花蓮縣',
  V = '臺東縣',

  // 離島
  W = '金門縣',
  X = '澎湖縣',
  Z = '連江縣',
}

export enum TaiwanPosition {
  north = '北部',
  central = '中部',
  south = '南部',
  east = '東部',
  outlyingIslands = '離島',
}

export const TaiwanCitysDistributed: Record<
  TaiwanPositionType,
  TaiwanCityKeyType[]
> = {
  north: ['A', 'F', 'C', 'G', 'H', 'J', 'O'],
  central: ['B', 'K', 'N', 'M', 'P'],
  south: ['D', 'E', 'I', 'Q', 'T'],
  east: ['U', 'V'],
  outlyingIslands: ['W', 'X', 'Z'],
};

export type TaiwanPositionType = keyof typeof TaiwanPosition;
export type TaiwanCityKeyType = keyof typeof TaiwanCitys;
export const TaiwanCitysMap = enumToDict(TaiwanCitys);
