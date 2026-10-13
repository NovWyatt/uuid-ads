const y = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M164.38,181.1a52,52,0,1,0-72.76,0,75.89,75.89,0,0,0-30,28.89,12,12,0,0,0,20.78,12,53,53,0,0,1,91.22,0,12,12,0,1,0,20.78-12A75.89,75.89,0,0,0,164.38,181.1ZM100,144a28,28,0,1,1,28,28A28,28,0,0,1,100,144Zm147.21,9.59a12,12,0,0,1-16.81-2.39c-8.33-11.09-19.85-19.59-29.33-21.64a12,12,0,0,1-1.82-22.91,20,20,0,1,0-24.78-28.3,12,12,0,1,1-21-11.6,44,44,0,1,1,73.28,48.35,92.18,92.18,0,0,1,22.85,21.69A12,12,0,0,1,247.21,153.59Zm-192.28-24c-9.48,2.05-21,10.55-29.33,21.65A12,12,0,0,1,6.41,136.79,92.37,92.37,0,0,1,29.26,115.1a44,44,0,1,1,73.28-48.35,12,12,0,1,1-21,11.6,20,20,0,1,0-24.78,28.3,12,12,0,0,1-1.82,22.91Z"/></svg>', o = {
  en: {
    locale: "en-US",
    subtitle: "License",
    badge: {
      active: "Activated",
      needs_activation: "Not activated",
      expired: "Expired",
      revoked: "Revoked",
      network_error: "Needs Internet",
      clock_behind: "Clock is behind",
      invalid: "Invalid",
      requires_revalidation: "Checking"
    },
    status: {
      active: "Exports are unlocked on this browser.",
      needs_activation: "Enter the license key you received to unlock exports.",
      expired: "This license key has expired. Enter a new key to continue.",
      revoked: "This license key was revoked. Contact the seller for a new key.",
      network_error: "Connect to the Internet so the license can be checked again.",
      clock_behind: "Your computer's clock is behind. Fix the date and time, then reopen this page.",
      invalid: "The saved license is not valid here. Enter your key again.",
      requires_revalidation: "Checking the license with the server..."
    },
    type: "Type",
    perpetual: "Lifetime",
    expires: (e) => `Until ${e}`,
    key: "Key",
    keyInput: "License key",
    keyInputChange: "Enter a different key",
    activate: "Activate",
    activating: "Activating...",
    activated: "Activated. Reload the Facebook tab if the panel stays locked.",
    remove: "Remove key from this browser",
    removeConfirm: "Remove the license key from this browser? The key itself stays valid; enter it again to unlock.",
    note: "Each key works on a limited number of browsers. To move it, ask the seller to reset its devices.",
    errors: {
      empty_key: "Enter your license key.",
      network: "Cannot reach the license server. Check your Internet connection and try again.",
      bad_certificate: "The server answered with a license this extension cannot use.",
      unknown_key: "This license key does not exist. Check it and try again.",
      wrong_product: "This key is for a different app.",
      expired: "This license key has expired.",
      revoked: "This license key was revoked.",
      device_revoked: "This browser was removed from the key by the seller.",
      device_limit: "This key is already in use on its maximum number of browsers. Ask the seller to reset its devices.",
      rate_limited: "Too many attempts. Wait a few minutes and try again."
    },
    unavailable: "The extension is not responding. Close and reopen this page."
  },
  vi: {
    locale: "vi-VN",
    subtitle: "Bản quyền",
    badge: {
      active: "Đã kích hoạt",
      needs_activation: "Chưa kích hoạt",
      expired: "Đã hết hạn",
      revoked: "Đã thu hồi",
      network_error: "Cần Internet",
      clock_behind: "Đồng hồ bị lùi",
      invalid: "Không hợp lệ",
      requires_revalidation: "Đang kiểm tra"
    },
    status: {
      active: "Đã mở khóa tải danh sách trên trình duyệt này.",
      needs_activation: "Nhập key bản quyền bạn nhận được để mở khóa tải danh sách.",
      expired: "Key bản quyền đã hết hạn. Nhập key mới để dùng tiếp.",
      revoked: "Key bản quyền đã bị thu hồi. Liên hệ người bán để nhận key mới.",
      network_error: "Cần kết nối Internet để xác thực lại key bản quyền.",
      clock_behind: "Ngày giờ trên máy đang bị lùi. Chỉnh lại ngày giờ rồi mở lại trang này.",
      invalid: "Bản quyền đã lưu không hợp lệ ở đây. Hãy nhập lại key.",
      requires_revalidation: "Đang kiểm tra key với máy chủ..."
    },
    type: "Loại",
    perpetual: "Vĩnh viễn",
    expires: (e) => `Đến ${e}`,
    key: "Key",
    keyInput: "Key bản quyền",
    keyInputChange: "Nhập key khác",
    activate: "Kích hoạt",
    activating: "Đang kích hoạt...",
    activated: "Đã kích hoạt. Nếu panel trên Facebook vẫn khóa, hãy tải lại trang.",
    remove: "Gỡ key khỏi trình duyệt này",
    removeConfirm: "Gỡ key bản quyền khỏi trình duyệt này? Key vẫn còn hiệu lực, nhập lại là dùng tiếp được.",
    note: "Mỗi key dùng được trên số trình duyệt giới hạn. Muốn chuyển sang máy khác, nhờ người bán đặt lại thiết bị.",
    errors: {
      empty_key: "Nhập key bản quyền.",
      network: "Không kết nối được máy chủ bản quyền. Kiểm tra Internet rồi thử lại.",
      bad_certificate: "Máy chủ trả về bản quyền mà tiện ích này không dùng được.",
      unknown_key: "Key bản quyền không tồn tại. Kiểm tra lại rồi thử lại.",
      wrong_product: "Key này dành cho ứng dụng khác.",
      expired: "Key bản quyền đã hết hạn.",
      revoked: "Key bản quyền đã bị thu hồi.",
      device_revoked: "Người bán đã gỡ trình duyệt này khỏi key.",
      device_limit: "Key đã dùng hết số trình duyệt cho phép. Nhờ người bán đặt lại thiết bị.",
      rate_limited: "Thử quá nhiều lần. Chờ ít phút rồi thử lại."
    },
    unavailable: "Tiện ích không phản hồi. Đóng rồi mở lại trang này."
  }
}, t = (navigator.language || "").toLowerCase().startsWith("vi") ? o.vi : o.en;
document.documentElement.lang = t === o.vi ? "vi" : "en";
const n = (e) => document.getElementById(e), k = n("activate-form"), s = n("key"), r = n("activate"), c = n("remove"), a = n("feedback");
chrome.tabs.getCurrent().then((e) => document.body.classList.toggle("in-tab", !!e));
n("logo").innerHTML = y;
n("title").textContent = chrome.runtime.getManifest().short_name || "FB Scraper";
n("subtitle").textContent = t.subtitle;
n("key-input-label").textContent = t.keyInput;
n("type-label").textContent = t.type;
n("key-label").textContent = t.key;
n("note").textContent = t.note;
r.textContent = t.activate;
c.textContent = t.remove;
function h(e) {
  return chrome.runtime.sendMessage(e).catch(() => null);
}
function d(e) {
  return e.error ? t.errors[e.error] ?? e.message ?? t.errors.network : "";
}
function l(e) {
  const i = n("badge");
  if (!e) {
    i.textContent = t.badge.invalid, i.className = "badge bad", n("status-text").textContent = t.unavailable;
    return;
  }
  i.textContent = t.badge[e.state] ?? e.state, i.className = `badge ${e.active ? "ok" : ["expired", "revoked", "invalid"].includes(e.state) ? "bad" : ""}`, n("status-text").textContent = t.status[e.state] ?? "", n("details").hidden = !e.active, e.active && (n("type-value").textContent = e.expiresAt ? t.expires(new Intl.DateTimeFormat(t.locale, { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(e.expiresAt))) : t.perpetual, n("key-value").textContent = e.keyHint ? `••••-${e.keyHint}` : "••••"), n("key-input-label").textContent = e.active ? t.keyInputChange : t.keyInput, c.hidden = !e.active;
}
k.addEventListener("submit", async (e) => {
  e.preventDefault(), r.disabled = !0, r.textContent = t.activating, a.textContent = "", a.className = "feedback";
  try {
    const i = await h({ type: "license:activate", key: s.value });
    l(i), i && !i.error && i.active ? (s.value = "", a.textContent = t.activated, a.className = "feedback ok") : a.textContent = i ? d(i) : t.unavailable;
  } finally {
    r.disabled = !1, r.textContent = t.activate;
  }
});
c.addEventListener("click", async () => {
  confirm(t.removeConfirm) && (l(await h({ type: "license:remove" })), a.textContent = "");
});
h({ type: "license:status" }).then((e) => {
  l(e), e != null && e.error && (a.textContent = d(e)), e != null && e.active || s.focus();
});
