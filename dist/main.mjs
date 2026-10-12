var J = Object.defineProperty;
var q = (n, t, e) => t in n ? J(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var m = (n, t, e) => q(n, typeof t != "symbol" ? t + "" : t, e);
function Z(n, t) {
  for (var e = function(a) {
    for (var l = "", p = 0; p < a.length; p++) {
      var d = a[p] === null || typeof a[p] > "u" ? "" : a[p].toString();
      a[p] instanceof Date && (d = a[p].toLocaleString());
      var u = d.replace(/"/g, '""');
      u.search(/("|,|\n)/g) >= 0 && (u = '"' + u + '"'), p > 0 && (l += ","), l += u;
    }
    return l + `
`;
  }, i = "", o = 0; o < t.length; o++)
    i += e(t[o]);
  var r = new Blob([i], { type: "text/csv;charset=utf-8;" }), s = document.createElement("a");
  if (s.download !== void 0) {
    var c = URL.createObjectURL(r);
    s.setAttribute("href", c), s.setAttribute("download", n), document.body.appendChild(s), s.click(), document.body.removeChild(s);
  }
}
const C = (n, t) => t.some((e) => n instanceof e);
let A, N;
function G() {
  return A || (A = [
    IDBIndex,
    IDBObjectStore,
    IDBCursor,
    IDBDatabase,
    IDBTransaction
  ]);
}
function Q() {
  return N || (N = ["advance", "continue", "continuePrimaryKey"].map((n) => IDBCursor.prototype[n]));
}
const S = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), y = /* @__PURE__ */ new WeakMap();
function tt(n) {
  const t = new Promise((e, i) => {
    const o = () => {
      n.removeEventListener("success", r), n.removeEventListener("error", s);
    }, r = () => {
      e(h(n.result)), o();
    }, s = () => {
      i(n.error), o();
    };
    n.addEventListener("success", r), n.addEventListener("error", s);
  });
  return y.set(t, n), t;
}
function et(n) {
  if (S.has(n))
    return;
  const t = new Promise((e, i) => {
    const o = () => {
      n.removeEventListener("complete", r), n.removeEventListener("error", s), n.removeEventListener("abort", s);
    }, r = () => {
      e(), o();
    }, s = () => {
      i(n.error || new DOMException("AbortError", "AbortError")), o();
    };
    n.addEventListener("complete", r), n.addEventListener("error", s), n.addEventListener("abort", s);
  });
  S.set(n, t);
}
let D = {
  get(n, t, e) {
    if (n instanceof IDBTransaction) {
      if (t === "done")
        return S.get(n);
      if (t === "store")
        return e.objectStoreNames[1] ? void 0 : e.objectStore(e.objectStoreNames[0]);
    }
    return h(n[t]);
  },
  set(n, t, e) {
    return n[t] = e, !0;
  },
  has(n, t) {
    return n instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in n;
  }
};
function W(n) {
  D = n(D);
}
function nt(n) {
  return Q().includes(n) ? function(...t) {
    return n.apply(I(this), t), h(this.request);
  } : function(...t) {
    return h(n.apply(I(this), t));
  };
}
function it(n) {
  return typeof n == "function" ? nt(n) : (n instanceof IDBTransaction && et(n), C(n, G()) ? new Proxy(n, D) : n);
}
function h(n) {
  if (n instanceof IDBRequest)
    return tt(n);
  if (B.has(n))
    return B.get(n);
  const t = it(n);
  return Object.is(t, n) || (B.set(n, t), y.set(t, n)), t;
}
const I = (n) => y.get(n);
function ot(n, t, { blocked: e, upgrade: i, blocking: o, terminated: r } = {}) {
  const s = indexedDB.open(n, t), c = h(s);
  return i && s.addEventListener("upgradeneeded", (a) => {
    i(h(s.result), a.oldVersion, a.newVersion, h(s.transaction), a);
  }), e && s.addEventListener("blocked", (a) => e(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    a.oldVersion,
    a.newVersion,
    a
  )), c.then((a) => {
    r && a.addEventListener("close", () => r()), o && a.addEventListener("versionchange", (l) => o(l.oldVersion, l.newVersion, l));
  }).catch(() => {
  }), c;
}
const rt = ["get", "getKey", "getAll", "getAllKeys", "count"], st = ["put", "add", "delete", "clear"], k = {};
function P(n, t) {
  if (!(n instanceof IDBDatabase && !(t in n) && typeof t == "string"))
    return;
  if (k[t])
    return k[t];
  const e = t.replace(/FromIndex$/, ""), i = t !== e, o = st.includes(e);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(e in (i ? IDBIndex : IDBObjectStore).prototype) || !(o || rt.includes(e))
  )
    return;
  const r = async function(s, ...c) {
    const a = this.transaction(s, o ? "readwrite" : "readonly");
    let l = a.store;
    return i && (l = l.index(c.shift())), (await Promise.all([
      l[e](...c),
      o && a.done
    ]))[0];
  };
  return k[t] = r;
}
W((n) => ({
  ...n,
  get: (t, e, i) => P(t, e) || n.get(t, e, i),
  has: (t, e) => !!P(t, e) || n.has(t, e)
}));
const at = ["advance", "continue", "continuePrimaryKey"], j = {}, L = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new WeakMap(), ct = {
  get(n, t) {
    if (!at.includes(t))
      return n[t];
    let e = j[t];
    return e || (e = j[t] = function(...i) {
      L.set(this, $.get(this)[t](...i));
    }), e;
  }
};
async function* lt(...n) {
  let t = this;
  if (t instanceof IDBCursor || (t = await t.openCursor(...n)), !t)
    return;
  t = t;
  const e = new Proxy(t, ct);
  for ($.set(e, t), y.set(e, I(t)); t; )
    yield e, t = await (L.get(e) || t.continue()), L.delete(e);
}
function F(n, t) {
  return t === Symbol.asyncIterator && C(n, [IDBIndex, IDBObjectStore, IDBCursor]) || t === "iterate" && C(n, [IDBIndex, IDBObjectStore]);
}
W((n) => ({
  ...n,
  get(t, e, i) {
    return F(t, e) ? lt : n.get(t, e, i);
  },
  has(t, e) {
    return F(t, e) || n.has(t, e);
  }
}));
var f = function(n, t, e, i) {
  function o(r) {
    return r instanceof e ? r : new e(function(s) {
      s(r);
    });
  }
  return new (e || (e = Promise))(function(r, s) {
    function c(p) {
      try {
        l(i.next(p));
      } catch (d) {
        s(d);
      }
    }
    function a(p) {
      try {
        l(i.throw(p));
      } catch (d) {
        s(d);
      }
    }
    function l(p) {
      p.done ? r(p.value) : o(p.value).then(c, a);
    }
    l((i = i.apply(n, t || [])).next());
  });
}, dt = function(n, t) {
  var e = {};
  for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && t.indexOf(i) < 0 && (e[i] = n[i]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, i = Object.getOwnPropertySymbols(n); o < i.length; o++)
      t.indexOf(i[o]) < 0 && Object.prototype.propertyIsEnumerable.call(n, i[o]) && (e[i[o]] = n[i[o]]);
  return e;
};
class pt {
  constructor(t) {
    this.name = "scrape-storage", this.persistent = !0, this.data = /* @__PURE__ */ new Map(), t != null && t.name && (this.name = t.name), t != null && t.persistent && (this.persistent = t.persistent), this.initDB().then(() => {
    }).catch(() => {
      this.persistent = !1;
    });
  }
  get storageKey() {
    return `storage-${this.name}`;
  }
  initDB() {
    return f(this, void 0, void 0, function* () {
      this.db = yield ot(this.storageKey, 6, {
        upgrade(t, e, i, o) {
          let r;
          if (e < 5)
            try {
              t.deleteObjectStore("data");
            } catch {
            }
          t.objectStoreNames.contains("data") ? r = o.objectStore("data") : r = t.createObjectStore("data", {
            keyPath: "_id",
            autoIncrement: !0
          }), r && !r.indexNames.contains("_createdAt") && r.createIndex("_createdAt", "_createdAt"), r && !r.indexNames.contains("_groupId") && r.createIndex("_groupId", "_groupId"), r && !r.indexNames.contains("_pk") && r.createIndex("_pk", "_pk", {
            unique: !0
          });
        }
      });
    });
  }
  _dbGetElem(t, e) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        return e || (e = this.db.transaction("data", "readonly")), yield e.store.index("_pk").get(t);
      throw new Error("DB doesnt exist");
    });
  }
  getElem(t) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbGetElem(t);
        } catch (e) {
          console.error(e);
        }
      else
        this.data.get(t);
    });
  }
  _dbSetElem(t, e, i = !1, o, r) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let s = !1;
        r || (r = this.db.transaction("data", "readwrite"));
        const c = r.store, a = yield c.index("_pk").get(t);
        if (a)
          i && (yield c.put(Object.assign(Object.assign({}, a), e)), s = !0);
        else {
          const l = Object.assign({ _pk: t, _createdAt: /* @__PURE__ */ new Date() }, e);
          o && (l._groupId = o), yield c.put(l), s = !0;
        }
        return s;
      } else
        throw new Error("DB doesnt exist");
    });
  }
  addElem(t, e, i = !1, o) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbSetElem(t, e, i, o);
        } catch (r) {
          console.error(r);
        }
      else
        this.data.set(t, e);
      return !0;
    });
  }
  addElems(t, e = !1, i) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const o = [], r = this.db.transaction("data", "readwrite"), s = [];
        if (t.forEach(([c, a]) => {
          s.indexOf(c) === -1 && (s.push(c), o.push(this._dbSetElem(c, a, e, i, r)));
        }), o.length > 0) {
          o.push(r.done);
          const c = yield Promise.all(o);
          let a = 0;
          return c.forEach((l) => {
            typeof l == "boolean" && l && (a += 1);
          }), a;
        }
        return 0;
      } else
        return t.forEach(([o, r]) => {
          this.addElem(o, r);
        }), t.length;
    });
  }
  deleteFromGroupId(t) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let e = 0, o = yield this.db.transaction("data", "readwrite").store.index("_groupId").openCursor(IDBKeyRange.only(t));
        for (; o; )
          o.delete(), o = yield o.continue(), e += 1;
        return e;
      } else
        throw new Error("Not Implemented Error");
    });
  }
  clear() {
    return f(this, void 0, void 0, function* () {
      this.persistent && this.db ? yield this.db.clear("data") : this.data.clear();
    });
  }
  getCount() {
    return f(this, void 0, void 0, function* () {
      return this.persistent && this.db ? yield this.db.count("data") : this.data.size;
    });
  }
  getAll() {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const t = /* @__PURE__ */ new Map(), e = yield this.db.getAll("data");
        return e && e.forEach((i) => {
          const { _id: o } = i, r = dt(i, ["_id"]);
          t.set(o, r);
        }), t;
      } else
        return this.data;
    });
  }
  toCsvData() {
    return f(this, void 0, void 0, function* () {
      const t = [];
      return t.push(this.headers), (yield this.getAll()).forEach((i) => {
        try {
          t.push(this.itemToRow(i));
        } catch (o) {
          console.error(o);
        }
      }), t;
    });
  }
}
var V;
(function(n) {
  n.ADD = "add", n.LOG = "log";
})(V || (V = {}));
class mt extends pt {
  constructor() {
    super(...arguments);
    m(this, "name", "fb-scrape-storage");
  }
  get headers() {
    return [
      "Profile Id",
      "Full Name",
      "Profile Link",
      "Bio",
      "ImageSrc",
      "GroupId",
      "Group Joining Text",
      "Profile Type"
    ];
  }
  itemToRow(e) {
    return [
      e.profileId,
      e.fullName,
      e.profileLink,
      e.bio,
      e.imageSrc,
      e.groupId,
      e.groupJoiningText,
      e.profileType
    ];
  }
}
const b = new mt(), ut = `
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
function ft() {
  if (document.getElementById("fbs-styles")) return;
  const n = document.createElement("style");
  n.id = "fbs-styles", n.textContent = ut, document.head.appendChild(n);
}
const g = {
  grip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>',
  minimize: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>',
  expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
};
class ht {
  constructor() {
    m(this, "panel");
    m(this, "body");
    m(this, "counterEl");
    m(this, "groupCountEl");
    m(this, "statusEl");
    m(this, "statusDot");
    m(this, "headerBadge");
    m(this, "logEntries");
    m(this, "scrollBtn");
    m(this, "minimizeBtn");
    m(this, "resetBtn");
    m(this, "isMinimized", !1);
    m(this, "isScrolling", !1);
    m(this, "scrollTimer", null);
    m(this, "groups", /* @__PURE__ */ new Set());
    m(this, "pulseTimer", null);
    m(this, "confirmingReset", !1);
    m(this, "confirmTimer", null);
    m(this, "isDragging", !1);
    m(this, "dragOffX", 0);
    m(this, "dragOffY", 0);
    this.build(), this.setupDrag();
  }
  // ── Build DOM ──
  build() {
    var u;
    (u = document.getElementById("fbs-panel")) == null || u.remove(), this.panel = document.createElement("div"), this.panel.id = "fbs-panel", this.panel.className = "fbs-panel";
    const t = document.createElement("div");
    t.className = "fbs-header";
    const e = document.createElement("span");
    e.className = "fbs-drag-icon", e.innerHTML = g.grip;
    const i = document.createElement("span");
    i.className = "fbs-title", i.textContent = "FB Scraper", this.statusDot = document.createElement("span"), this.statusDot.className = "fbs-status-dot", this.headerBadge = document.createElement("span"), this.headerBadge.className = "fbs-header-badge", this.headerBadge.textContent = "0";
    const o = document.createElement("div");
    o.className = "fbs-header-right", this.minimizeBtn = document.createElement("button"), this.minimizeBtn.className = "fbs-icon-btn", this.minimizeBtn.innerHTML = g.minimize, this.minimizeBtn.addEventListener("click", (x) => {
      x.stopPropagation(), this.toggleMinimize();
    }), o.appendChild(this.minimizeBtn), t.append(e, i, this.statusDot, this.headerBadge, o), this.body = document.createElement("div"), this.body.className = "fbs-body";
    const r = document.createElement("div");
    r.className = "fbs-stats", this.counterEl = document.createElement("span"), this.counterEl.className = "fbs-counter", this.counterEl.textContent = "0";
    const s = document.createElement("div");
    s.className = "fbs-counter-label", s.textContent = "members captured", this.groupCountEl = document.createElement("span"), this.groupCountEl.className = "fbs-group-count", this.groupCountEl.textContent = "from 0 groups", r.append(this.counterEl, s, this.groupCountEl), this.statusEl = document.createElement("div"), this.statusEl.className = "fbs-status", this.statusEl.textContent = "Go to a group's Members tab to start";
    const c = document.createElement("div");
    c.className = "fbs-actions";
    const a = document.createElement("button");
    a.className = "fbs-btn fbs-btn-primary", a.innerHTML = `${g.download} Download CSV`, a.addEventListener("click", () => this.download());
    const l = document.createElement("div");
    l.className = "fbs-btn-row", this.scrollBtn = document.createElement("button"), this.scrollBtn.className = "fbs-btn fbs-btn-secondary", this.scrollBtn.textContent = "Auto Scroll", this.scrollBtn.addEventListener("click", () => this.toggleAutoScroll()), this.resetBtn = document.createElement("button"), this.resetBtn.className = "fbs-btn fbs-btn-outline", this.resetBtn.textContent = "Reset", this.resetBtn.addEventListener("click", () => this.handleReset()), l.append(this.scrollBtn, this.resetBtn), c.append(a, l);
    const p = document.createElement("div");
    p.className = "fbs-log";
    const d = document.createElement("div");
    d.className = "fbs-log-title", d.textContent = "Activity", this.logEntries = document.createElement("div"), this.logEntries.className = "fbs-log-entries", p.append(d, this.logEntries), this.body.append(r, this.statusEl, c, p), this.panel.append(t, this.body);
  }
  // ── Drag ──
  setupDrag() {
    this.panel.querySelector(".fbs-header").addEventListener("mousedown", (e) => {
      if (e.target.closest(".fbs-icon-btn")) return;
      this.isDragging = !0;
      const i = this.panel.getBoundingClientRect();
      this.dragOffX = e.clientX - i.left, this.dragOffY = e.clientY - i.top, this.panel.style.transition = "none", e.preventDefault();
    }), window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const i = Math.max(0, Math.min(e.clientX - this.dragOffX, window.innerWidth - 100)), o = Math.max(0, Math.min(e.clientY - this.dragOffY, window.innerHeight - 50));
      this.panel.style.right = "auto", this.panel.style.bottom = "auto", this.panel.style.left = i + "px", this.panel.style.top = o + "px";
    }), window.addEventListener("mouseup", () => {
      this.isDragging && (this.isDragging = !1, this.panel.style.transition = "");
    });
  }
  // ── Public ──
  render() {
    document.body.appendChild(this.panel), this.refreshCounter().then((t) => {
      t > 0 ? this.addLog(`Loaded ${t.toLocaleString()} from cache`) : this.addLog("Ready");
    });
  }
  async onCapture(t, e) {
    e && this.groups.add(e), this.groupCountEl.textContent = `from ${this.groups.size} group${this.groups.size !== 1 ? "s" : ""}`, await this.refreshCounter(), this.addLog(`+${t} members`), this.statusDot.classList.add("fbs-dot-active"), this.statusEl.textContent = "Capturing members... keep scrolling!", this.panel.classList.remove("fbs-pulse"), this.panel.offsetWidth, this.panel.classList.add("fbs-pulse"), this.pulseTimer && clearTimeout(this.pulseTimer), this.pulseTimer = setTimeout(() => {
      this.panel.classList.remove("fbs-pulse"), this.statusDot.classList.remove("fbs-dot-active"), this.statusEl.textContent = "Scroll for more, or download when ready";
    }, 2500);
  }
  // ── Private ──
  async refreshCounter() {
    const t = await b.getCount(), e = t.toLocaleString();
    return this.counterEl.textContent = e, this.headerBadge.textContent = e, t;
  }
  addLog(t) {
    var r;
    const e = document.createElement("div");
    e.className = "fbs-log-entry";
    const i = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }), o = document.createElement("span");
    for (o.className = "fbs-log-time", o.textContent = i, e.appendChild(o), e.appendChild(document.createTextNode(t)), this.logEntries.prepend(e); this.logEntries.children.length > 50; )
      (r = this.logEntries.lastChild) == null || r.remove();
  }
  toggleMinimize() {
    this.isMinimized = !this.isMinimized, this.body.style.display = this.isMinimized ? "none" : "", this.minimizeBtn.innerHTML = this.isMinimized ? g.expand : g.minimize;
  }
  toggleAutoScroll() {
    this.isScrolling = !this.isScrolling, this.isScrolling ? (this.scrollBtn.textContent = "Stop Scroll", this.scrollBtn.classList.add("fbs-btn-active"), this.scrollTimer = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 150), this.addLog("Auto-scroll started")) : (this.scrollBtn.textContent = "Auto Scroll", this.scrollBtn.classList.remove("fbs-btn-active"), this.scrollTimer && (clearInterval(this.scrollTimer), this.scrollTimer = null), this.addLog("Auto-scroll stopped"));
  }
  async download() {
    const t = await b.getCount();
    if (t === 0) {
      this.addLog("No data to download");
      return;
    }
    const e = await b.toCsvData(), i = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    try {
      Z(`fb-members-${i}.csv`, e), this.addLog(`Downloaded ${t.toLocaleString()} members`);
    } catch (o) {
      this.addLog("Download failed"), console.error(o);
    }
  }
  handleReset() {
    this.confirmingReset ? (this.confirmTimer && clearTimeout(this.confirmTimer), this.cancelReset(), b.clear().then(() => {
      this.groups.clear(), this.groupCountEl.textContent = "from 0 groups", this.refreshCounter(), this.addLog("All data cleared"), this.statusEl.textContent = "Go to a group's Members tab to start";
    })) : (this.confirmingReset = !0, this.resetBtn.textContent = "Confirm?", this.resetBtn.classList.add("fbs-confirm"), this.confirmTimer = setTimeout(() => {
      this.cancelReset();
    }, 3e3));
  }
  cancelReset() {
    this.confirmingReset = !1, this.resetBtn.textContent = "Reset", this.resetBtn.classList.remove("fbs-confirm");
  }
}
let _;
function gt(n) {
  var r, s, c, a, l, p;
  let t;
  if ((r = n == null ? void 0 : n.data) != null && r.group)
    t = n.data.group;
  else if (((c = (s = n == null ? void 0 : n.data) == null ? void 0 : s.node) == null ? void 0 : c.__typename) === "Group")
    t = n.data.node;
  else
    return;
  let e;
  if ((a = t == null ? void 0 : t.new_members) != null && a.edges)
    e = t.new_members.edges;
  else if ((l = t == null ? void 0 : t.new_forum_members) != null && l.edges)
    e = t.new_forum_members.edges;
  else if ((p = t == null ? void 0 : t.search_results) != null && p.edges)
    e = t.search_results.edges;
  else
    return;
  const i = [];
  let o;
  e.forEach((d) => {
    var T, M, O, z, R;
    const u = d.node.__isEntity === "GroupUserInvite" ? d.node.invitee_profile : d.node;
    if (!u) return;
    const { id: x, name: K, bio_text: v, url: U, profile_picture: w, __isProfile: X } = u, Y = ((T = d == null ? void 0 : d.join_status_text) == null ? void 0 : T.text) || ((O = (M = d == null ? void 0 : d.membership) == null ? void 0 : M.join_status_text) == null ? void 0 : O.text), E = (R = (z = u.group_membership) == null ? void 0 : z.associated_group) == null ? void 0 : R.id;
    E && (o = E), i.push([x, {
      profileId: x,
      fullName: K,
      profileLink: U,
      bio: (v == null ? void 0 : v.text) || "",
      imageSrc: (w == null ? void 0 : w.uri) || "",
      groupId: E || "",
      groupJoiningText: Y || "",
      profileType: X || ""
    }]);
  }), i.length > 0 && b.addElems(i).then((d) => {
    typeof d == "number" && d > 0 && _.onCapture(d, o);
  });
}
function H(n) {
  const t = [];
  try {
    t.push(JSON.parse(n));
  } catch {
    const e = n.split(`
`);
    if (e.length <= 1) return;
    for (const i of e)
      try {
        t.push(JSON.parse(i));
      } catch {
      }
  }
  for (const e of t)
    gt(e);
}
function bt() {
  ft(), _ = new ht(), _.render();
  const n = "/api/graphql/", t = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener("readystatechange", function() {
      this.responseURL.includes(n) && this.readyState === 4 && H(this.responseText);
    }, !1), t.apply(this, arguments);
  };
  const e = window.fetch;
  window.fetch = async function(...i) {
    const o = await e.apply(this, i);
    return (typeof i[0] == "string" ? i[0] : i[0] instanceof Request ? i[0].url : "").includes(n) && o.clone().text().then((c) => H(c)).catch(() => {
    }), o;
  };
}
bt();
