// Content script in the ISOLATED world: relays between the panel inside the
// Facebook page (MAIN world, no chrome.runtime) and the background.
//
// No imports: this file must build to a plain script, since content scripts
// cannot be modules.

const CHANNEL = 'uuid-ads-license';
// The page may only read the status or open the activation page. Activating and
// removing a key happen on the extension's own page.
const ALLOWED = new Set(['license:status', 'license:open']);

window.addEventListener('message', (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.kind !== 'request' || !ALLOWED.has(data.type)) return;
    chrome.runtime.sendMessage({ type: data.type }).then(
        (reply) => window.postMessage({ channel: CHANNEL, kind: 'response', id: data.id, reply }, location.origin),
        () => window.postMessage({ channel: CHANNEL, kind: 'response', id: data.id, reply: null }, location.origin),
    );
});

// A key activated or removed on the extension page re-checks open panels at once.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'certificate' in changes) {
        window.postMessage({ channel: CHANNEL, kind: 'changed' }, location.origin);
    }
});
