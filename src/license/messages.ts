import type { LicenseState } from './certificate';

// License status sent to the panel and the activation page. Never carries the full
// key or the certificate, only what the UI shows.
export interface LicenseView {
    state: LicenseState
    active: boolean
    licenseType?: 'time' | 'perpetual'
    expiresAt?: string | null
    keyHint?: string
    // Why the last activation failed: a server code (unknown_key, wrong_product,
    // device_limit, ...) or a local one (empty_key, network, bad_certificate).
    error?: string
    // The server's own message for that error, in Vietnamese.
    message?: string
}

// What a Facebook page may ask the bridge to pass on to the background.
export type PageRequest = { type: 'license:status' } | { type: 'license:open' };

// Only the extension's own pages may change the license.
export type ExtensionRequest =
    | PageRequest
    | { type: 'license:activate', key: string }
    | { type: 'license:remove' };
