// Simulate a 3 second delay with Promise
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
