/**
 * Generates a random integer between min (inclusive) and max (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 */
export function generateRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Waits for the specified duration
 * @param ms Duration in milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}