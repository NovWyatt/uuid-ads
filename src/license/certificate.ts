// Checks license certificates signed by license.wyattos.cyou (the key-wyatt
// server). Pure logic with nothing but WebCrypto, so the tests run it in Node.
//
// A certificate works offline until check_after. The one way to stretch that
// without the server is to turn the clock back, so a clock more than a day behind
// the issue time, or behind the latest time the extension trusted, is refused.

export const LICENSE_SERVICE_URL = 'https://license.wyattos.cyou';
export const PRODUCT_ID = 'uuid-ads';
// Every product on the license server shares this signing key. Other products'
// certificates are refused below: Check Vehicle OCR gets v1 without a product,
// newer ones name their own product. The private key lives only in Cloudflare.
export const LICENSE_SIGNING_PUBLIC_KEY_B64 = '4INHO7vbMjw1KJ0PTcIoAkPyw8mEAcsQPKyOVhvNLag';
export const CERTIFICATE_VERSION = 2;
export const CLOCK_TOLERANCE_MS = 24 * 60 * 60 * 1000;

export interface Certificate {
    check_after: string
    device_hash: string
    expires_at: string | null
    issued_at: string
    license_id: string
    license_type: 'time' | 'perpetual'
    product: string
    status: string
    v: number
}

export type LicenseState =
    | 'active'
    | 'needs_activation'
    | 'requires_revalidation'
    | 'clock_behind'
    | 'expired'
    | 'revoked'
    | 'invalid'
    | 'network_error'

export interface Evaluation {
    state: LicenseState
    certificate?: Certificate
}

const encoder = new TextEncoder();

// Must match the worker's canonicalCertificate character for character: fields in
// alphabetical order, product between license_type and status.
export function canonicalCertificate(c: Certificate): string {
    return JSON.stringify({
        check_after: c.check_after,
        device_hash: c.device_hash,
        expires_at: c.expires_at,
        issued_at: c.issued_at,
        license_id: c.license_id,
        license_type: c.license_type,
        product: c.product,
        status: c.status,
        v: c.v,
    });
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), ch => ch.charCodeAt(0));
}

export function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
    let binary = '';
    for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function deviceHash(deviceId: string): Promise<string> {
    return bytesToBase64Url(await crypto.subtle.digest('SHA-256', encoder.encode(deviceId)));
}

export function newDeviceId(): string {
    return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(24)));
}

function parseTime(value: unknown): number | null {
    if (typeof value !== 'string' || !value) return null;
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
}

export async function verifySignature(certificate: Certificate, signature: string, publicKeyB64 = LICENSE_SIGNING_PUBLIC_KEY_B64): Promise<boolean> {
    try {
        const key = await crypto.subtle.importKey('raw', base64UrlToBytes(publicKeyB64), { name: 'Ed25519' }, false, ['verify']);
        return await crypto.subtle.verify('Ed25519', key, base64UrlToBytes(signature), encoder.encode(canonicalCertificate(certificate)));
    } catch {
        return false;
    }
}

export interface EvaluateInput {
    certificate: unknown
    signature: unknown
    deviceId: string
    now: number
    // The latest moment this extension has trusted.
    trustedAt?: number
    publicKeyB64?: string
}

export async function evaluate(input: EvaluateInput): Promise<Evaluation> {
    const { certificate, signature, deviceId, now } = input;
    if (!certificate || typeof certificate !== 'object' || typeof signature !== 'string' || !signature || !deviceId) {
        return { state: 'needs_activation' };
    }
    const c = certificate as Certificate;
    if (!await verifySignature(c, signature, input.publicKeyB64)) return { state: 'invalid' };
    if (c.v !== CERTIFICATE_VERSION || c.product !== PRODUCT_ID || c.status !== 'active') return { state: 'invalid' };
    if (c.device_hash !== await deviceHash(deviceId)) return { state: 'invalid' };

    const trusted = [parseTime(c.issued_at), input.trustedAt ?? null].filter((t): t is number => t !== null);
    if (trusted.length && now < Math.max(...trusted) - CLOCK_TOLERANCE_MS) return { state: 'clock_behind', certificate: c };

    const expiresAt = parseTime(c.expires_at);
    if (expiresAt !== null && expiresAt <= now) return { state: 'expired', certificate: c };

    const checkAfter = parseTime(c.check_after);
    if (checkAfter === null) return { state: 'invalid' };
    if (checkAfter <= now) return { state: 'requires_revalidation', certificate: c };
    return { state: 'active', certificate: c };
}

// Server error codes on re-validation that mean this browser must drop its certificate.
export const RULINGS_AGAINST_DEVICE = new Set(['revoked', 'expired', 'device_revoked', 'device_not_activated', 'unknown_key']);

export function stateFromServerCode(code: string): LicenseState {
    if (code === 'expired') return 'expired';
    if (code === 'revoked' || code === 'device_revoked') return 'revoked';
    return 'needs_activation';
}
