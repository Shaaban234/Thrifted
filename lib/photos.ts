// Photo preparation for uploads. Picked images are large (file:// on native,
// full-resolution data: URIs on web). We resize + re-encode each to a compact
// JPEG data URI so the whole POST /api/items body stays under Vercel's 4.5MB
// function limit — otherwise every upload with a real photo fails with HTTP 413.
// The resulting string is stored in Neon like any other item field.
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const MAX_WIDTH = 1080; // px on the longest edge that matters for a listing photo
const QUALITY = 0.7; // JPEG quality — ~150-300KB per photo at this width

// Compresses one picked photo to a small JPEG data URI.
// Already-hosted http(s) URLs (e.g. the placeholder image) pass through untouched.
export async function preparePhoto(uri: string): Promise<string> {
  if (!uri || /^https?:\/\//.test(uri)) return uri;
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_WIDTH });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: QUALITY,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return result.base64 ? `data:image/jpeg;base64,${result.base64}` : result.uri;
}

// Prepares all picked photos in parallel, preserving order.
export async function preparePhotos(uris: string[]): Promise<string[]> {
  return Promise.all(uris.map(preparePhoto));
}
