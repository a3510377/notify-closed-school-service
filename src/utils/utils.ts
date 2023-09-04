export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimeDate = (date: Date | string | number): string => {
  date = new Date(date);

  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
};

export const enumToDict = <T extends Record<string, string | number | symbol>>(
  enumObj: T,
): Record<T[keyof T], keyof T> => {
  const result: Record<string | number | symbol, keyof T> = {};

  for (const key in enumObj) {
    result[enumObj[key]] = key;
  }

  return result;
};
