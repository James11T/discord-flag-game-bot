const arrayRandom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const arrayRandomExclude = <T>(array: T[], blackList: T[]): T => {
  let choice: T | null = null;

  while (choice === null || blackList.includes(choice)) {
    choice = arrayRandom(array);
  }

  return choice;
};

export { arrayRandom, arrayRandomExclude };
