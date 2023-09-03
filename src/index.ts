import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { CloseInfoTmp, getStatus } from './utils/getStatus';
import { getTimeDate, sleep } from './utils/utils';
import path from 'path';

export const VERSION = '0.1.0';
export const TMP_FILE_PATH = 'data/tmp';

(async () => {
  const start = async () => {
    const status = await getStatus();

    if (!status) {
      await start();
      return await sleep(1e3 * 30);
    }

    const { executionDate, cityInfo } = status;
    const nowTime = new Date();
    const nowDateText = getTimeDate(nowTime);

    if (getTimeDate(executionDate) !== nowDateText) {
      await start();
      return;
    }

    const tomorrowDateText = getTimeDate(new Date(+nowTime + 864e5));
    const { cityInfo: oldCityInfo }: CloseInfoTmp = JSON.parse(
      readFileSync(TMP_FILE_PATH).toString(),
    );
    const merge = [...cityInfo.today, ...cityInfo.tomorrow];
    const cacheText = (s: string) => {
      return s
        .replaceAll('今天', nowDateText)
        .replaceAll('明天', tomorrowDateText);
    };

    merge
      .filter((text) => oldCityInfo.includes(cacheText(text)))
      .forEach((text) => {
        text;
      });

    mkdirSync(path.dirname(TMP_FILE_PATH), { recursive: true });
    writeFileSync(
      TMP_FILE_PATH,
      JSON.stringify({ ...status, cityInfo: merge.map(cacheText) }),
    );
  };

  await start();

  await sleep(1e3 * 60 * 2);
})();
