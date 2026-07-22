import OpenAI from 'openai';

/**
 * Image generation via OpenAI gpt-image-1.
 *
 * Returns raw PNG bytes; the caller decides where they go (object storage in
 * prod, local file in dev). Isolated here so the provider can be swapped
 * (Imagen, FLUX, Replicate) without touching the rest of the pipeline.
 *
 * NOTE: AI imagery is for blog hero/cover art only. Portfolio and gallery
 * imagery — where authenticity and trust matter — stays real photography.
 */
let _openai: OpenAI | null = null;
function client(): OpenAI {
  if (!_openai) _openai = new OpenAI(); // reads OPENAI_API_KEY on first use
  return _openai;
}

const STYLE_PREFIX =
  'Photorealistic, high-end interior/product photography. Natural lighting, ' +
  'realistic materials and wood grain, shallow depth of field. ' +
  'Absolutely no text, no logos, no watermarks, no signage. ';

export type ImageSize = '1536x1024' | '1024x1024' | '1024x1536';

/** Generate one image and return its PNG bytes. */
export async function generateImageBytes(
  prompt: string,
  size: ImageSize = '1536x1024',
): Promise<Buffer> {
  const res = await client().images.generate({
    model: 'gpt-image-1',
    prompt: STYLE_PREFIX + prompt,
    size,
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image generation returned no data');
  return Buffer.from(b64, 'base64');
}
