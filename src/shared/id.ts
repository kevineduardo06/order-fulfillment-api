let counter = 0;

export const createId = (prefix: string): string => {
  counter += 1;
  return `${prefix}_${counter.toString().padStart(5, "0")}`;
};

export const resetIdsForTests = (): void => {
  counter = 0;
};
