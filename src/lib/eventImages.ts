import { media } from './media';

/**
 * Resolves an event image filename (from src/data/events.json) to its R2 URL.
 * Consumed via <SmartImage>, which optimizes the remote image at build.
 */
export function eventImage(filename: string | undefined): string | undefined {
  return media('events', filename);
}
