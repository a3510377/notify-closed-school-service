import axios from 'axios';

import { VERSION } from '@';

export const UA = `notifyNotifyClosedSchoolService(https://github.com/a3510377, ${VERSION})`;

export const BASE = axios.create({
  headers: { 'User-Agent': UA },
});
