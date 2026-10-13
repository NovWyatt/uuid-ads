const i = "uuid-ads-license", o = /* @__PURE__ */ new Set(["license:status", "license:open"]);
window.addEventListener("message", (n) => {
  if (n.source !== window) return;
  const e = n.data;
  !e || e.channel !== i || e.kind !== "request" || !o.has(e.type) || chrome.runtime.sendMessage({ type: e.type }).then(
    (s) => window.postMessage({ channel: i, kind: "response", id: e.id, reply: s }, location.origin),
    () => window.postMessage({ channel: i, kind: "response", id: e.id, reply: null }, location.origin)
  );
});
chrome.storage.onChanged.addListener((n, e) => {
  e === "local" && "certificate" in n && window.postMessage({ channel: i, kind: "changed" }, location.origin);
});
