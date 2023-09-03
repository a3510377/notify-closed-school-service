export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimeDate = (date: Date | string | number): string => {
  date = new Date(date);

  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
};

export const splitArray = <T>(arr: T[], n: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
};
