/**
 * Removes the hidden details a phone stores inside a photo (GPS location,
 * time taken, phone model) by drawing the picture again as a new JPEG.
 *
 * The image picker's `exif: false` option does not do this: it only leaves
 * those details out of what the picker reports, and the file keeps them.
 * Every photo that may leave the phone must pass through here first.
 * If this fails, the caller must not keep the photo.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Large enough for a portrait, small enough to send quickly. */
export const MAX_PHOTO_WIDTH = 1600;

export async function stripPhoto(uri: string): Promise<string> {
  let image = await ImageManipulator.manipulate(uri).renderAsync();
  if (image.width > MAX_PHOTO_WIDTH) image = await ImageManipulator.manipulate(image).resize({ width: MAX_PHOTO_WIDTH }).renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return saved.uri;
}
