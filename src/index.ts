import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { CloseInfoTmp, getStatus } from './utils/getStatus';
import { getTimeDate, sleep } from './utils/utils';
import services from './services';
import { TMP_FILE_PATH } from './utils/variables';

export const VERSION = '0.1.0';

process
  .on('uncaughtException', console.error)
  .on('unhandledRejection', console.error);

(async () => {
  await services.setup();

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

    const polymerization: Record<string, string[]> = {};
    merge.forEach((text) => {
      if (oldCityInfo.includes(cacheText(text))) return;

      const [, match, info] =
        text.match(
          /(.*)([今明]天(?:[上中下]午|[早晚]上)?(?: \d{2}:\d{2} )?(?:停止)?上[班課](?:及上[及課])?)$/,
        ) || [];

      polymerization[info] ||= [];
      if (!polymerization[info].includes(match)) {
        polymerization[info].push(match);
      }
    });

    const mapData: Record<string, Record<string, string[]>> = {};
    for (const [info, values] of Object.entries(polymerization)) {
      for (const value of values) {
        const city = value.slice(0, 3);

        mapData[info] ||= {};
        mapData[info][city] ||= [];
        mapData[info][city].push(value);
      }
    }

    services.notify.emit('closeInfo', mapData);

    mkdirSync(path.dirname(TMP_FILE_PATH), { recursive: true });
    writeFileSync(
      TMP_FILE_PATH,
      JSON.stringify({ ...status, cityInfo: merge.map(cacheText) }),
    );
  };

  await start();

  await sleep(1e3 * 60 * 2); // 2min
})();
