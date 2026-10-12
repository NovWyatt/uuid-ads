import { exportToCsv, ListStorage } from 'browser-scraping-utils';

// ── Types & Storage ──────────────────────────

interface FBMember {
    profileId: string
    fullName: string
    profileLink: string
    bio: string
    imageSrc: string
    groupId: string
    groupJoiningText: string
    profileType: string
}

class FBStorage extends ListStorage<FBMember> {
    name = 'fb-scrape-storage'
    get headers() {
        return [
            'Profile Id', 'Full Name', 'Profile Link', 'Bio',
            'ImageSrc', 'GroupId', 'Group Joining Text', 'Profile Type'
        ]
    }
    itemToRow(item: FBMember): string[] {
        return [
            item.profileId, item.fullName, item.profileLink, item.bio,
            item.imageSrc, item.groupId, item.groupJoiningText, item.profileType
        ]
    }
}

const store = new FBStorage();

// ListStorage opens IndexedDB asynchronously and exposes no ready promise;
// reading before it opens silently falls back to an empty in-memory map.
async function waitForStore(timeoutMs = 5000): Promise<void> {
    const start = Date.now();
    while (store.persistent && !store.db && Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 50));
    }
}

// ── Styles ───────────────────────────────────

const CSS = `
@keyframes fbs-slide-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes fbs-pulse-ring {
    0%   { box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 0 0 0 rgba(24,119,242,.35); }
    70%  { box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 0 0 8px rgba(24,119,242,0); }
    100% { box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 0 0 0 rgba(24,119,242,0); }
}
@keyframes fbs-dot-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: .35; }
}

/* ── Panel ── */
.fbs-panel {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    width: 300px !important;
    z-index: 99999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    background: linear-gradient(145deg, rgba(22,24,32,.97), rgba(28,31,40,.97)) !important;
    border: 1px solid rgba(255,255,255,.06) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,.4) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    color: #e4e6eb !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    line-height: 1.4 !important;
    font-size: 14px !important;
    animation: fbs-slide-in .3s ease-out !important;
}
.fbs-panel *, .fbs-panel *::before, .fbs-panel *::after {
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
}
.fbs-panel.fbs-pulse {
    animation: fbs-pulse-ring .55s ease-out !important;
}

/* ── Header ── */
.fbs-header {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 10px 12px !important;
    background: rgba(255,255,255,.025) !important;
    border-bottom: 1px solid rgba(255,255,255,.06) !important;
    cursor: move !important;
    user-select: none !important;
    -webkit-user-select: none !important;
}
.fbs-drag-icon {
    color: rgba(255,255,255,.25) !important;
    display: flex !important;
    align-items: center !important;
    flex-shrink: 0 !important;
}
.fbs-title {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #e4e6eb !important;
    flex-shrink: 0 !important;
}
.fbs-status-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: rgba(255,255,255,.18) !important;
    flex-shrink: 0 !important;
    transition: background .3s !important;
}
.fbs-status-dot.fbs-dot-active {
    background: #22c55e !important;
    animation: fbs-dot-blink 1s ease infinite !important;
}
.fbs-header-badge {
    font-size: 11px !important;
    font-weight: 600 !important;
    background: rgba(24,119,242,.12) !important;
    color: #6eaaff !important;
    padding: 2px 8px !important;
    border-radius: 10px !important;
    margin-left: auto !important;
    flex-shrink: 0 !important;
    line-height: 1.5 !important;
}
.fbs-header-right {
    display: flex !important;
    gap: 2px !important;
    flex-shrink: 0 !important;
    margin-left: 6px !important;
}
.fbs-icon-btn {
    background: none !important;
    border: none !important;
    color: rgba(255,255,255,.35) !important;
    cursor: pointer !important;
    padding: 4px !important;
    border-radius: 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all .15s !important;
    line-height: 1 !important;
}
.fbs-icon-btn:hover {
    background: rgba(255,255,255,.08) !important;
    color: #e4e6eb !important;
}

/* ── Body ── */
.fbs-body {
    overflow: hidden !important;
}

/* ── Stats ── */
.fbs-stats {
    padding: 18px 16px 6px !important;
    text-align: center !important;
}
.fbs-counter {
    font-size: 36px !important;
    font-weight: 700 !important;
    color: #e4e6eb !important;
    display: block !important;
    letter-spacing: -1px !important;
    line-height: 1.1 !important;
}
.fbs-counter-label {
    font-size: 11px !important;
    color: rgba(255,255,255,.4) !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    margin-top: 2px !important;
}
.fbs-group-count {
    font-size: 12px !important;
    color: rgba(255,255,255,.3) !important;
    display: block !important;
    margin-top: 4px !important;
}

/* ── Status hint ── */
.fbs-status {
    text-align: center !important;
    font-size: 11px !important;
    color: rgba(255,255,255,.35) !important;
    padding: 4px 16px 14px !important;
    font-style: italic !important;
    line-height: 1.4 !important;
}

/* ── Actions ── */
.fbs-actions {
    padding: 0 12px 12px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
}
.fbs-btn {
    border: none !important;
    border-radius: 8px !important;
    padding: 9px 14px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    transition: all .15s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    font-family: inherit !important;
    white-space: nowrap !important;
    line-height: 1.2 !important;
    text-decoration: none !important;
    outline: none !important;
}
.fbs-btn svg { flex-shrink: 0 !important; }

.fbs-btn-primary {
    background: #1877F2 !important;
    color: #fff !important;
}
.fbs-btn-primary:hover {
    background: #1565d8 !important;
}

.fbs-btn-secondary {
    background: rgba(255,255,255,.06) !important;
    color: #b0b3b8 !important;
    flex: 1 !important;
}
.fbs-btn-secondary:hover {
    background: rgba(255,255,255,.1) !important;
    color: #e4e6eb !important;
}
.fbs-btn-secondary.fbs-btn-active {
    background: rgba(24,119,242,.12) !important;
    color: #6eaaff !important;
}
.fbs-btn-secondary.fbs-btn-active:hover {
    background: rgba(24,119,242,.2) !important;
}

.fbs-btn-outline {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,.1) !important;
    color: #8a8d91 !important;
    flex: 1 !important;
}
.fbs-btn-outline:hover {
    border-color: rgba(239,68,68,.35) !important;
    color: #f87171 !important;
    background: rgba(239,68,68,.05) !important;
}
.fbs-btn-outline.fbs-confirm {
    background: #ef4444 !important;
    color: #fff !important;
    border-color: #ef4444 !important;
}
.fbs-btn-outline.fbs-confirm:hover {
    background: #dc2626 !important;
    border-color: #dc2626 !important;
}

.fbs-btn-row {
    display: flex !important;
    gap: 6px !important;
}

/* ── Log ── */
.fbs-log {
    border-top: 1px solid rgba(255,255,255,.06) !important;
    padding: 8px 0 4px !important;
}
.fbs-log-title {
    font-size: 10px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: .5px !important;
    color: rgba(255,255,255,.25) !important;
    padding: 0 12px 4px !important;
    line-height: 1.3 !important;
}
.fbs-log-entries {
    max-height: 96px !important;
    overflow-y: auto !important;
    padding: 0 12px !important;
}
.fbs-log-entries::-webkit-scrollbar { width: 3px !important; }
.fbs-log-entries::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,.08) !important;
    border-radius: 2px !important;
}
.fbs-log-entry {
    font-size: 11px !important;
    color: rgba(255,255,255,.45) !important;
    padding: 2px 0 !important;
    display: flex !important;
    gap: 8px !important;
    line-height: 1.4 !important;
}
.fbs-log-time {
    color: rgba(255,255,255,.2) !important;
    font-variant-numeric: tabular-nums !important;
    flex-shrink: 0 !important;
}
`;

function injectStyles() {
    if (document.getElementById('fbs-styles')) return;
    const el = document.createElement('style');
    el.id = 'fbs-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
}

// ── SVG Icons ────────────────────────────────

const ICONS = {
    grip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>',
    minimize: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>',
    expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
} as const;

// ── UI Panel ─────────────────────────────────

class ScraperPanel {
    private panel!: HTMLDivElement;
    private body!: HTMLDivElement;
    private counterEl!: HTMLSpanElement;
    private groupCountEl!: HTMLSpanElement;
    private statusEl!: HTMLDivElement;
    private statusDot!: HTMLSpanElement;
    private headerBadge!: HTMLSpanElement;
    private logEntries!: HTMLDivElement;
    private scrollBtn!: HTMLButtonElement;
    private minimizeBtn!: HTMLButtonElement;
    private resetBtn!: HTMLButtonElement;

    private isMinimized = false;
    private isScrolling = false;
    private scrollTimer: ReturnType<typeof setInterval> | null = null;
    private groups = new Set<string>();
    private pulseTimer: ReturnType<typeof setTimeout> | null = null;
    private confirmingReset = false;
    private confirmTimer: ReturnType<typeof setTimeout> | null = null;

    private isDragging = false;
    private dragOffX = 0;
    private dragOffY = 0;

    constructor() {
        this.build();
        this.setupDrag();
    }

    // ── Build DOM ──

    private build() {
        // Remove previous instance
        document.getElementById('fbs-panel')?.remove();

        this.panel = document.createElement('div');
        this.panel.id = 'fbs-panel';
        this.panel.className = 'fbs-panel';

        // Header
        const header = document.createElement('div');
        header.className = 'fbs-header';

        const dragIcon = document.createElement('span');
        dragIcon.className = 'fbs-drag-icon';
        dragIcon.innerHTML = ICONS.grip;

        const title = document.createElement('span');
        title.className = 'fbs-title';
        title.textContent = 'FB Scraper';

        this.statusDot = document.createElement('span');
        this.statusDot.className = 'fbs-status-dot';

        this.headerBadge = document.createElement('span');
        this.headerBadge.className = 'fbs-header-badge';
        this.headerBadge.textContent = '0';

        const headerRight = document.createElement('div');
        headerRight.className = 'fbs-header-right';

        this.minimizeBtn = document.createElement('button');
        this.minimizeBtn.className = 'fbs-icon-btn';
        this.minimizeBtn.innerHTML = ICONS.minimize;
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });
        headerRight.appendChild(this.minimizeBtn);

        header.append(dragIcon, title, this.statusDot, this.headerBadge, headerRight);

        // Body
        this.body = document.createElement('div');
        this.body.className = 'fbs-body';

        // Stats section
        const stats = document.createElement('div');
        stats.className = 'fbs-stats';

        this.counterEl = document.createElement('span');
        this.counterEl.className = 'fbs-counter';
        this.counterEl.textContent = '0';

        const counterLabel = document.createElement('div');
        counterLabel.className = 'fbs-counter-label';
        counterLabel.textContent = 'members captured';

        this.groupCountEl = document.createElement('span');
        this.groupCountEl.className = 'fbs-group-count';
        this.groupCountEl.textContent = 'from 0 groups';

        stats.append(this.counterEl, counterLabel, this.groupCountEl);

        // Status hint
        this.statusEl = document.createElement('div');
        this.statusEl.className = 'fbs-status';
        this.statusEl.textContent = "Go to a group's Members tab to start";

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'fbs-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'fbs-btn fbs-btn-primary';
        downloadBtn.innerHTML = `${ICONS.download} Download CSV`;
        downloadBtn.addEventListener('click', () => this.download());

        const btnRow = document.createElement('div');
        btnRow.className = 'fbs-btn-row';

        this.scrollBtn = document.createElement('button');
        this.scrollBtn.className = 'fbs-btn fbs-btn-secondary';
        this.scrollBtn.textContent = 'Auto Scroll';
        this.scrollBtn.addEventListener('click', () => this.toggleAutoScroll());

        this.resetBtn = document.createElement('button');
        this.resetBtn.className = 'fbs-btn fbs-btn-outline';
        this.resetBtn.textContent = 'Reset';
        this.resetBtn.addEventListener('click', () => this.handleReset());

        btnRow.append(this.scrollBtn, this.resetBtn);
        actions.append(downloadBtn, btnRow);

        // Activity log
        const log = document.createElement('div');
        log.className = 'fbs-log';

        const logTitle = document.createElement('div');
        logTitle.className = 'fbs-log-title';
        logTitle.textContent = 'Activity';

        this.logEntries = document.createElement('div');
        this.logEntries.className = 'fbs-log-entries';

        log.append(logTitle, this.logEntries);

        // Assemble
        this.body.append(stats, this.statusEl, actions, log);
        this.panel.append(header, this.body);
    }

    // ── Drag ──

    private setupDrag() {
        const header = this.panel.querySelector('.fbs-header') as HTMLDivElement;

        header.addEventListener('mousedown', (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('.fbs-icon-btn')) return;
            this.isDragging = true;
            const rect = this.panel.getBoundingClientRect();
            this.dragOffX = e.clientX - rect.left;
            this.dragOffY = e.clientY - rect.top;
            this.panel.style.transition = 'none';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging) return;
            const x = Math.max(0, Math.min(e.clientX - this.dragOffX, window.innerWidth - 100));
            const y = Math.max(0, Math.min(e.clientY - this.dragOffY, window.innerHeight - 50));
            this.panel.style.right = 'auto';
            this.panel.style.bottom = 'auto';
            this.panel.style.left = x + 'px';
            this.panel.style.top = y + 'px';
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.panel.style.transition = '';
            }
        });
    }

    // ── Public ──

    render() {
        document.body.appendChild(this.panel);
        waitForStore().then(() => this.refreshCounter()).then(count => {
            if (count > 0) {
                this.addLog(`Loaded ${count.toLocaleString()} from cache`);
            } else {
                this.addLog('Ready');
            }
        });
    }

    async onCapture(addedCount: number, groupId?: string) {
        if (groupId) this.groups.add(groupId);
        this.groupCountEl.textContent = `from ${this.groups.size} group${this.groups.size !== 1 ? 's' : ''}`;
        await this.refreshCounter();
        this.addLog(`+${addedCount} members`);

        this.statusDot.classList.add('fbs-dot-active');
        this.statusEl.textContent = 'Capturing members... keep scrolling!';

        this.panel.classList.remove('fbs-pulse');
        void this.panel.offsetWidth;
        this.panel.classList.add('fbs-pulse');

        if (this.pulseTimer) clearTimeout(this.pulseTimer);
        this.pulseTimer = setTimeout(() => {
            this.panel.classList.remove('fbs-pulse');
            this.statusDot.classList.remove('fbs-dot-active');
            this.statusEl.textContent = 'Scroll for more, or download when ready';
        }, 2500);
    }

    // ── Private ──

    private async refreshCounter(): Promise<number> {
        const count = await store.getCount();
        const fmt = count.toLocaleString();
        this.counterEl.textContent = fmt;
        this.headerBadge.textContent = fmt;
        return count;
    }

    private addLog(msg: string) {
        const entry = document.createElement('div');
        entry.className = 'fbs-log-entry';
        const time = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'fbs-log-time';
        timeSpan.textContent = time;
        entry.appendChild(timeSpan);
        entry.appendChild(document.createTextNode(msg));
        this.logEntries.prepend(entry);
        while (this.logEntries.children.length > 50) {
            this.logEntries.lastChild?.remove();
        }
    }

    private toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.body.style.display = this.isMinimized ? 'none' : '';
        this.minimizeBtn.innerHTML = this.isMinimized ? ICONS.expand : ICONS.minimize;
    }

    private toggleAutoScroll() {
        this.isScrolling = !this.isScrolling;
        if (this.isScrolling) {
            this.scrollBtn.textContent = 'Stop Scroll';
            this.scrollBtn.classList.add('fbs-btn-active');
            this.scrollTimer = setInterval(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 150);
            this.addLog('Auto-scroll started');
        } else {
            this.scrollBtn.textContent = 'Auto Scroll';
            this.scrollBtn.classList.remove('fbs-btn-active');
            if (this.scrollTimer) {
                clearInterval(this.scrollTimer);
                this.scrollTimer = null;
            }
            this.addLog('Auto-scroll stopped');
        }
    }

    private async download() {
        const count = await store.getCount();
        if (count === 0) {
            this.addLog('No data to download');
            return;
        }
        const data = await store.toCsvData();
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        try {
            exportToCsv(`fb-members-${ts}.csv`, data);
            this.addLog(`Downloaded ${count.toLocaleString()} members`);
        } catch (err) {
            this.addLog('Download failed');
            console.error(err);
        }
    }

    private handleReset() {
        if (!this.confirmingReset) {
            this.confirmingReset = true;
            this.resetBtn.textContent = 'Confirm?';
            this.resetBtn.classList.add('fbs-confirm');
            this.confirmTimer = setTimeout(() => {
                this.cancelReset();
            }, 3000);
        } else {
            if (this.confirmTimer) clearTimeout(this.confirmTimer);
            this.cancelReset();
            store.clear().then(() => {
                this.groups.clear();
                this.groupCountEl.textContent = 'from 0 groups';
                this.refreshCounter();
                this.addLog('All data cleared');
                this.statusEl.textContent = "Go to a group's Members tab to start";
            });
        }
    }

    private cancelReset() {
        this.confirmingReset = false;
        this.resetBtn.textContent = 'Reset';
        this.resetBtn.classList.remove('fbs-confirm');
    }
}

// ── Data Processing ──────────────────────────

let ui: ScraperPanel;

function processResponse(dataGraphQL: any): void {
    let data: any;
    if (dataGraphQL?.data?.group) {
        data = dataGraphQL.data.group;
    } else if (dataGraphQL?.data?.node?.__typename === 'Group') {
        data = dataGraphQL.data.node;
    } else {
        return;
    }

    let membersEdges: Array<any>;
    if (data?.new_members?.edges) {
        membersEdges = data.new_members.edges;
    } else if (data?.new_forum_members?.edges) {
        membersEdges = data.new_forum_members.edges;
    } else if (data?.search_results?.edges) {
        membersEdges = data.search_results.edges;
    } else {
        return;
    }

    const toAdd: [string, FBMember][] = [];
    let groupId: string | undefined;

    membersEdges.forEach(memberNode => {
        const node = memberNode.node.__isEntity === 'GroupUserInvite'
            ? memberNode.node.invitee_profile
            : memberNode.node;

        if (!node) return;

        const { id, name, bio_text, url, profile_picture, __isProfile: profileType } = node;
        const joiningText = memberNode?.join_status_text?.text
            || memberNode?.membership?.join_status_text?.text;
        const gid = node.group_membership?.associated_group?.id;
        if (gid) groupId = gid;

        toAdd.push([id, {
            profileId: id,
            fullName: name,
            profileLink: url,
            bio: bio_text?.text || '',
            imageSrc: profile_picture?.uri || '',
            groupId: gid || '',
            groupJoiningText: joiningText || '',
            profileType: profileType || ''
        }]);
    });

    if (toAdd.length > 0) {
        waitForStore().then(() => store.addElems(toAdd)).then((addedCount) => {
            if (typeof addedCount === 'number' && addedCount > 0) {
                ui.onCapture(addedCount, groupId);
            }
        });
    }
}

function parseResponse(dataRaw: string): void {
    const parsed: any[] = [];
    try {
        parsed.push(JSON.parse(dataRaw));
    } catch {
        const lines = dataRaw.split('\n');
        if (lines.length <= 1) return;
        for (const line of lines) {
            try { parsed.push(JSON.parse(line)); } catch { /* skip */ }
        }
    }
    for (const item of parsed) {
        processResponse(item);
    }
}

// ── Main ─────────────────────────────────────

function main(): void {
    injectStyles();
    ui = new ScraperPanel();
    ui.render();

    const matchingUrl = '/api/graphql/';

    // Intercept XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener('readystatechange', function () {
            if (this.responseURL.includes(matchingUrl) && this.readyState === 4) {
                parseResponse(this.responseText);
            }
        }, false);
        // @ts-ignore
        originalOpen.apply(this, arguments);
    };

    // Intercept fetch (modern Facebook may use fetch for GraphQL)
    const originalFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
        const response = await originalFetch.apply(this, args);
        const url = typeof args[0] === 'string'
            ? args[0]
            : (args[0] instanceof Request ? args[0].url : '');
        if (url.includes(matchingUrl)) {
            const clone = response.clone();
            clone.text().then(text => parseResponse(text)).catch(() => { /* ignore */ });
        }
        return response;
    };
}

main();
