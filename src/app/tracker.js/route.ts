const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const siteKey = new URL(request.url).searchParams.get('site')
  if (!siteKey || !uuidPattern.test(siteKey)) {
    return new Response('/* Invalid Accelerator Analytics site key. */', {
      status: 400,
      headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
    })
  }

  const key = JSON.stringify(siteKey.toLowerCase())
  const script = `(() => {
  if (window.AcceleratorAnalytics) return;
  const siteKey = ${key};
  const scriptUrl = new URL(document.currentScript.src);
  const endpoint = new URL('/api/external-analytics/events', scriptUrl.origin);
  endpoint.searchParams.set('site', siteKey);
  const storageKey = 'accelerator-visitor-' + siteKey;
  let visitorId = null;
  try {
    visitorId = localStorage.getItem(storageKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(storageKey, visitorId);
    }
  } catch {}
  const params = new URLSearchParams(location.search);
  const allowed = new Set(['page_view', 'phone_click', 'directions_click', 'contact_click', 'estimate_request']);
  const send = (eventType) => {
    if (!allowed.has(eventType)) return false;
    const payload = JSON.stringify({
      eventType,
      path: location.pathname.slice(0, 500) || '/',
      visitorId,
      referrer: document.referrer || null,
      viewportWidth: window.innerWidth,
      utmSource: params.get('utm_source')
    });
    return navigator.sendBeacon(endpoint, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
  };
  let lastPage = '';
  const pageView = () => {
    if (location.pathname === lastPage) return;
    lastPage = location.pathname;
    send('page_view');
  };
  window.AcceleratorAnalytics = Object.freeze({ track: send });
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a,button') : null;
    if (!target) return;
    const href = target instanceof HTMLAnchorElement ? target.href : '';
    const action = target.getAttribute('data-accelerator-action');
    if (href.startsWith('tel:')) send('phone_click');
    else if (href.startsWith('mailto:') || action === 'contact') send('contact_click');
    else if (action === 'directions') send('directions_click');
  }, { capture: true });
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];
    history[method] = function(...args) {
      const result = original.apply(this, args);
      queueMicrotask(pageView);
      return result;
    };
  }
  addEventListener('popstate', pageView);
  pageView();
})();`

  return new Response(script, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
