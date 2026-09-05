export const MAX_LISTING_IMAGES = 4;
export const LISTING_TITLE_MAX = 120;
export const LISTING_DESCRIPTION_MAX = 4000;
export const LISTING_LOCATION_MAX = 120;
export const LISTING_PHONE_MAX = 32;
export const LISTING_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export function isAllowedListingImage(file: File): boolean {
  if (file.size <= 0 || file.size > LISTING_IMAGE_MAX_BYTES) return false;
  if (file.type && !/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
    return false;
  }
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name) || /^image\//i.test(file.type);
}

export const MAX_LISTING_IMAGES_MESSAGE =
  "Maximum 4 photos allowed. Extra photos were not added.";
