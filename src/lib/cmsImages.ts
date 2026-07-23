import { media } from './media';

/**
 * CMS collection images now live in R2. These resolvers turn a stored filename
 * into its R2 URL; <SmartImage> optimizes the remote image at build.
 */
export const galleryImage = (f: string | undefined) => media('gallery', f);
export const colorsImage = (f: string | undefined) => media('colors', f);
export const finishesImage = (f: string | undefined) => media('finishes', f);
export const colorsFinishesImage = (f: string | undefined) => media('colors-finishes', f);
