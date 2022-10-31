const arrayRandom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

export { arrayRandom };
