var Q = Object.defineProperty;
var tt = (e, t, n) => t in e ? Q(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var m = (e, t, n) => tt(e, typeof t != "symbol" ? t + "" : t, n);
function et(e, t) {
  for (var n = function(a) {
    for (var d = "", u = 0; u < a.length; u++) {
      var p = a[u] === null || typeof a[u] > "u" ? "" : a[u].toString();
      a[u] instanceof Date && (p = a[u].toLocaleString());
      var h = p.replace(/"/g, '""');
      h.search(/("|,|\n)/g) >= 0 && (h = '"' + h + '"'), u > 0 && (d += ","), d += h;
    }
    return d + `
`;
  }, i = "", o = 0; o < t.length; o++)
    i += n(t[o]);
  var r = new Blob([i], { type: "text/csv;charset=utf-8;" }), s = document.createElement("a");
  if (s.download !== void 0) {
    var c = URL.createObjectURL(r);
    s.setAttribute("href", c), s.setAttribute("download", e), document.body.appendChild(s), s.click(), document.body.removeChild(s);
  }
}
const D = (e, t) => t.some((n) => e instanceof n);
let P, j;
function nt() {
  return P || (P = [
    IDBIndex,
    IDBObjectStore,
    IDBCursor,
    IDBDatabase,
    IDBTransaction
  ]);
}
function it() {
  return j || (j = ["advance", "continue", "continuePrimaryKey"].map((e) => IDBCursor.prototype[e]));
}
const I = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new WeakMap();
function ot(e) {
  const t = new Promise((n, i) => {
    const o = () => {
      e.removeEventListener("success", r), e.removeEventListener("error", s);
    }, r = () => {
      n(b(e.result)), o();
    }, s = () => {
      i(e.error), o();
    };
    e.addEventListener("success", r), e.addEventListener("error", s);
  });
  return v.set(t, e), t;
}
function rt(e) {
  if (I.has(e))
    return;
  const t = new Promise((n, i) => {
    const o = () => {
      e.removeEventListener("complete", r), e.removeEventListener("error", s), e.removeEventListener("abort", s);
    }, r = () => {
      n(), o();
    }, s = () => {
      i(e.error || new DOMException("AbortError", "AbortError")), o();
    };
    e.addEventListener("complete", r), e.addEventListener("error", s), e.addEventListener("abort", s);
  });
  I.set(e, t);
}
let L = {
  get(e, t, n) {
    if (e instanceof IDBTransaction) {
      if (t === "done")
        return I.get(e);
      if (t === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return b(e[t]);
  },
  set(e, t, n) {
    return e[t] = n, !0;
  },
  has(e, t) {
    return e instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in e;
  }
};
function U(e) {
  L = e(L);
}
function st(e) {
  return it().includes(e) ? function(...t) {
    return e.apply(T(this), t), b(this.request);
  } : function(...t) {
    return b(e.apply(T(this), t));
  };
}
function at(e) {
  return typeof e == "function" ? st(e) : (e instanceof IDBTransaction && rt(e), D(e, nt()) ? new Proxy(e, L) : e);
}
function b(e) {
  if (e instanceof IDBRequest)
    return ot(e);
  if (B.has(e))
    return B.get(e);
  const t = at(e);
  return Object.is(t, e) || (B.set(e, t), v.set(t, e)), t;
}
const T = (e) => v.get(e);
function lt(e, t, { blocked: n, upgrade: i, blocking: o, terminated: r } = {}) {
  const s = indexedDB.open(e, t), c = b(s);
  return i && s.addEventListener("upgradeneeded", (a) => {
    i(b(s.result), a.oldVersion, a.newVersion, b(s.transaction), a);
  }), n && s.addEventListener("blocked", (a) => n(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    a.oldVersion,
    a.newVersion,
    a
  )), c.then((a) => {
    r && a.addEventListener("close", () => r()), o && a.addEventListener("versionchange", (d) => o(d.oldVersion, d.newVersion, d));
  }).catch(() => {
  }), c;
}
const ct = ["get", "getKey", "getAll", "getAllKeys", "count"], dt = ["put", "add", "delete", "clear"], k = {};
function F(e, t) {
  if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string"))
    return;
  if (k[t])
    return k[t];
  const n = t.replace(/FromIndex$/, ""), i = t !== n, o = dt.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (i ? IDBIndex : IDBObjectStore).prototype) || !(o || ct.includes(n))
  )
    return;
  const r = async function(s, ...c) {
    const a = this.transaction(s, o ? "readwrite" : "readonly");
    let d = a.store;
    return i && (d = d.index(c.shift())), (await Promise.all([
      d[n](...c),
      o && a.done
    ]))[0];
  };
  return k[t] = r;
}
U((e) => ({
  ...e,
  get: (t, n, i) => F(t, n) || e.get(t, n, i),
  has: (t, n) => !!F(t, n) || e.has(t, n)
}));
const pt = ["advance", "continue", "continuePrimaryKey"], V = {}, _ = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ new WeakMap(), mt = {
  get(e, t) {
    if (!pt.includes(t))
      return e[t];
    let n = V[t];
    return n || (n = V[t] = function(...i) {
      _.set(this, K.get(this)[t](...i));
    }), n;
  }
};
async function* ut(...e) {
  let t = this;
  if (t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)
    return;
  t = t;
  const n = new Proxy(t, mt);
  for (K.set(n, t), v.set(n, T(t)); t; )
    yield n, t = await (_.get(n) || t.continue()), _.delete(n);
}
function $(e, t) {
  return t === Symbol.asyncIterator && D(e, [IDBIndex, IDBObjectStore, IDBCursor]) || t === "iterate" && D(e, [IDBIndex, IDBObjectStore]);
}
U((e) => ({
  ...e,
  get(t, n, i) {
    return $(t, n) ? ut : e.get(t, n, i);
  },
  has(t, n) {
    return $(t, n) || e.has(t, n);
  }
}));
var f = function(e, t, n, i) {
  function o(r) {
    return r instanceof n ? r : new n(function(s) {
      s(r);
    });
  }
  return new (n || (n = Promise))(function(r, s) {
    function c(u) {
      try {
        d(i.next(u));
      } catch (p) {
        s(p);
      }
    }
    function a(u) {
      try {
        d(i.throw(u));
      } catch (p) {
        s(p);
      }
    }
    function d(u) {
      u.done ? r(u.value) : o(u.value).then(c, a);
    }
    d((i = i.apply(e, t || [])).next());
  });
}, ht = function(e, t) {
  var n = {};
  for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && t.indexOf(i) < 0 && (n[i] = e[i]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, i = Object.getOwnPropertySymbols(e); o < i.length; o++)
      t.indexOf(i[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[o]) && (n[i[o]] = e[i[o]]);
  return n;
};
class ft {
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
      this.db = yield lt(this.storageKey, 6, {
        upgrade(t, n, i, o) {
          let r;
          if (n < 5)
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
  _dbGetElem(t, n) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        return n || (n = this.db.transaction("data", "readonly")), yield n.store.index("_pk").get(t);
      throw new Error("DB doesnt exist");
    });
  }
  getElem(t) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbGetElem(t);
        } catch (n) {
          console.error(n);
        }
      else
        this.data.get(t);
    });
  }
  _dbSetElem(t, n, i = !1, o, r) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let s = !1;
        r || (r = this.db.transaction("data", "readwrite"));
        const c = r.store, a = yield c.index("_pk").get(t);
        if (a)
          i && (yield c.put(Object.assign(Object.assign({}, a), n)), s = !0);
        else {
          const d = Object.assign({ _pk: t, _createdAt: /* @__PURE__ */ new Date() }, n);
          o && (d._groupId = o), yield c.put(d), s = !0;
        }
        return s;
      } else
        throw new Error("DB doesnt exist");
    });
  }
  addElem(t, n, i = !1, o) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbSetElem(t, n, i, o);
        } catch (r) {
          console.error(r);
        }
      else
        this.data.set(t, n);
      return !0;
    });
  }
  addElems(t, n = !1, i) {
    return f(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const o = [], r = this.db.transaction("data", "readwrite"), s = [];
        if (t.forEach(([c, a]) => {
          s.indexOf(c) === -1 && (s.push(c), o.push(this._dbSetElem(c, a, n, i, r)));
        }), o.length > 0) {
          o.push(r.done);
          const c = yield Promise.all(o);
          let a = 0;
          return c.forEach((d) => {
            typeof d == "boolean" && d && (a += 1);
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
        let n = 0, o = yield this.db.transaction("data", "readwrite").store.index("_groupId").openCursor(IDBKeyRange.only(t));
        for (; o; )
          o.delete(), o = yield o.continue(), n += 1;
        return n;
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
        const t = /* @__PURE__ */ new Map(), n = yield this.db.getAll("data");
        return n && n.forEach((i) => {
          const { _id: o } = i, r = ht(i, ["_id"]);
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
var H;
(function(e) {
  e.ADD = "add", e.LOG = "log";
})(H || (H = {}));
class gt extends ft {
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
  itemToRow(n) {
    return [
      n.profileId,
      n.fullName,
      n.profileLink,
      n.bio,
      n.imageSrc,
      n.groupId,
      n.groupJoiningText,
      n.profileType
    ];
  }
}
const g = new gt();
let bt = null;
function Y(e = 5e3) {
  return bt ?? (bt = (async () => {
    const t = Date.now();
    for (; g.persistent && !g.db && Date.now() - t < e; )
      await new Promise((n) => setTimeout(n, 50));
  })());
}
const xt = `
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
function yt() {
  if (document.getElementById("fbs-styles")) return;
  const e = document.createElement("style");
  e.id = "fbs-styles", e.textContent = xt, document.head.appendChild(e);
}
const x = {
  grip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>',
  minimize: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>',
  expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
}, wt = {
  en: {
    locale: "en-US",
    membersLabel: "members captured",
    groups: (e) => `from ${e} group${e !== 1 ? "s" : ""}`,
    hintStart: "Go to a group's Members tab to start",
    hintCapturing: "Capturing members... keep scrolling!",
    hintIdle: "Scroll for more, or download when ready",
    download: "Download CSV",
    autoScroll: "Auto Scroll",
    stopScroll: "Stop Scroll",
    reset: "Reset",
    confirmReset: "Confirm?",
    minimize: "Minimize",
    expand: "Expand",
    activity: "Activity",
    ready: "Ready",
    loadedFromCache: (e) => `Loaded ${e} from cache`,
    added: (e) => `+${e} members`,
    scrollStarted: "Auto-scroll started",
    scrollStopped: "Auto-scroll stopped",
    autoStopped: (e) => `No new members for ${e}s, auto-scroll stopped`,
    hintDone: "Looks like the end of the list. Download your CSV.",
    noData: "No data to download",
    downloaded: (e) => `Downloaded ${e} members`,
    downloadFailed: "Download failed",
    cleared: "All data cleared"
  },
  vi: {
    locale: "vi-VN",
    membersLabel: "thành viên đã lấy",
    groups: (e) => `từ ${e} nhóm`,
    hintStart: "Mở tab Mọi người của nhóm để bắt đầu",
    hintCapturing: "Đang lấy thành viên... cứ cuộn tiếp!",
    hintIdle: "Cuộn thêm để lấy tiếp, hoặc tải CSV khi đủ",
    download: "Tải CSV",
    autoScroll: "Tự động cuộn",
    stopScroll: "Dừng cuộn",
    reset: "Xóa dữ liệu",
    confirmReset: "Xác nhận xóa?",
    minimize: "Thu nhỏ",
    expand: "Mở rộng",
    activity: "Hoạt động",
    ready: "Sẵn sàng",
    loadedFromCache: (e) => `Đã nạp ${e} người từ bộ nhớ`,
    added: (e) => `+${e} thành viên`,
    scrollStarted: "Bắt đầu tự động cuộn",
    scrollStopped: "Đã dừng tự động cuộn",
    autoStopped: (e) => `${e} giây không có thành viên mới, đã tự dừng cuộn`,
    hintDone: "Có vẻ đã hết danh sách. Bấm Tải CSV để lưu.",
    noData: "Chưa có dữ liệu để tải",
    downloaded: (e) => `Đã tải xuống ${e} thành viên`,
    downloadFailed: "Tải xuống thất bại",
    cleared: "Đã xóa toàn bộ dữ liệu"
  }
}, vt = (document.documentElement.lang || navigator.language || "").toLowerCase().startsWith("vi") ? "vi" : "en", l = wt[vt], w = (e) => e.toLocaleString(l.locale), W = 15e3;
class Et {
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
    m(this, "lastNewMemberAt", 0);
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
    var h;
    (h = document.getElementById("fbs-panel")) == null || h.remove(), this.panel = document.createElement("div"), this.panel.id = "fbs-panel", this.panel.className = "fbs-panel";
    const t = document.createElement("div");
    t.className = "fbs-header";
    const n = document.createElement("span");
    n.className = "fbs-drag-icon", n.innerHTML = x.grip;
    const i = document.createElement("span");
    i.className = "fbs-title", i.textContent = "FB Scraper", this.statusDot = document.createElement("span"), this.statusDot.className = "fbs-status-dot", this.headerBadge = document.createElement("span"), this.headerBadge.className = "fbs-header-badge", this.headerBadge.textContent = "0";
    const o = document.createElement("div");
    o.className = "fbs-header-right", this.minimizeBtn = document.createElement("button"), this.minimizeBtn.className = "fbs-icon-btn", this.minimizeBtn.innerHTML = x.minimize, this.minimizeBtn.title = l.minimize, this.minimizeBtn.setAttribute("aria-label", l.minimize), this.minimizeBtn.addEventListener("click", (y) => {
      y.stopPropagation(), this.toggleMinimize();
    }), o.appendChild(this.minimizeBtn), t.append(n, i, this.statusDot, this.headerBadge, o), this.body = document.createElement("div"), this.body.className = "fbs-body";
    const r = document.createElement("div");
    r.className = "fbs-stats", this.counterEl = document.createElement("span"), this.counterEl.className = "fbs-counter", this.counterEl.textContent = "0";
    const s = document.createElement("div");
    s.className = "fbs-counter-label", s.textContent = l.membersLabel, this.groupCountEl = document.createElement("span"), this.groupCountEl.className = "fbs-group-count", this.groupCountEl.textContent = l.groups(0), r.append(this.counterEl, s, this.groupCountEl), this.statusEl = document.createElement("div"), this.statusEl.className = "fbs-status", this.statusEl.textContent = l.hintStart;
    const c = document.createElement("div");
    c.className = "fbs-actions";
    const a = document.createElement("button");
    a.className = "fbs-btn fbs-btn-primary", a.innerHTML = x.download, a.append(` ${l.download}`), a.addEventListener("click", () => this.download());
    const d = document.createElement("div");
    d.className = "fbs-btn-row", this.scrollBtn = document.createElement("button"), this.scrollBtn.className = "fbs-btn fbs-btn-secondary", this.scrollBtn.textContent = l.autoScroll, this.scrollBtn.addEventListener("click", () => this.toggleAutoScroll()), this.resetBtn = document.createElement("button"), this.resetBtn.className = "fbs-btn fbs-btn-outline", this.resetBtn.textContent = l.reset, this.resetBtn.addEventListener("click", () => this.handleReset()), d.append(this.scrollBtn, this.resetBtn), c.append(a, d);
    const u = document.createElement("div");
    u.className = "fbs-log";
    const p = document.createElement("div");
    p.className = "fbs-log-title", p.textContent = l.activity, this.logEntries = document.createElement("div"), this.logEntries.className = "fbs-log-entries", u.append(p, this.logEntries), this.body.append(r, this.statusEl, c, u), this.panel.append(t, this.body);
  }
  // ── Drag ──
  setupDrag() {
    this.panel.querySelector(".fbs-header").addEventListener("mousedown", (n) => {
      if (n.target.closest(".fbs-icon-btn")) return;
      this.isDragging = !0;
      const i = this.panel.getBoundingClientRect();
      this.dragOffX = n.clientX - i.left, this.dragOffY = n.clientY - i.top, this.panel.style.transition = "none", n.preventDefault();
    }), window.addEventListener("mousemove", (n) => {
      if (!this.isDragging) return;
      const i = Math.max(0, Math.min(n.clientX - this.dragOffX, window.innerWidth - 100)), o = Math.max(0, Math.min(n.clientY - this.dragOffY, window.innerHeight - 50));
      this.panel.style.right = "auto", this.panel.style.bottom = "auto", this.panel.style.left = i + "px", this.panel.style.top = o + "px";
    }), window.addEventListener("mouseup", () => {
      this.isDragging && (this.isDragging = !1, this.panel.style.transition = "");
    });
  }
  // ── Public ──
  render() {
    document.body.appendChild(this.panel), Y().then(() => this.refreshCounter()).then((t) => {
      t > 0 ? this.addLog(l.loadedFromCache(w(t))) : this.addLog(l.ready);
    });
  }
  async onCapture(t, n) {
    this.lastNewMemberAt = Date.now(), n && this.groups.add(n), this.groupCountEl.textContent = l.groups(this.groups.size), await this.refreshCounter(), this.addLog(l.added(w(t))), this.statusDot.classList.add("fbs-dot-active"), this.statusEl.textContent = l.hintCapturing, this.panel.classList.remove("fbs-pulse"), this.panel.offsetWidth, this.panel.classList.add("fbs-pulse"), this.pulseTimer && clearTimeout(this.pulseTimer), this.pulseTimer = setTimeout(() => {
      this.panel.classList.remove("fbs-pulse"), this.statusDot.classList.remove("fbs-dot-active"), this.statusEl.textContent = l.hintIdle;
    }, 2500);
  }
  // ── Private ──
  async refreshCounter() {
    const t = await g.getCount(), n = w(t);
    return this.counterEl.textContent = n, this.headerBadge.textContent = n, t;
  }
  addLog(t) {
    var r;
    const n = document.createElement("div");
    n.className = "fbs-log-entry";
    const i = (/* @__PURE__ */ new Date()).toLocaleTimeString(l.locale, {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }), o = document.createElement("span");
    for (o.className = "fbs-log-time", o.textContent = i, n.appendChild(o), n.appendChild(document.createTextNode(t)), this.logEntries.prepend(n); this.logEntries.children.length > 50; )
      (r = this.logEntries.lastChild) == null || r.remove();
  }
  toggleMinimize() {
    this.isMinimized = !this.isMinimized, this.body.style.display = this.isMinimized ? "none" : "", this.minimizeBtn.innerHTML = this.isMinimized ? x.expand : x.minimize;
    const t = this.isMinimized ? l.expand : l.minimize;
    this.minimizeBtn.title = t, this.minimizeBtn.setAttribute("aria-label", t);
  }
  toggleAutoScroll() {
    if (this.isScrolling) {
      this.stopAutoScroll(!1);
      return;
    }
    this.isScrolling = !0, this.lastNewMemberAt = Date.now(), this.scrollBtn.textContent = l.stopScroll, this.scrollBtn.classList.add("fbs-btn-active"), this.scrollTimer = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight), Date.now() - this.lastNewMemberAt > W && this.stopAutoScroll(!0);
    }, 150), this.addLog(l.scrollStarted);
  }
  stopAutoScroll(t) {
    this.isScrolling = !1, this.scrollBtn.textContent = l.autoScroll, this.scrollBtn.classList.remove("fbs-btn-active"), this.scrollTimer && (clearInterval(this.scrollTimer), this.scrollTimer = null), t ? (this.addLog(l.autoStopped(W / 1e3)), this.statusEl.textContent = l.hintDone) : this.addLog(l.scrollStopped);
  }
  async download() {
    const t = await g.getCount();
    if (t === 0) {
      this.addLog(l.noData);
      return;
    }
    const n = await g.toCsvData(), i = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    try {
      et(`fb-members-${i}.csv`, n), this.addLog(l.downloaded(w(t)));
    } catch (o) {
      this.addLog(l.downloadFailed), console.error(o);
    }
  }
  handleReset() {
    this.confirmingReset ? (this.confirmTimer && clearTimeout(this.confirmTimer), this.cancelReset(), g.clear().then(() => {
      this.groups.clear(), this.groupCountEl.textContent = l.groups(0), this.refreshCounter(), this.addLog(l.cleared), this.statusEl.textContent = l.hintStart;
    })) : (this.confirmingReset = !0, this.resetBtn.textContent = l.confirmReset, this.resetBtn.classList.add("fbs-confirm"), this.confirmTimer = setTimeout(() => {
      this.cancelReset();
    }, 3e3));
  }
  cancelReset() {
    this.confirmingReset = !1, this.resetBtn.textContent = l.reset, this.resetBtn.classList.remove("fbs-confirm");
  }
}
let M;
function St(e) {
  var r, s, c, a, d, u;
  let t;
  if ((r = e == null ? void 0 : e.data) != null && r.group)
    t = e.data.group;
  else if (((c = (s = e == null ? void 0 : e.data) == null ? void 0 : s.node) == null ? void 0 : c.__typename) === "Group")
    t = e.data.node;
  else
    return;
  let n;
  if ((a = t == null ? void 0 : t.new_members) != null && a.edges)
    n = t.new_members.edges;
  else if ((d = t == null ? void 0 : t.new_forum_members) != null && d.edges)
    n = t.new_forum_members.edges;
  else if ((u = t == null ? void 0 : t.search_results) != null && u.edges)
    n = t.search_results.edges;
  else
    return;
  const i = [];
  let o;
  n.forEach((p) => {
    var z, A, O, N, R;
    const h = p.node.__isEntity === "GroupUserInvite" ? p.node.invitee_profile : p.node;
    if (!h) return;
    const { id: y, name: J, bio_text: E, url: q, profile_picture: S, __isProfile: Z } = h, G = ((z = p == null ? void 0 : p.join_status_text) == null ? void 0 : z.text) || ((O = (A = p == null ? void 0 : p.membership) == null ? void 0 : A.join_status_text) == null ? void 0 : O.text), C = (R = (N = h.group_membership) == null ? void 0 : N.associated_group) == null ? void 0 : R.id;
    C && (o = C), i.push([y, {
      profileId: y,
      fullName: J,
      profileLink: q,
      bio: (E == null ? void 0 : E.text) || "",
      imageSrc: (S == null ? void 0 : S.uri) || "",
      groupId: C || "",
      groupJoiningText: G || "",
      profileType: Z || ""
    }]);
  }), i.length > 0 && Y().then(() => g.addElems(i)).then((p) => {
    typeof p == "number" && p > 0 && M.onCapture(p, o);
  });
}
function X(e) {
  const t = [];
  try {
    t.push(JSON.parse(e));
  } catch {
    const n = e.split(`
`);
    if (n.length <= 1) return;
    for (const i of n)
      try {
        t.push(JSON.parse(i));
      } catch {
      }
  }
  for (const n of t)
    St(n);
}
function Ct() {
  yt(), M = new Et(), M.render();
  const e = "/api/graphql/", t = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener("readystatechange", function() {
      this.responseURL.includes(e) && this.readyState === 4 && X(this.responseText);
    }, !1), t.apply(this, arguments);
  };
  const n = window.fetch;
  window.fetch = async function(...i) {
    const o = await n.apply(this, i);
    return (typeof i[0] == "string" ? i[0] : i[0] instanceof Request ? i[0].url : "").includes(e) && o.clone().text().then((c) => X(c)).catch(() => {
    }), o;
  };
}
Ct();
