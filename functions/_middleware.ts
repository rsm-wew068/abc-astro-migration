/**
 * Runs on every request. Adds `X-Robots-Tag: noindex` on the staging
 * (*.pages.dev) hostname so Google never indexes the preview — but NOT on the
 * real domain (abcabinet.us), so production stays fully indexable. Header-based,
 * so it needs no rebuild and can't accidentally ship to production.
 */
export const onRequest: PagesFunction = async (context) => {
  const res = await context.next();
  const host = new URL(context.request.url).hostname;
  if (host.endsWith('.pages.dev')) {
    const headers = new Headers(res.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(res.body, { status: res.status, headers });
  }
  return res;
};
