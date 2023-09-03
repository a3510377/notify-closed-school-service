export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimeDate = (date: Date | string | number): string => {
  date = new Date(date);

  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
};
