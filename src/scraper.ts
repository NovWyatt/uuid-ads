import { ListStorage } from 'browser-scraping-utils';
import { COLUMNS, downloadBlob, toCsv, toXlsx, type FBMember } from './export';
import iconUsers from '@phosphor-icons/core/bold/users-three-bold.svg?raw';
import iconExcel from '@phosphor-icons/core/bold/file-xls-bold.svg?raw';
import iconCsv from '@phosphor-icons/core/bold/file-csv-bold.svg?raw';
import iconScroll from '@phosphor-icons/core/bold/arrow-line-down-bold.svg?raw';
import iconPause from '@phosphor-icons/core/bold/pause-bold.svg?raw';
import iconTrash from '@phosphor-icons/core/bold/trash-bold.svg?raw';
import iconMinimize from '@phosphor-icons/core/bold/minus-bold.svg?raw';
import iconExpand from '@phosphor-icons/core/bold/arrows-out-simple-bold.svg?raw';
import iconGrip from '@phosphor-icons/core/bold/dots-six-vertical-bold.svg?raw';

// ── Types & Storage ──────────────────────────

class FBStorage extends ListStorage<FBMember> {
    name = 'fb-scrape-storage'
    get headers() {
        return COLUMNS.map(c => c.header)
    }
    itemToRow(item: FBMember): string[] {
        return COLUMNS.map(c => c.value(item) ?? '')
    }
}

const store = new FBStorage();

// ListStorage opens IndexedDB asynchronously and exposes no ready promise;
// reading before it opens silently falls back to an empty in-memory map.
// Shared so callbacks run in registration order: the startup count reads before the first write.
let storeReady: Promise<void> | null = null;
function waitForStore(timeoutMs = 5000): Promise<void> {
    return storeReady ??= (async () => {
        const start = Date.now();
        while (store.persistent && !store.db && Date.now() - start < timeoutMs) {
            await new Promise(r => setTimeout(r, 50));
        }
    })();
}

// ── Styles ───────────────────────────────────

// Radius rule: panel 14px, controls 10px, badges full pill.
const CSS = `
.fbs-panel {
    --fbs-bg: #1c1c1f;
    --fbs-raised: #26262a;
    --fbs-raised-hover: #303035;
    --fbs-border: #313136;
    --fbs-text: #f4f4f5;
    --fbs-text-2: #b4b4bb;
    --fbs-muted: #8e8e96;
    --fbs-accent: #047857;
    --fbs-accent-hover: #065f46;
    --fbs-accent-text: #6ee7b7;
    --fbs-accent-soft: rgba(52, 211, 153, .14);
    --fbs-on-accent: #fafafa;
    --fbs-danger: #b91c1c;
    --fbs-danger-hover: #991b1b;
    --fbs-danger-text: #fca5a5;
    --fbs-danger-soft: rgba(248, 113, 113, .12);
    --fbs-shadow: 0 16px 40px rgba(0, 0, 0, .45), 0 2px 6px rgba(0, 0, 0, .3);
    --fbs-ring: rgba(52, 211, 153, .45);
}
.fbs-panel[data-theme="light"] {
    --fbs-bg: #fcfcfd;
    --fbs-raised: #f4f4f5;
    --fbs-raised-hover: #e9e9ec;
    --fbs-border: #e4e4e7;
    --fbs-text: #18181b;
    --fbs-text-2: #52525b;
    --fbs-muted: #6b6b74;
    --fbs-accent-text: #047857;
    --fbs-accent-soft: rgba(4, 120, 87, .1);
    --fbs-danger-text: #b91c1c;
    --fbs-danger-soft: rgba(185, 28, 28, .07);
    --fbs-shadow: 0 16px 40px rgba(24, 24, 27, .14), 0 2px 6px rgba(24, 24, 27, .08);
    --fbs-ring: rgba(4, 120, 87, .35);
}

@keyframes fbs-enter {
    from { opacity: 0; transform: translateY(12px) scale(.98); }
    to   { opacity: 1; transform: none; }
}
@keyframes fbs-pulse {
    0%   { box-shadow: var(--fbs-shadow), 0 0 0 0 var(--fbs-ring); }
    100% { box-shadow: var(--fbs-shadow), 0 0 0 10px transparent; }
}
@keyframes fbs-blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: .35; }
}

.fbs-panel {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    width: 300px !important;
    z-index: 99999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    color: var(--fbs-text) !important;
    background: var(--fbs-bg) !important;
    border: 1px solid var(--fbs-border) !important;
    border-radius: 14px !important;
    box-shadow: var(--fbs-shadow) !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    text-align: left !important;
    animation: fbs-enter .28s cubic-bezier(.16, 1, .3, 1) !important;
}
.fbs-panel *, .fbs-panel *::before, .fbs-panel *::after {
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
}
.fbs-panel.fbs-pulse {
    animation: fbs-pulse .7s ease-out !important;
}
.fbs-panel svg {
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0 !important;
    display: block !important;
}

/* ── Header ── */
.fbs-header {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 10px 10px 10px 8px !important;
    border-bottom: 1px solid var(--fbs-border) !important;
    cursor: grab !important;
    user-select: none !important;
    -webkit-user-select: none !important;
}
.fbs-header:active { cursor: grabbing !important; }
.fbs-grip {
    color: var(--fbs-muted) !important;
    display: flex !important;
}
.fbs-grip svg { width: 14px !important; height: 14px !important; }
.fbs-logo {
    width: 26px !important;
    height: 26px !important;
    border-radius: 8px !important;
    background: var(--fbs-accent) !important;
    color: var(--fbs-on-accent) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
}
.fbs-logo svg { width: 15px !important; height: 15px !important; }
.fbs-title {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: var(--fbs-text) !important;
    flex-shrink: 0 !important;
}
.fbs-dot {
    width: 7px !important;
    height: 7px !important;
    border-radius: 999px !important;
    background: var(--fbs-border) !important;
    flex-shrink: 0 !important;
    transition: background .3s !important;
}
.fbs-dot.fbs-dot-on {
    background: #10b981 !important;
    animation: fbs-blink 1.2s ease-in-out infinite !important;
}
.fbs-badge {
    display: none !important;
    margin-left: auto !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    font-variant-numeric: tabular-nums !important;
    color: var(--fbs-accent-text) !important;
    background: var(--fbs-accent-soft) !important;
    padding: 2px 9px !important;
    border-radius: 999px !important;
    line-height: 1.5 !important;
}
.fbs-panel.fbs-min .fbs-badge { display: block !important; }
.fbs-icon-btn {
    margin-left: auto !important;
    width: 28px !important;
    height: 28px !important;
    border: none !important;
    border-radius: 8px !important;
    background: transparent !important;
    color: var(--fbs-text-2) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background .15s, color .15s, transform .1s !important;
}
.fbs-panel.fbs-min .fbs-icon-btn { margin-left: 0 !important; }
.fbs-icon-btn:hover {
    background: var(--fbs-raised) !important;
    color: var(--fbs-text) !important;
}

/* ── Stats ── */
.fbs-stats {
    padding: 18px 16px 4px !important;
    text-align: center !important;
}
.fbs-counter {
    display: block !important;
    font-size: 40px !important;
    font-weight: 700 !important;
    letter-spacing: -.02em !important;
    line-height: 1.1 !important;
    font-variant-numeric: tabular-nums !important;
    color: var(--fbs-text) !important;
}
.fbs-counter-label {
    font-size: 13px !important;
    color: var(--fbs-text-2) !important;
    margin-top: 2px !important;
}
.fbs-groups {
    display: block !important;
    font-size: 12px !important;
    color: var(--fbs-muted) !important;
    margin-top: 2px !important;
}
.fbs-hint {
    margin: 12px 12px 12px !important;
    padding: 8px 10px !important;
    border-radius: 10px !important;
    background: var(--fbs-raised) !important;
    color: var(--fbs-text-2) !important;
    font-size: 12px !important;
    text-align: center !important;
    line-height: 1.45 !important;
}

/* ── Actions ── */
.fbs-actions {
    padding: 0 12px 12px !important;
    display: grid !important;
    grid-template-columns: repeat(6, 1fr) !important;
    gap: 6px !important;
}
.fbs-btn-primary { grid-column: span 4 !important; }
.fbs-btn-csv { grid-column: span 2 !important; }
.fbs-btn-scroll, .fbs-btn-ghost { grid-column: span 3 !important; }
.fbs-btn {
    height: 36px !important;
    padding: 0 12px !important;
    border-radius: 10px !important;
    border: 1px solid transparent !important;
    font-family: inherit !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 7px !important;
    text-decoration: none !important;
    transition: background .15s, color .15s, border-color .15s, transform .1s !important;
}
.fbs-btn:active:not(:disabled), .fbs-icon-btn:active { transform: scale(.97) !important; }
.fbs-btn:disabled {
    opacity: .45 !important;
    cursor: not-allowed !important;
}
.fbs-btn:focus-visible, .fbs-icon-btn:focus-visible {
    outline: 2px solid var(--fbs-accent-text) !important;
    outline-offset: 2px !important;
}
.fbs-btn-primary {
    height: 40px !important;
    background: var(--fbs-accent) !important;
    color: var(--fbs-on-accent) !important;
}
.fbs-btn-primary:hover:not(:disabled) { background: var(--fbs-accent-hover) !important; }
.fbs-btn-csv { height: 40px !important; }
.fbs-btn-secondary {
    background: var(--fbs-raised) !important;
    color: var(--fbs-text) !important;
}
.fbs-btn-secondary:hover:not(:disabled) { background: var(--fbs-raised-hover) !important; }
.fbs-btn-secondary.fbs-on {
    background: var(--fbs-accent-soft) !important;
    color: var(--fbs-accent-text) !important;
    border-color: var(--fbs-accent-soft) !important;
}
.fbs-btn-ghost {
    background: transparent !important;
    border-color: var(--fbs-border) !important;
    color: var(--fbs-text-2) !important;
}
.fbs-btn-ghost:hover:not(:disabled) {
    color: var(--fbs-danger-text) !important;
    background: var(--fbs-danger-soft) !important;
}
.fbs-btn-ghost.fbs-confirm {
    background: var(--fbs-danger) !important;
    border-color: var(--fbs-danger) !important;
    color: var(--fbs-on-accent) !important;
}
.fbs-btn-ghost.fbs-confirm:hover { background: var(--fbs-danger-hover) !important; }

/* ── Activity ── */
.fbs-log {
    border-top: 1px solid var(--fbs-border) !important;
    padding: 10px 0 8px !important;
}
.fbs-log-title {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: var(--fbs-text-2) !important;
    padding: 0 14px 4px !important;
}
.fbs-log-entries {
    max-height: 92px !important;
    overflow-y: auto !important;
    padding: 0 14px !important;
    scrollbar-width: thin !important;
}
.fbs-log-entry {
    display: flex !important;
    gap: 10px !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
    color: var(--fbs-text-2) !important;
}
.fbs-log-time {
    color: var(--fbs-muted) !important;
    font-variant-numeric: tabular-nums !important;
    flex-shrink: 0 !important;
}

/* ── License lock ── */
.fbs-lock {
    display: grid !important;
    gap: 10px !important;
    padding: 18px 14px 14px !important;
    text-align: center !important;
}
.fbs-lock[hidden], .fbs-content[hidden] { display: none !important; }
.fbs-lock-title {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: var(--fbs-text) !important;
}
.fbs-lock-text {
    font-size: 12px !important;
    line-height: 1.5 !important;
    color: var(--fbs-text-2) !important;
}
/* The primary button spans 4 of the action grid's columns; here it would create 4 implicit ones. */
.fbs-lock .fbs-btn { width: 100% !important; grid-column: auto !important; }
.fbs-panel.fbs-locked .fbs-badge { display: none !important; }

@media (prefers-reduced-motion: reduce) {
    .fbs-panel, .fbs-panel.fbs-pulse, .fbs-dot.fbs-dot-on { animation: none !important; }
    .fbs-panel * { transition: none !important; }
}
`;

function injectStyles() {
    if (document.getElementById('fbs-styles')) return;
    const el = document.createElement('style');
    el.id = 'fbs-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
}

// ── Text ─────────────────────────────────────

const TEXT = {
    en: {
        locale: 'en-US',
        membersLabel: 'members captured',
        groups: (n: number) => `from ${n} group${n !== 1 ? 's' : ''}`,
        hintStart: "Open the group's People tab to start",
        hintCapturing: 'Capturing members... keep scrolling!',
        hintIdle: 'Scroll for more, or download when ready',
        hintDone: 'Looks like the end of the list. Download your file.',
        downloadExcel: 'Download Excel',
        downloadCsv: 'CSV',
        sheetName: 'Members',
        autoScroll: 'Auto scroll',
        stopScroll: 'Stop',
        reset: 'Clear',
        confirmReset: 'Confirm?',
        minimize: 'Minimize',
        expand: 'Expand',
        activity: 'Activity',
        ready: 'Ready',
        loadedFromCache: (n: string) => `Loaded ${n} from cache`,
        added: (n: string) => `+${n} members`,
        scrollStarted: 'Auto scroll started',
        scrollStopped: 'Auto scroll stopped',
        autoStopped: (s: number) => `No new members for ${s}s, auto scroll stopped`,
        downloaded: (n: string, kind: string) => `Downloaded ${n} members (${kind})`,
        downloadFailed: 'Download failed',
        cleared: 'All data cleared',
        lockTitle: 'License required',
        lockActivate: 'Enter license key',
        lockRetry: 'Check again',
        lockStates: {
            checking: 'Checking your license...',
            needs_activation: 'Enter your license key to start collecting group members.',
            expired: 'Your license key has expired. Enter a new key to continue.',
            revoked: 'Your license key has been revoked. Contact the seller for a new key.',
            network_error: 'Connect to the Internet so your license key can be checked again.',
            clock_behind: "Your computer's clock is behind. Fix the date and time, then check again.",
            invalid: 'The saved license is not valid on this browser. Enter your key again.',
            unavailable: 'The extension is not responding. Reload this page.',
        } as Record<string, string>,
        licenseActivated: 'License activated',
    },
    vi: {
        locale: 'vi-VN',
        membersLabel: 'thành viên đã lấy',
        groups: (n: number) => `từ ${n} nhóm`,
        hintStart: 'Mở tab Mọi người của nhóm để bắt đầu',
        hintCapturing: 'Đang lấy thành viên... cứ cuộn tiếp!',
        hintIdle: 'Cuộn thêm để lấy tiếp, hoặc tải file khi đủ',
        hintDone: 'Có vẻ đã hết danh sách. Bấm Tải Excel để lưu.',
        downloadExcel: 'Tải Excel',
        downloadCsv: 'CSV',
        sheetName: 'Thành viên',
        autoScroll: 'Tự động cuộn',
        stopScroll: 'Dừng cuộn',
        reset: 'Xóa',
        confirmReset: 'Xác nhận?',
        minimize: 'Thu nhỏ',
        expand: 'Mở rộng',
        activity: 'Hoạt động',
        ready: 'Sẵn sàng',
        loadedFromCache: (n: string) => `Đã nạp ${n} người từ bộ nhớ`,
        added: (n: string) => `+${n} thành viên`,
        scrollStarted: 'Bắt đầu tự động cuộn',
        scrollStopped: 'Đã dừng tự động cuộn',
        autoStopped: (s: number) => `${s} giây không có thành viên mới, đã tự dừng cuộn`,
        downloaded: (n: string, kind: string) => `Đã tải xuống ${n} thành viên (${kind})`,
        downloadFailed: 'Tải xuống thất bại',
        cleared: 'Đã xóa toàn bộ dữ liệu',
        lockTitle: 'Cần key bản quyền',
        lockActivate: 'Nhập key bản quyền',
        lockRetry: 'Kiểm tra lại',
        lockStates: {
            checking: 'Đang kiểm tra bản quyền...',
            needs_activation: 'Nhập key bản quyền để bắt đầu lấy danh sách thành viên nhóm.',
            expired: 'Key bản quyền đã hết hạn. Nhập key mới để dùng tiếp.',
            revoked: 'Key bản quyền đã bị thu hồi. Liên hệ người bán để nhận key mới.',
            network_error: 'Cần kết nối Internet để xác thực lại key bản quyền.',
            clock_behind: 'Ngày giờ trên máy đang bị lùi. Chỉnh lại ngày giờ rồi kiểm tra lại.',
            invalid: 'Bản quyền đã lưu không hợp lệ trên trình duyệt này. Hãy nhập lại key.',
            unavailable: 'Tiện ích không phản hồi. Hãy tải lại trang.',
        } as Record<string, string>,
        licenseActivated: 'Đã kích hoạt bản quyền',
    },
};

let T = TEXT.en;
const fmtNum = (n: number) => n.toLocaleString(T.locale);

// Follow Facebook's display language; anything other than Vietnamese gets English.
function detectLanguage(): keyof typeof TEXT {
    const lang = document.documentElement.lang || navigator.language || '';
    return lang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

// Match Facebook's light/dark mode by the page background, falling back to the OS setting.
function detectTheme(): 'light' | 'dark' {
    for (const el of [document.body, document.documentElement]) {
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (!m || (m.length === 4 && Number(m[3]) === 0)) continue;
        const [r, g, b] = m.map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128 ? 'dark' : 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Facebook usually answers a scroll within a few seconds; this long without a new member means the list is exhausted.
const AUTO_STOP_MS = 15000;

// ── UI Panel ─────────────────────────────────

function iconSpan(svg: string, className?: string): HTMLSpanElement {
    const span = document.createElement('span');
    if (className) span.className = className;
    span.innerHTML = svg;
    span.setAttribute('aria-hidden', 'true');
    return span;
}

function setButton(btn: HTMLButtonElement, svg: string, label: string) {
    btn.replaceChildren(iconSpan(svg), document.createTextNode(label));
}

class ScraperPanel {
    private panel!: HTMLDivElement;
    private body!: HTMLDivElement;
    private counterEl!: HTMLSpanElement;
    private groupCountEl!: HTMLSpanElement;
    private hintEl!: HTMLDivElement;
    private dot!: HTMLSpanElement;
    private badge!: HTMLSpanElement;
    private logEntries!: HTMLDivElement;
    private excelBtn!: HTMLButtonElement;
    private csvBtn!: HTMLButtonElement;
    private scrollBtn!: HTMLButtonElement;
    private minimizeBtn!: HTMLButtonElement;
    private resetBtn!: HTMLButtonElement;
    private content!: HTMLDivElement;
    private lockEl!: HTMLDivElement;
    private lockText!: HTMLParagraphElement;
    private lockBtn!: HTMLButtonElement;

    // Without a license, members are still captured; only viewing and downloading are locked,
    // so whatever was scrolled past can be downloaded right after activating.
    private locked = false;
    private licenseState = '';
    private lockAction: () => void = () => {};

    private isMinimized = false;
    private isScrolling = false;
    private scrollTimer: ReturnType<typeof setInterval> | null = null;
    private lastNewMemberAt = 0;
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
        document.getElementById('fbs-panel')?.remove();

        this.panel = document.createElement('div');
        this.panel.id = 'fbs-panel';
        this.panel.className = 'fbs-panel';
        this.panel.setAttribute('role', 'region');
        this.panel.setAttribute('aria-label', 'FB Scraper');

        // Header
        const header = document.createElement('div');
        header.className = 'fbs-header';

        const title = document.createElement('span');
        title.className = 'fbs-title';
        title.textContent = 'FB Scraper';

        this.dot = document.createElement('span');
        this.dot.className = 'fbs-dot';

        this.badge = document.createElement('span');
        this.badge.className = 'fbs-badge';
        this.badge.textContent = '0';

        this.minimizeBtn = document.createElement('button');
        this.minimizeBtn.type = 'button';
        this.minimizeBtn.className = 'fbs-icon-btn';
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });

        header.append(
            iconSpan(iconGrip, 'fbs-grip'),
            iconSpan(iconUsers, 'fbs-logo'),
            title, this.dot, this.badge, this.minimizeBtn
        );

        // Body
        this.body = document.createElement('div');
        this.body.className = 'fbs-body';

        const stats = document.createElement('div');
        stats.className = 'fbs-stats';

        this.counterEl = document.createElement('span');
        this.counterEl.className = 'fbs-counter';
        this.counterEl.textContent = '0';
        this.counterEl.setAttribute('aria-live', 'polite');

        const counterLabel = document.createElement('div');
        counterLabel.className = 'fbs-counter-label';
        counterLabel.textContent = T.membersLabel;

        this.groupCountEl = document.createElement('span');
        this.groupCountEl.className = 'fbs-groups';
        this.groupCountEl.textContent = T.groups(0);

        stats.append(this.counterEl, counterLabel, this.groupCountEl);

        this.hintEl = document.createElement('div');
        this.hintEl.className = 'fbs-hint';
        this.hintEl.textContent = T.hintStart;

        const actions = document.createElement('div');
        actions.className = 'fbs-actions';

        this.excelBtn = document.createElement('button');
        this.excelBtn.type = 'button';
        this.excelBtn.className = 'fbs-btn fbs-btn-primary';
        setButton(this.excelBtn, iconExcel, T.downloadExcel);
        this.excelBtn.addEventListener('click', () => this.download('xlsx'));

        this.csvBtn = document.createElement('button');
        this.csvBtn.type = 'button';
        this.csvBtn.className = 'fbs-btn fbs-btn-secondary fbs-btn-csv';
        setButton(this.csvBtn, iconCsv, T.downloadCsv);
        this.csvBtn.addEventListener('click', () => this.download('csv'));

        this.scrollBtn = document.createElement('button');
        this.scrollBtn.type = 'button';
        this.scrollBtn.className = 'fbs-btn fbs-btn-secondary fbs-btn-scroll';
        setButton(this.scrollBtn, iconScroll, T.autoScroll);
        this.scrollBtn.addEventListener('click', () => this.toggleAutoScroll());

        this.resetBtn = document.createElement('button');
        this.resetBtn.type = 'button';
        this.resetBtn.className = 'fbs-btn fbs-btn-ghost';
        setButton(this.resetBtn, iconTrash, T.reset);
        this.resetBtn.addEventListener('click', () => this.handleReset());

        actions.append(this.excelBtn, this.csvBtn, this.scrollBtn, this.resetBtn);

        const log = document.createElement('div');
        log.className = 'fbs-log';

        const logTitle = document.createElement('div');
        logTitle.className = 'fbs-log-title';
        logTitle.textContent = T.activity;

        this.logEntries = document.createElement('div');
        this.logEntries.className = 'fbs-log-entries';

        log.append(logTitle, this.logEntries);

        this.content = document.createElement('div');
        this.content.className = 'fbs-content';
        this.content.append(stats, this.hintEl, actions, log);

        this.lockEl = document.createElement('div');
        this.lockEl.className = 'fbs-lock';
        this.lockEl.hidden = true;

        const lockTitle = document.createElement('div');
        lockTitle.className = 'fbs-lock-title';
        lockTitle.textContent = T.lockTitle;

        this.lockText = document.createElement('p');
        this.lockText.className = 'fbs-lock-text';
        this.lockText.setAttribute('aria-live', 'polite');

        this.lockBtn = document.createElement('button');
        this.lockBtn.type = 'button';
        this.lockBtn.className = 'fbs-btn fbs-btn-primary';
        this.lockBtn.addEventListener('click', () => this.lockAction());

        this.lockEl.append(lockTitle, this.lockText, this.lockBtn);

        this.body.append(this.content, this.lockEl);
        this.panel.append(header, this.body);
        this.applyMinimized();
        this.setEmpty(true);
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
            this.isDragging = false;
        });
    }

    // ── Public ──

    render() {
        document.body.appendChild(this.panel);
        waitForStore().then(() => this.refreshCounter()).then(count => {
            this.addLog(count > 0 ? T.loadedFromCache(fmtNum(count)) : T.ready);
        });
    }

    setTheme(theme: 'light' | 'dark') {
        if (this.panel.dataset.theme !== theme) this.panel.dataset.theme = theme;
    }

    setVisible(visible: boolean) {
        this.panel.style.display = visible ? '' : 'none';
        if (!visible && this.isScrolling) this.stopAutoScroll(false);
    }

    setLicense(status: LicenseStatus, actions: { activate: () => void, retry: () => void }) {
        const wasLocked = this.locked;
        this.locked = !status.active;
        this.panel.classList.toggle('fbs-locked', this.locked);
        this.content.hidden = this.locked;
        this.lockEl.hidden = !this.locked;
        if (this.locked) {
            if (this.isScrolling) this.stopAutoScroll(false);
            this.lockText.textContent = T.lockStates[status.state] ?? T.lockStates.needs_activation;
            // These clear up on their own when checked again; the rest need a key.
            const retry = ['checking', 'network_error', 'clock_behind', 'unavailable'].includes(status.state);
            this.lockBtn.textContent = retry ? T.lockRetry : T.lockActivate;
            this.lockBtn.disabled = status.state === 'checking';
            this.lockAction = retry ? actions.retry : actions.activate;
        } else if (wasLocked && this.licenseState && this.licenseState !== 'checking') {
            this.addLog(T.licenseActivated);
        }
        this.licenseState = status.state;
    }

    async onCapture(addedCount: number, groupId?: string) {
        this.lastNewMemberAt = Date.now();
        if (groupId) this.groups.add(groupId);
        this.groupCountEl.textContent = T.groups(this.groups.size);
        await this.refreshCounter();
        this.addLog(T.added(fmtNum(addedCount)));

        this.dot.classList.add('fbs-dot-on');
        this.hintEl.textContent = T.hintCapturing;

        this.panel.classList.remove('fbs-pulse');
        void this.panel.offsetWidth;
        this.panel.classList.add('fbs-pulse');

        if (this.pulseTimer) clearTimeout(this.pulseTimer);
        this.pulseTimer = setTimeout(() => {
            this.panel.classList.remove('fbs-pulse');
            this.dot.classList.remove('fbs-dot-on');
            this.hintEl.textContent = T.hintIdle;
        }, 2500);
    }

    // ── Private ──

    private async refreshCounter(): Promise<number> {
        const count = await store.getCount();
        const fmt = fmtNum(count);
        this.counterEl.textContent = fmt;
        this.badge.textContent = fmt;
        this.setEmpty(count === 0);
        return count;
    }

    private setEmpty(empty: boolean) {
        this.excelBtn.disabled = empty;
        this.csvBtn.disabled = empty;
        if (!this.confirmingReset) this.resetBtn.disabled = empty;
    }

    private addLog(msg: string) {
        const entry = document.createElement('div');
        entry.className = 'fbs-log-entry';
        const time = new Date().toLocaleTimeString(T.locale, {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'fbs-log-time';
        timeSpan.textContent = time;
        entry.append(timeSpan, document.createTextNode(msg));
        this.logEntries.prepend(entry);
        while (this.logEntries.children.length > 50) {
            this.logEntries.lastChild?.remove();
        }
    }

    private toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.applyMinimized();
    }

    private applyMinimized() {
        this.body.style.display = this.isMinimized ? 'none' : '';
        this.panel.classList.toggle('fbs-min', this.isMinimized);
        this.minimizeBtn.replaceChildren(iconSpan(this.isMinimized ? iconExpand : iconMinimize));
        const label = this.isMinimized ? T.expand : T.minimize;
        this.minimizeBtn.title = label;
        this.minimizeBtn.setAttribute('aria-label', label);
        this.minimizeBtn.setAttribute('aria-expanded', String(!this.isMinimized));
    }

    private toggleAutoScroll() {
        if (this.locked) return;
        if (this.isScrolling) {
            this.stopAutoScroll(false);
            return;
        }
        this.isScrolling = true;
        this.lastNewMemberAt = Date.now();
        setButton(this.scrollBtn, iconPause, T.stopScroll);
        this.scrollBtn.classList.add('fbs-on');
        this.scrollBtn.setAttribute('aria-pressed', 'true');
        this.scrollTimer = setInterval(() => {
            window.scrollTo(0, document.body.scrollHeight);
            if (Date.now() - this.lastNewMemberAt > AUTO_STOP_MS) {
                this.stopAutoScroll(true);
            }
        }, 150);
        this.addLog(T.scrollStarted);
    }

    private stopAutoScroll(endOfList: boolean) {
        this.isScrolling = false;
        setButton(this.scrollBtn, iconScroll, T.autoScroll);
        this.scrollBtn.classList.remove('fbs-on');
        this.scrollBtn.setAttribute('aria-pressed', 'false');
        if (this.scrollTimer) {
            clearInterval(this.scrollTimer);
            this.scrollTimer = null;
        }
        if (endOfList) {
            this.addLog(T.autoStopped(AUTO_STOP_MS / 1000));
            this.hintEl.textContent = T.hintDone;
        } else {
            this.addLog(T.scrollStopped);
        }
    }

    private async download(kind: 'xlsx' | 'csv') {
        if (this.locked) return;
        const count = await store.getCount();
        if (count === 0) return;
        const rows = await store.toCsvData();
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        try {
            const blob = kind === 'xlsx' ? await toXlsx(rows, T.sheetName) : toCsv(rows);
            downloadBlob(blob, `fb-members-${ts}.${kind}`);
            this.addLog(T.downloaded(fmtNum(count), kind === 'xlsx' ? 'Excel' : 'CSV'));
        } catch (err) {
            this.addLog(T.downloadFailed);
            console.error(err);
        }
    }

    private handleReset() {
        if (!this.confirmingReset) {
            this.confirmingReset = true;
            setButton(this.resetBtn, iconTrash, T.confirmReset);
            this.resetBtn.classList.add('fbs-confirm');
            this.confirmTimer = setTimeout(() => this.cancelReset(), 3000);
            return;
        }
        if (this.confirmTimer) clearTimeout(this.confirmTimer);
        this.cancelReset();
        store.clear().then(() => {
            this.groups.clear();
            this.groupCountEl.textContent = T.groups(0);
            this.refreshCounter();
            this.addLog(T.cleared);
            this.hintEl.textContent = T.hintStart;
        });
    }

    private cancelReset() {
        this.confirmingReset = false;
        setButton(this.resetBtn, iconTrash, T.reset);
        this.resetBtn.classList.remove('fbs-confirm');
    }
}

// ── Data Processing ──────────────────────────

let ui: ScraperPanel | undefined;

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
                ui?.onCapture(addedCount, groupId);
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

function installHooks(): void {
    const matchingUrl = '/api/graphql/';

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

    const originalFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
        const response = await originalFetch.apply(this, args);
        const input = args[0];
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes(matchingUrl)) {
            response.clone().text().then(parseResponse).catch(() => { /* ignore */ });
        }
        return response;
    };
}

// ── Entry ────────────────────────────────────

export interface LicenseStatus {
    active: boolean
    // checking, needs_activation, expired, revoked, network_error, clock_behind, invalid, unavailable or active.
    state: string
}

export interface LicenseGate {
    check(): Promise<LicenseStatus>
    openActivation(): void
    onChange(listener: () => void): void
}

// A revoked or expired key should lock a panel left open for hours, not only the next one.
const LICENSE_RECHECK_MS = 30 * 60 * 1000;

export function start(license: LicenseGate): void {
    // Hooks go in first: the extension runs at document_start, before Facebook's own requests.
    installHooks();

    const boot = () => {
        T = TEXT[detectLanguage()];
        injectStyles();
        const panel = new ScraperPanel();
        ui = panel;
        panel.render();

        let checking = false;
        const actions = { activate: () => license.openActivation(), retry: () => void refreshLicense() };
        async function refreshLicense() {
            if (checking) return;
            checking = true;
            try {
                panel.setLicense(await license.check(), actions);
            } finally {
                checking = false;
            }
        }
        panel.setLicense({ active: false, state: 'checking' }, actions);
        void refreshLicense();
        license.onChange(() => void refreshLicense());
        setInterval(() => void refreshLicense(), LICENSE_RECHECK_MS);

        const sync = () => {
            panel.setTheme(detectTheme());
            // The extension runs on every Facebook page; the panel belongs inside groups only.
            panel.setVisible(location.pathname.startsWith('/groups/'));
        };
        sync();
        setInterval(sync, 1000);
    };

    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });
}
