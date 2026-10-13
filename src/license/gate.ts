// The panel's side (MAIN world) of the license bridge. The page cannot call
// chrome.runtime, so it posts window messages for bridge.ts to relay.
//
// Any check that runs in the browser can be patched out by someone set on it;
// the point here is that ordinary users need a key, not resisting cracking.

import type { LicenseGate, LicenseStatus } from '../scraper';
import type { LicenseView } from './messages';

const CHANNEL = 'uuid-ads-license';
const TIMEOUT_MS = 20000;

export function extensionLicenseGate(): LicenseGate {
    let sequence = 0;
    const pending = new Map<number, (reply: unknown) => void>();
    const listeners = new Set<() => void>();

    window.addEventListener('message', (event: MessageEvent) => {
        if (event.source !== window) return;
        const data = event.data;
        if (!data || data.channel !== CHANNEL) return;
        if (data.kind === 'response') {
            pending.get(data.id)?.(data.reply);
            pending.delete(data.id);
        } else if (data.kind === 'changed') {
            listeners.forEach(listener => listener());
        }
    });

    function request(type: string): Promise<unknown> {
        return new Promise(resolve => {
            const id = ++sequence;
            pending.set(id, resolve);
            window.postMessage({ channel: CHANNEL, kind: 'request', id, type }, location.origin);
            setTimeout(() => {
                if (pending.delete(id)) resolve(null);
            }, TIMEOUT_MS);
        });
    }

    return {
        async check(): Promise<LicenseStatus> {
            const reply = await request('license:status') as LicenseView | null;
            if (!reply || typeof reply.state !== 'string') return { active: false, state: 'unavailable' };
            return { active: reply.active === true, state: reply.state };
        },
        openActivation() {
            void request('license:open');
        },
        onChange(listener) {
            listeners.add(listener);
        },
    };
}
