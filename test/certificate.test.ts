import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';

import {
    canonicalCertificate, deviceHash, evaluate, newDeviceId, stateFromServerCode, RULINGS_AGAINST_DEVICE,
    type Certificate,
} from '../src/license/certificate.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-10-13T00:00:00.000Z');

async function signer() {
    const keys = await webcrypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
    const publicKeyB64 = Buffer.from(await webcrypto.subtle.exportKey('raw', keys.publicKey)).toString('base64url');
    const sign = async (c: Certificate) => Buffer.from(
        await webcrypto.subtle.sign('Ed25519', keys.privateKey, new TextEncoder().encode(canonicalCertificate(c))),
    ).toString('base64url');
    return { publicKeyB64, sign };
}

async function certificateFor(deviceId: string, overrides: Partial<Certificate> = {}): Promise<Certificate> {
    return {
        check_after: new Date(NOW + 7 * DAY).toISOString(),
        device_hash: await deviceHash(deviceId),
        expires_at: null,
        issued_at: new Date(NOW - DAY).toISOString(),
        license_id: '11111111-1111-4111-8111-111111111111',
        license_type: 'perpetual',
        product: 'uuid-ads',
        status: 'active',
        v: 2,
        ...overrides,
    };
}

test('the canonical form matches the license server byte for byte', () => {
    // Same certificate and expected string as key-wyatt's test/products.test.mjs.
    assert.equal(
        canonicalCertificate({
            check_after: '2026-08-25T00:00:00.000Z',
            device_hash: 'device',
            expires_at: null,
            issued_at: '2026-08-18T00:00:00.000Z',
            license_id: '11111111-1111-4111-8111-111111111111',
            license_type: 'perpetual',
            product: 'uuid-ads',
            status: 'active',
            v: 2,
        }),
        '{"check_after":"2026-08-25T00:00:00.000Z","device_hash":"device","expires_at":null,"issued_at":"2026-08-18T00:00:00.000Z","license_id":"11111111-1111-4111-8111-111111111111","license_type":"perpetual","product":"uuid-ads","status":"active","v":2}',
    );
});

test('a signed certificate for this browser is active', async () => {
    const { publicKeyB64, sign } = await signer();
    const deviceId = newDeviceId();
    const certificate = await certificateFor(deviceId);
    const result = await evaluate({ certificate, signature: await sign(certificate), deviceId, now: NOW, publicKeyB64 });
    assert.equal(result.state, 'active');
});

test('tampering, another product, another browser or a v1 certificate is invalid', async () => {
    const { publicKeyB64, sign } = await signer();
    const deviceId = newDeviceId();
    const good = await certificateFor(deviceId);
    const signature = await sign(good);

    const extended = { ...good, check_after: new Date(NOW + 365 * DAY).toISOString() };
    assert.equal((await evaluate({ certificate: extended, signature, deviceId, now: NOW, publicKeyB64 })).state, 'invalid');

    const otherProduct = await certificateFor(deviceId, { product: 'tpparking' });
    assert.equal((await evaluate({ certificate: otherProduct, signature: await sign(otherProduct), deviceId, now: NOW, publicKeyB64 })).state, 'invalid');

    assert.equal((await evaluate({ certificate: good, signature, deviceId: newDeviceId(), now: NOW, publicKeyB64 })).state, 'invalid');

    // Check Vehicle OCR's certificates are v1 and carry no product.
    const v1 = await certificateFor(deviceId, { v: 1 });
    assert.equal((await evaluate({ certificate: v1, signature: await sign(v1), deviceId, now: NOW, publicKeyB64 })).state, 'invalid');

    // The real server key must not accept a signature from some other key.
    assert.equal((await evaluate({ certificate: good, signature, deviceId, now: NOW })).state, 'invalid');
});

test('time limits: expiry, the offline window and a clock turned back', async () => {
    const { publicKeyB64, sign } = await signer();
    const deviceId = newDeviceId();

    const expiring = await certificateFor(deviceId, { license_type: 'time', expires_at: new Date(NOW + DAY).toISOString() });
    const expiringSig = await sign(expiring);
    assert.equal((await evaluate({ certificate: expiring, signature: expiringSig, deviceId, now: NOW, publicKeyB64 })).state, 'active');
    assert.equal((await evaluate({ certificate: expiring, signature: expiringSig, deviceId, now: NOW + 2 * DAY, publicKeyB64 })).state, 'expired');

    const certificate = await certificateFor(deviceId);
    const signature = await sign(certificate);
    assert.equal((await evaluate({ certificate, signature, deviceId, now: NOW + 8 * DAY, publicKeyB64 })).state, 'requires_revalidation');
    // Within a day of the issue time is tolerated (time zones, unsynced clocks).
    assert.equal((await evaluate({ certificate, signature, deviceId, now: NOW - DAY - DAY / 2, publicKeyB64 })).state, 'active');
    assert.equal((await evaluate({ certificate, signature, deviceId, now: NOW - 3 * DAY, publicKeyB64 })).state, 'clock_behind');
    // Trusted later than the issue time, then the clock went back past it.
    assert.equal((await evaluate({ certificate, signature, deviceId, now: NOW + DAY, trustedAt: NOW + 5 * DAY, publicKeyB64 })).state, 'clock_behind');
});

test('nothing stored means the key still has to be entered', async () => {
    assert.equal((await evaluate({ certificate: undefined, signature: undefined, deviceId: 'x', now: NOW })).state, 'needs_activation');
    assert.equal((await evaluate({ certificate: {}, signature: '', deviceId: 'x', now: NOW })).state, 'needs_activation');
});

test('server rulings that end a license on this browser', () => {
    for (const code of ['revoked', 'expired', 'device_revoked', 'device_not_activated', 'unknown_key']) assert.ok(RULINGS_AGAINST_DEVICE.has(code));
    assert.ok(!RULINGS_AGAINST_DEVICE.has('rate_limited'));
    assert.equal(stateFromServerCode('expired'), 'expired');
    assert.equal(stateFromServerCode('device_revoked'), 'revoked');
    assert.equal(stateFromServerCode('unknown_key'), 'needs_activation');
});

test('device ids are random and fit the server format', () => {
    const id = newDeviceId();
    assert.match(id, /^[A-Za-z0-9_-]{16,128}$/);
    assert.notEqual(id, newDeviceId());
});
