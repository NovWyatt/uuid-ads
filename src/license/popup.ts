// The activation page: the toolbar popup, and the tab the panel opens from its
// "Enter license key" button. Talks only to the background.

import iconUsers from '@phosphor-icons/core/bold/users-three-bold.svg?raw';
import type { ExtensionRequest, LicenseView } from './messages';

const TEXT = {
    en: {
        locale: 'en-US',
        subtitle: 'License',
        badge: {
            active: 'Activated', needs_activation: 'Not activated', expired: 'Expired', revoked: 'Revoked',
            network_error: 'Needs Internet', clock_behind: 'Clock is behind', invalid: 'Invalid', requires_revalidation: 'Checking',
        } as Record<string, string>,
        status: {
            active: 'Exports are unlocked on this browser.',
            needs_activation: 'Enter the license key you received to unlock exports.',
            expired: 'This license key has expired. Enter a new key to continue.',
            revoked: 'This license key was revoked. Contact the seller for a new key.',
            network_error: 'Connect to the Internet so the license can be checked again.',
            clock_behind: "Your computer's clock is behind. Fix the date and time, then reopen this page.",
            invalid: 'The saved license is not valid here. Enter your key again.',
            requires_revalidation: 'Checking the license with the server...',
        } as Record<string, string>,
        type: 'Type',
        perpetual: 'Lifetime',
        expires: (date: string) => `Until ${date}`,
        key: 'Key',
        keyInput: 'License key',
        keyInputChange: 'Enter a different key',
        activate: 'Activate',
        activating: 'Activating...',
        activated: 'Activated. Reload the Facebook tab if the panel stays locked.',
        remove: 'Remove key from this browser',
        removeConfirm: 'Remove the license key from this browser? The key itself stays valid; enter it again to unlock.',
        note: 'Each key works on a limited number of browsers. To move it, ask the seller to reset its devices.',
        errors: {
            empty_key: 'Enter your license key.',
            network: 'Cannot reach the license server. Check your Internet connection and try again.',
            bad_certificate: 'The server answered with a license this extension cannot use.',
            unknown_key: 'This license key does not exist. Check it and try again.',
            wrong_product: 'This key is for a different app.',
            expired: 'This license key has expired.',
            revoked: 'This license key was revoked.',
            device_revoked: 'This browser was removed from the key by the seller.',
            device_limit: 'This key is already in use on its maximum number of browsers. Ask the seller to reset its devices.',
            rate_limited: 'Too many attempts. Wait a few minutes and try again.',
        } as Record<string, string>,
        unavailable: 'The extension is not responding. Close and reopen this page.',
    },
    vi: {
        locale: 'vi-VN',
        subtitle: 'Bản quyền',
        badge: {
            active: 'Đã kích hoạt', needs_activation: 'Chưa kích hoạt', expired: 'Đã hết hạn', revoked: 'Đã thu hồi',
            network_error: 'Cần Internet', clock_behind: 'Đồng hồ bị lùi', invalid: 'Không hợp lệ', requires_revalidation: 'Đang kiểm tra',
        } as Record<string, string>,
        status: {
            active: 'Đã mở khóa tải danh sách trên trình duyệt này.',
            needs_activation: 'Nhập key bản quyền bạn nhận được để mở khóa tải danh sách.',
            expired: 'Key bản quyền đã hết hạn. Nhập key mới để dùng tiếp.',
            revoked: 'Key bản quyền đã bị thu hồi. Liên hệ người bán để nhận key mới.',
            network_error: 'Cần kết nối Internet để xác thực lại key bản quyền.',
            clock_behind: 'Ngày giờ trên máy đang bị lùi. Chỉnh lại ngày giờ rồi mở lại trang này.',
            invalid: 'Bản quyền đã lưu không hợp lệ ở đây. Hãy nhập lại key.',
            requires_revalidation: 'Đang kiểm tra key với máy chủ...',
        } as Record<string, string>,
        type: 'Loại',
        perpetual: 'Vĩnh viễn',
        expires: (date: string) => `Đến ${date}`,
        key: 'Key',
        keyInput: 'Key bản quyền',
        keyInputChange: 'Nhập key khác',
        activate: 'Kích hoạt',
        activating: 'Đang kích hoạt...',
        activated: 'Đã kích hoạt. Nếu panel trên Facebook vẫn khóa, hãy tải lại trang.',
        remove: 'Gỡ key khỏi trình duyệt này',
        removeConfirm: 'Gỡ key bản quyền khỏi trình duyệt này? Key vẫn còn hiệu lực, nhập lại là dùng tiếp được.',
        note: 'Mỗi key dùng được trên số trình duyệt giới hạn. Muốn chuyển sang máy khác, nhờ người bán đặt lại thiết bị.',
        errors: {
            empty_key: 'Nhập key bản quyền.',
            network: 'Không kết nối được máy chủ bản quyền. Kiểm tra Internet rồi thử lại.',
            bad_certificate: 'Máy chủ trả về bản quyền mà tiện ích này không dùng được.',
            unknown_key: 'Key bản quyền không tồn tại. Kiểm tra lại rồi thử lại.',
            wrong_product: 'Key này dành cho ứng dụng khác.',
            expired: 'Key bản quyền đã hết hạn.',
            revoked: 'Key bản quyền đã bị thu hồi.',
            device_revoked: 'Người bán đã gỡ trình duyệt này khỏi key.',
            device_limit: 'Key đã dùng hết số trình duyệt cho phép. Nhờ người bán đặt lại thiết bị.',
            rate_limited: 'Thử quá nhiều lần. Chờ ít phút rồi thử lại.',
        } as Record<string, string>,
        unavailable: 'Tiện ích không phản hồi. Đóng rồi mở lại trang này.',
    },
};

const T = (navigator.language || '').toLowerCase().startsWith('vi') ? TEXT.vi : TEXT.en;
document.documentElement.lang = T === TEXT.vi ? 'vi' : 'en';

const $ = <E extends HTMLElement>(id: string) => document.getElementById(id) as E;
const form = $<HTMLFormElement>('activate-form');
const keyInput = $<HTMLInputElement>('key');
const activateBtn = $<HTMLButtonElement>('activate');
const removeBtn = $<HTMLButtonElement>('remove');
const feedback = $<HTMLParagraphElement>('feedback');

// The toolbar popup has no tab; the page opened from the panel does.
chrome.tabs.getCurrent().then(tab => document.body.classList.toggle('in-tab', !!tab));

$('logo').innerHTML = iconUsers;
$('title').textContent = chrome.runtime.getManifest().short_name || 'FB Scraper';
$('subtitle').textContent = T.subtitle;
$('key-input-label').textContent = T.keyInput;
$('type-label').textContent = T.type;
$('key-label').textContent = T.key;
$('note').textContent = T.note;
activateBtn.textContent = T.activate;
removeBtn.textContent = T.remove;

function send(message: ExtensionRequest): Promise<LicenseView | null> {
    return chrome.runtime.sendMessage(message).catch(() => null);
}

function errorText(view: LicenseView): string {
    if (!view.error) return '';
    return T.errors[view.error] ?? view.message ?? T.errors.network;
}

function render(view: LicenseView | null) {
    const badge = $('badge');
    if (!view) {
        badge.textContent = T.badge.invalid;
        badge.className = 'badge bad';
        $('status-text').textContent = T.unavailable;
        return;
    }
    badge.textContent = T.badge[view.state] ?? view.state;
    badge.className = `badge ${view.active ? 'ok' : ['expired', 'revoked', 'invalid'].includes(view.state) ? 'bad' : ''}`;
    $('status-text').textContent = T.status[view.state] ?? '';

    $('details').hidden = !view.active;
    if (view.active) {
        $('type-value').textContent = view.expiresAt
            // The server ends a key at the end of its last day in Vietnam time; show that day.
            ? T.expires(new Intl.DateTimeFormat(T.locale, { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(view.expiresAt)))
            : T.perpetual;
        $('key-value').textContent = view.keyHint ? `••••-${view.keyHint}` : '••••';
    }
    $('key-input-label').textContent = view.active ? T.keyInputChange : T.keyInput;
    removeBtn.hidden = !view.active;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    activateBtn.disabled = true;
    activateBtn.textContent = T.activating;
    feedback.textContent = '';
    feedback.className = 'feedback';
    try {
        const view = await send({ type: 'license:activate', key: keyInput.value });
        render(view);
        if (view && !view.error && view.active) {
            keyInput.value = '';
            feedback.textContent = T.activated;
            feedback.className = 'feedback ok';
        } else {
            feedback.textContent = view ? errorText(view) : T.unavailable;
        }
    } finally {
        activateBtn.disabled = false;
        activateBtn.textContent = T.activate;
    }
});

removeBtn.addEventListener('click', async () => {
    if (!confirm(T.removeConfirm)) return;
    render(await send({ type: 'license:remove' }));
    feedback.textContent = '';
});

send({ type: 'license:status' }).then(view => {
    render(view);
    if (view?.error) feedback.textContent = errorText(view);
    if (!view?.active) keyInput.focus();
});
