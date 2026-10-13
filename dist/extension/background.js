const S = "https://license.wyattos.cyou", h = "uuid-ads", R = "4INHO7vbMjw1KJ0PTcIoAkPyw8mEAcsQPKyOVhvNLag";
const g = new TextEncoder();
function T(e) {
  return JSON.stringify({
    check_after: e.check_after,
    device_hash: e.device_hash,
    expires_at: e.expires_at,
    issued_at: e.issued_at,
    license_id: e.license_id,
    license_type: e.license_type,
    product: e.product,
    status: e.status,
    v: e.v
  });
}
function w(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(e.length / 4) * 4, "=");
  return Uint8Array.from(atob(t), (r) => r.charCodeAt(0));
}
function m(e) {
  let t = "";
  for (const r of new Uint8Array(e)) t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function L(e) {
  return m(await crypto.subtle.digest("SHA-256", g.encode(e)));
}
function N() {
  return m(crypto.getRandomValues(new Uint8Array(24)));
}
function u(e) {
  if (typeof e != "string" || !e) return null;
  const t = Date.parse(e);
  return Number.isFinite(t) ? t : null;
}
async function U(e, t, r = R) {
  try {
    const i = await crypto.subtle.importKey("raw", w(r), { name: "Ed25519" }, !1, ["verify"]);
    return await crypto.subtle.verify("Ed25519", i, w(t), g.encode(T(e)));
  } catch {
    return !1;
  }
}
async function E(e) {
  const { certificate: t, signature: r, deviceId: i, now: a } = e;
  if (!t || typeof t != "object" || typeof r != "string" || !r || !i)
    return { state: "needs_activation" };
  const n = t;
  if (!await U(n, r, e.publicKeyB64)) return { state: "invalid" };
  if (n.v !== 2 || n.product !== h || n.status !== "active") return { state: "invalid" };
  if (n.device_hash !== await L(i)) return { state: "invalid" };
  const d = [u(n.issued_at), e.trustedAt ?? null].filter((b) => b !== null);
  if (d.length && a < Math.max(...d) - 864e5) return { state: "clock_behind", certificate: n };
  const f = u(n.expires_at);
  if (f !== null && f <= a) return { state: "expired", certificate: n };
  const v = u(n.check_after);
  return v === null ? { state: "invalid" } : v <= a ? { state: "requires_revalidation", certificate: n } : { state: "active", certificate: n };
}
const x = /* @__PURE__ */ new Set(["revoked", "expired", "device_revoked", "device_not_activated", "unknown_key"]);
function I(e) {
  return e === "expired" ? "expired" : e === "revoked" || e === "device_revoked" ? "revoked" : "needs_activation";
}
const O = 24 * 60 * 60 * 1e3, M = 15e3;
async function o() {
  return await chrome.storage.local.get(null);
}
async function l() {
  const { deviceId: e } = await o();
  if (e) return e;
  const t = N();
  return await chrome.storage.local.set({ deviceId: t }), t;
}
function D() {
  var i;
  const e = navigator.userAgentData, t = (i = e == null ? void 0 : e.brands) == null ? void 0 : i.find((a) => !/not.?a.?brand|chromium/i.test(a.brand));
  return `${t ? `${t.brand} ${t.version}` : "Chrome"} · ${(e == null ? void 0 : e.platform) || "browser"}`.slice(0, 80);
}
async function A(e, t) {
  try {
    return await (await fetch(`${S}${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, product: h, appVersion: chrome.runtime.getManifest().version }),
      signal: AbortSignal.timeout(M)
    })).json();
  } catch {
    return null;
  }
}
function c(e, t, r) {
  const i = e.certificate;
  return {
    state: e.state,
    active: e.state === "active",
    licenseType: i == null ? void 0 : i.license_type,
    expiresAt: i == null ? void 0 : i.expires_at,
    keyHint: t.keyHint,
    ...r
  };
}
async function k(e, t = {}) {
  const r = await o(), i = Date.now(), a = await E({ certificate: e.certificate, signature: e.signature, deviceId: await l(), now: i, trustedAt: r.trustedAt });
  return a.state === "active" && (await chrome.storage.local.set({ certificate: e.certificate, signature: e.signature, trustedAt: i, lastCheckAt: i, ...t }), await chrome.storage.local.remove("lastRuling")), a;
}
async function C(e) {
  await chrome.storage.local.remove(["certificate", "signature", "keyHint", "lastCheckAt", "lastRuling"]), e && await chrome.storage.local.set({ lastRuling: e });
}
let y = null;
function _() {
  return y ?? (y = (async () => {
    var e;
    try {
      const t = await o(), r = await A("/api/validate", { licenseId: (e = t.certificate) == null ? void 0 : e.license_id, deviceId: await l() });
      if (!r) return c({ state: "network_error", certificate: t.certificate }, t);
      if (r.error) {
        const a = String(r.code || "");
        return x.has(a) ? (await C(a), c({ state: I(a) }, {}, { error: a, message: r.error })) : c({ state: "network_error", certificate: t.certificate }, t, { error: a || "network", message: r.error });
      }
      const i = await k(r);
      return c(i, await o());
    } finally {
      y = null;
    }
  })());
}
async function s() {
  const e = await o(), t = Date.now(), r = await E({ certificate: e.certificate, signature: e.signature, deviceId: e.deviceId ?? "", now: t, trustedAt: e.trustedAt });
  return r.state === "requires_revalidation" ? _() : r.state === "needs_activation" && e.lastRuling ? c({ state: I(e.lastRuling) }, e) : (r.state === "active" && ((!e.trustedAt || t > e.trustedAt) && await chrome.storage.local.set({ trustedAt: t }), t - (e.lastCheckAt ?? 0) > O && _()), c(r, e));
}
async function H(e) {
  const t = String(e || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!t) return { ...await s(), error: "empty_key" };
  const r = await A("/api/activate", { key: t, deviceId: await l(), deviceLabel: D() });
  if (!r) return { ...await s(), error: "network" };
  if (r.error) return { ...await s(), error: String(r.code || "server_error"), message: r.error };
  const i = await k(r, { keyHint: t.slice(-4) });
  return i.state !== "active" ? { ...await s(), error: "bad_certificate" } : c(i, await o());
}
function p(e) {
  var t;
  return e.id === chrome.runtime.id && !!((t = e.url) != null && t.startsWith(chrome.runtime.getURL("")));
}
async function V(e, t) {
  if (t.id !== chrome.runtime.id) return null;
  switch (e == null ? void 0 : e.type) {
    case "license:status":
      return s();
    case "license:open":
      return await chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") }), !0;
    case "license:activate":
      return p(t) ? H(e.key) : null;
    case "license:remove":
      return p(t) ? (await C(), s()) : null;
    default:
      return null;
  }
}
chrome.runtime.onMessage.addListener((e, t, r) => (V(e, t).then(r, () => r(null)), !0));
