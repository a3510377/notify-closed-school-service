import { VERSION } from '@';
import { enumToDict } from './utils';

export const UA = `notifyNotifyClosedSchoolService(https://github.com/a3510377, ${VERSION})`;

export const TMP_FILE_PATH = 'data/tmp';
export const DATABASE_PATH = 'data/data.db';

// last update: 2023/09/04
// https://bthr.gov.taipei/News_Content.aspx
// https://tnmao70.tainan.gov.tw/News_Content.aspx?n=10228&s=83174
export enum TaiwanCitys {
  A = '臺北市',
  B = '臺中市',
  C = '基隆市',
  D = '臺南市',
  E = '高雄市',
  F = '新北市',
  G = '宜蘭縣',
  H = '桃園市',
  I = '嘉義市',
  J = '新竹縣',
  K = '苗栗縣',
  L = '臺中縣',
  M = '南投縣',
  N = '彰化縣',
  O = '新竹市',
  P = '雲林縣',
  Q = '嘉義縣',
  R = '臺南縣',
  S = '高雄縣',
  T = '屏東縣',
  U = '花蓮縣',
  V = '臺東縣',
  W = '金門縣',
  X = '澎湖縣',
  Y = '陽明山',
  Z = '連江縣',
}

export type TaiwanCityKeyType = keyof typeof TaiwanCitys;
export const TaiwanCitysMap = enumToDict(TaiwanCitys);
