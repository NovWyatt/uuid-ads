// ── Contact Extractor ────────────────────────────
// Extracts Vietnamese phone numbers and emails from Facebook profiles,
// posts, and comments. Runs as a background queue with random delays
// to avoid triggering Facebook's rate limiting or checkpoint screens.

// ── Phone & Email extraction ─────────────────────

// Vietnamese phone numbers: exactly 10 digits starting with 0.
// CRITICAL: Must NOT match Facebook UIDs (which are typically 15-16 digits)
// or Unix timestamps (10+ digits). We use word boundaries and context clues.
const VN_PHONE_REGEX = /(?:^|[\s,;|·•\-–—\/()\[\]{}:"'\n]|(?:đt|dt|tel|phone|sdt|sđt|số|liên\s*hệ|zalo|call|gọi|hotline)[.:)?\s]*)(0(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])\d{7})(?=$|[\s,;|·•\-–—\/()\[\]{}:"'\n.!?])/gi;

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

/**
 * Extract a valid Vietnamese phone number from text.
 * Returns the first match or null. Strictly 10 digits starting with valid VN prefixes.
 * Rejects any numeric sequence longer than 10 digits (UIDs, timestamps).
 */
export function extractPhone(text: string): string | null {
    if (!text) return null;
    // Reset regex lastIndex for global regexes
    VN_PHONE_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VN_PHONE_REGEX.exec(text)) !== null) {
        const phone = match[1];
        // Double-check: must be exactly 10 digits
        if (!/^\d{10}$/.test(phone)) continue;
        // Reject if the phone is part of a longer digit sequence in the original text
        const idx = text.indexOf(phone, match.index);
        if (idx > 0 && /\d/.test(text[idx - 1])) continue;
        if (idx + 10 < text.length && /\d/.test(text[idx + 10])) continue;
        return phone;
    }
    return null;
}

/**
 * Extract a valid email address from text.
 * Returns the first match or null.
 */
export function extractEmail(text: string): string | null {
    if (!text) return null;
    EMAIL_REGEX.lastIndex = 0;
    const match = EMAIL_REGEX.exec(text);
    return match ? match[0].toLowerCase() : null;
}

// ── Profile Fetcher ──────────────────────────────

/**
 * Fetches the Facebook About page for a given profile and extracts
 * phone and email from visible content.
 * Returns { phone: string | null, email: string | null }
 */
export async function fetchProfileContact(profileId: string): Promise<{ phone: string | null; email: string | null }> {
    const result = { phone: null as string | null, email: null as string | null };
    try {
        // Build the about URL from profile ID
        const aboutUrl = /^\d+$/.test(profileId)
            ? `https://www.facebook.com/profile.php?id=${profileId}&sk=about`
            : `https://www.facebook.com/${profileId}/about`;

        const response = await fetch(aboutUrl, {
            credentials: 'include',
            headers: { 'Accept': 'text/html' },
        });
        if (!response.ok) return result;
        const html = await response.text();

        // Extract phone and email from the full HTML text content
        // The About page renders contact info in the page source
        result.phone = extractPhone(html);
        result.email = extractEmail(html);
    } catch {
        // Network error, checkpoint, or blocked – return nulls silently
    }
    return result;
}

// ── Background Queue ─────────────────────────────

export interface ContactQueueCallbacks {
    /** Called when a member's contact info has been resolved (phone/email found or confirmed null). */
    onResult(profileId: string, phone: string | null, email: string | null): void;
    /** Called when the queue detects a checkpoint or serious error and pauses. */
    onCheckpoint(): void;
    /** Called when queue status changes (for logging). */
    onLog(message: string): void;
}

export class ContactQueue {
    private queue: { profileId: string; bio: string }[] = [];
    private processing = false;
    private paused = false;
    private processed = new Set<string>();
    private callbacks: ContactQueueCallbacks;

    // Delay range in ms between requests (randomized to look human)
    private minDelay = 2000;
    private maxDelay = 5000;

    constructor(callbacks: ContactQueueCallbacks) {
        this.callbacks = callbacks;
    }

    /** Add members to the queue. Skips already-processed ones. */
    enqueue(members: { profileId: string; bio: string }[]): void {
        for (const m of members) {
            if (!this.processed.has(m.profileId) && !this.queue.some(q => q.profileId === m.profileId)) {
                this.queue.push(m);
            }
        }
        if (!this.processing && !this.paused) {
            this.processNext();
        }
    }

    /** Pause queue processing. */
    pause(): void {
        this.paused = true;
    }

    /** Resume queue processing. */
    resume(): void {
        this.paused = false;
        if (!this.processing) {
            this.processNext();
        }
    }

    /** Clear the queue and processed set. */
    clear(): void {
        this.queue = [];
        this.processed.clear();
        this.processing = false;
        this.paused = false;
    }

    get pending(): number {
        return this.queue.length;
    }

    get isRunning(): boolean {
        return this.processing && !this.paused;
    }

    private async processNext(): Promise<void> {
        if (this.paused || this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const item = this.queue.shift()!;

        try {
            // First, try to extract from the bio text (already available)
            let phone = extractPhone(item.bio);
            let email = extractEmail(item.bio);

            // If either is missing, fetch the About page
            if (!phone || !email) {
                const fetched = await fetchProfileContact(item.profileId);
                if (!phone && fetched.phone) phone = fetched.phone;
                if (!email && fetched.email) email = fetched.email;
            }

            this.processed.add(item.profileId);
            // Always call onResult – phone and email are string | null, never undefined
            this.callbacks.onResult(item.profileId, phone, email);
        } catch (err) {
            // Check if we hit a checkpoint (redirect to checkpoint page)
            const isCheckpoint = err instanceof Error &&
                (err.message.includes('checkpoint') || err.message.includes('blocked'));
            if (isCheckpoint) {
                // Re-add the item to front of queue
                this.queue.unshift(item);
                this.paused = true;
                this.processing = false;
                this.callbacks.onCheckpoint();
                return;
            }
            // For other errors, mark as processed with null values
            this.processed.add(item.profileId);
            this.callbacks.onResult(item.profileId, null, null);
        }

        // Random delay before next item
        const delay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
        await new Promise(r => setTimeout(r, delay));

        // Continue processing
        this.processNext();
    }
}
