// The extension's service worker: the only place that talks to the license server
// and keeps the certificate. The panel runs inside Facebook's page (MAIN world),
// whose Content-Security-Policy blocks outside requests, so it asks through the
// bridge and the bridge asks here.

import {
    LICENSE_SERVICE_URL, PRODUCT_ID, RULINGS_AGAINST_DEVICE,
    evaluate, newDeviceId, stateFromServerCode,
    type Certificate, type Evaluation,
} from './certificate';
import type { ExtensionRequest, LicenseView } from './messages';

interface Stored {
    deviceId?: string
    certificate?: Certificate
    signature?: string
    trustedAt?: number
    keyHint?: string
    lastCheckAt?: number
    // The server code that ended the last license (revoked, expired, ...), so the
    // panel keeps saying why it is locked instead of just asking for a key.
    lastRuling?: string
}

// Besides the required check once check_after passes, quietly ask the server once a
// day, so a revoked key locks sooner than the seven-day offline window.
const REFRESH_EVERY_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;

async function load(): Promise<Stored> {
    return await chrome.storage.local.get(null) as Stored;
}

// A random id per installation; nothing about the hardware or the user.
async function deviceId(): Promise<string> {
    const { deviceId } = await load();
    if (deviceId) return deviceId;
    const created = newDeviceId();
    await chrome.storage.local.set({ deviceId: created });
    return created;
}

// Shown to the admin next to the activation, e.g. "Google Chrome 140 · Windows".
function deviceLabel(): string {
    const data = (navigator as Navigator & { userAgentData?: { brands?: { brand: string, version: string }[], platform?: string } }).userAgentData;
    const browser = data?.brands?.find(b => !/not.?a.?brand|chromium/i.test(b.brand));
    const name = browser ? `${browser.brand} ${browser.version}` : 'Chrome';
    return `${name} · ${data?.platform || 'browser'}`.slice(0, 80);
}

interface ServerReply {
    ok?: boolean
    error?: string
    code?: string
    certificate?: Certificate
    signature?: string
}

async function post(path: string, body: Record<string, unknown>): Promise<ServerReply | null> {
    try {
        const response = await fetch(`${LICENSE_SERVICE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, product: PRODUCT_ID, appVersion: chrome.runtime.getManifest().version }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        return await response.json() as ServerReply;
    } catch {
        return null;
    }
}

function view(evaluation: Evaluation, stored: Stored, failure?: { error: string, message?: string }): LicenseView {
    const c = evaluation.certificate;
    return {
        state: evaluation.state,
        active: evaluation.state === 'active',
        licenseType: c?.license_type,
        expiresAt: c?.expires_at,
        keyHint: stored.keyHint,
        ...failure,
    };
}

// Keeps a certificate from the server only if it passes the offline checks.
async function accept(reply: ServerReply, extra: Partial<Stored> = {}): Promise<Evaluation> {
    const stored = await load();
    const now = Date.now();
    const evaluation = await evaluate({ certificate: reply.certificate, signature: reply.signature, deviceId: await deviceId(), now, trustedAt: stored.trustedAt });
    if (evaluation.state === 'active') {
        await chrome.storage.local.set({ certificate: reply.certificate, signature: reply.signature, trustedAt: now, lastCheckAt: now, ...extra });
        await chrome.storage.local.remove('lastRuling');
    }
    return evaluation;
}

async function forget(ruling?: string): Promise<void> {
    await chrome.storage.local.remove(['certificate', 'signature', 'keyHint', 'lastCheckAt', 'lastRuling']);
    if (ruling) await chrome.storage.local.set({ lastRuling: ruling });
}

let revalidating: Promise<LicenseView> | null = null;

// Asks the server about the stored certificate. Several Facebook tabs asking at
// once share one request.
function revalidate(): Promise<LicenseView> {
    return revalidating ??= (async () => {
        try {
            const stored = await load();
            const reply = await post('/api/validate', { licenseId: stored.certificate?.license_id, deviceId: await deviceId() });
            if (!reply) return view({ state: 'network_error', certificate: stored.certificate }, stored);
            if (reply.error) {
                const code = String(reply.code || '');
                if (RULINGS_AGAINST_DEVICE.has(code)) {
                    await forget(code);
                    return view({ state: stateFromServerCode(code) }, {}, { error: code, message: reply.error });
                }
                // Busy or rate-limited server: keep the certificate and try later.
                return view({ state: 'network_error', certificate: stored.certificate }, stored, { error: code || 'network', message: reply.error });
            }
            const evaluation = await accept(reply);
            return view(evaluation, await load());
        } finally {
            revalidating = null;
        }
    })();
}

async function status(): Promise<LicenseView> {
    const stored = await load();
    const now = Date.now();
    const evaluation = await evaluate({ certificate: stored.certificate, signature: stored.signature, deviceId: stored.deviceId ?? '', now, trustedAt: stored.trustedAt });
    if (evaluation.state === 'requires_revalidation') return revalidate();
    if (evaluation.state === 'needs_activation' && stored.lastRuling) {
        return view({ state: stateFromServerCode(stored.lastRuling) }, stored);
    }
    if (evaluation.state === 'active') {
        if (!stored.trustedAt || now > stored.trustedAt) await chrome.storage.local.set({ trustedAt: now });
        if (now - (stored.lastCheckAt ?? 0) > REFRESH_EVERY_MS) void revalidate();
    }
    return view(evaluation, stored);
}

async function activate(rawKey: string): Promise<LicenseView> {
    const key = String(rawKey || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!key) return { ...await status(), error: 'empty_key' };
    const reply = await post('/api/activate', { key, deviceId: await deviceId(), deviceLabel: deviceLabel() });
    // A failed activation must never drop a certificate that still works.
    if (!reply) return { ...await status(), error: 'network' };
    if (reply.error) return { ...await status(), error: String(reply.code || 'server_error'), message: reply.error };
    const evaluation = await accept(reply, { keyHint: key.slice(-4) });
    if (evaluation.state !== 'active') return { ...await status(), error: 'bad_certificate' };
    return view(evaluation, await load());
}

function isExtensionPage(sender: chrome.runtime.MessageSender): boolean {
    return sender.id === chrome.runtime.id && !!sender.url?.startsWith(chrome.runtime.getURL(''));
}

async function handle(message: ExtensionRequest, sender: chrome.runtime.MessageSender): Promise<unknown> {
    if (sender.id !== chrome.runtime.id) return null;
    switch (message?.type) {
        case 'license:status':
            return status();
        case 'license:open':
            await chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
            return true;
        case 'license:activate':
            return isExtensionPage(sender) ? activate(message.key) : null;
        case 'license:remove':
            if (!isExtensionPage(sender)) return null;
            await forget();
            return status();
        default:
            return null;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handle(message as ExtensionRequest, sender).then(sendResponse, () => sendResponse(null));
    return true;
});
