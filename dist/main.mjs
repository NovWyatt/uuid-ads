var en = Object.defineProperty;
var tn = (e, t, r) => t in e ? en(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var F = (e, t, r) => tn(e, typeof t != "symbol" ? t + "" : t, r);
const Qe = (e, t) => t.some((r) => e instanceof r);
let xt, wt;
function rn() {
  return xt || (xt = [
    IDBIndex,
    IDBObjectStore,
    IDBCursor,
    IDBDatabase,
    IDBTransaction
  ]);
}
function nn() {
  return wt || (wt = ["advance", "continue", "continuePrimaryKey"].map((e) => IDBCursor.prototype[e]));
}
const et = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap();
function on(e) {
  const t = new Promise((r, n) => {
    const o = () => {
      e.removeEventListener("success", a), e.removeEventListener("error", s);
    }, a = () => {
      r(ie(e.result)), o();
    }, s = () => {
      n(e.error), o();
    };
    e.addEventListener("success", a), e.addEventListener("error", s);
  });
  return He.set(t, e), t;
}
function an(e) {
  if (et.has(e))
    return;
  const t = new Promise((r, n) => {
    const o = () => {
      e.removeEventListener("complete", a), e.removeEventListener("error", s), e.removeEventListener("abort", s);
    }, a = () => {
      r(), o();
    }, s = () => {
      n(e.error || new DOMException("AbortError", "AbortError")), o();
    };
    e.addEventListener("complete", a), e.addEventListener("error", s), e.addEventListener("abort", s);
  });
  et.set(e, t);
}
let tt = {
  get(e, t, r) {
    if (e instanceof IDBTransaction) {
      if (t === "done")
        return et.get(e);
      if (t === "store")
        return r.objectStoreNames[1] ? void 0 : r.objectStore(r.objectStoreNames[0]);
    }
    return ie(e[t]);
  },
  set(e, t, r) {
    return e[t] = r, !0;
  },
  has(e, t) {
    return e instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in e;
  }
};
function mr(e) {
  tt = e(tt);
}
function sn(e) {
  return nn().includes(e) ? function(...t) {
    return e.apply(rt(this), t), ie(this.request);
  } : function(...t) {
    return ie(e.apply(rt(this), t));
  };
}
function ln(e) {
  return typeof e == "function" ? sn(e) : (e instanceof IDBTransaction && an(e), Qe(e, rn()) ? new Proxy(e, tt) : e);
}
function ie(e) {
  if (e instanceof IDBRequest)
    return on(e);
  if (Ke.has(e))
    return Ke.get(e);
  const t = ln(e);
  return Object.is(t, e) || (Ke.set(e, t), He.set(t, e)), t;
}
const rt = (e) => He.get(e);
function cn(e, t, { blocked: r, upgrade: n, blocking: o, terminated: a } = {}) {
  const s = indexedDB.open(e, t), l = ie(s);
  return n && s.addEventListener("upgradeneeded", (i) => {
    n(ie(s.result), i.oldVersion, i.newVersion, ie(s.transaction), i);
  }), r && s.addEventListener("blocked", (i) => r(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    i.oldVersion,
    i.newVersion,
    i
  )), l.then((i) => {
    a && i.addEventListener("close", () => a()), o && i.addEventListener("versionchange", (c) => o(c.oldVersion, c.newVersion, c));
  }).catch(() => {
  }), l;
}
const fn = ["get", "getKey", "getAll", "getAllKeys", "count"], un = ["put", "add", "delete", "clear"], Ge = {};
function St(e, t) {
  if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string"))
    return;
  if (Ge[t])
    return Ge[t];
  const r = t.replace(/FromIndex$/, ""), n = t !== r, o = un.includes(r);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(r in (n ? IDBIndex : IDBObjectStore).prototype) || !(o || fn.includes(r))
  )
    return;
  const a = async function(s, ...l) {
    const i = this.transaction(s, o ? "readwrite" : "readonly");
    let c = i.store;
    return n && (c = c.index(l.shift())), (await Promise.all([
      c[r](...l),
      o && i.done
    ]))[0];
  };
  return Ge[t] = a;
}
mr((e) => ({
  ...e,
  get: (t, r, n) => St(t, r) || e.get(t, r, n),
  has: (t, r) => !!St(t, r) || e.has(t, r)
}));
const dn = ["advance", "continue", "continuePrimaryKey"], Ct = {}, nt = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), mn = {
  get(e, t) {
    if (!dn.includes(t))
      return e[t];
    let r = Ct[t];
    return r || (r = Ct[t] = function(...n) {
      nt.set(this, hr.get(this)[t](...n));
    }), r;
  }
};
async function* hn(...e) {
  let t = this;
  if (t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)
    return;
  t = t;
  const r = new Proxy(t, mn);
  for (hr.set(r, t), He.set(r, rt(t)); t; )
    yield r, t = await (nt.get(r) || t.continue()), nt.delete(r);
}
function At(e, t) {
  return t === Symbol.asyncIterator && Qe(e, [IDBIndex, IDBObjectStore, IDBCursor]) || t === "iterate" && Qe(e, [IDBIndex, IDBObjectStore]);
}
mr((e) => ({
  ...e,
  get(t, r, n) {
    return At(t, r) ? hn : e.get(t, r, n);
  },
  has(t, r) {
    return At(t, r) || e.has(t, r);
  }
}));
var Z = function(e, t, r, n) {
  function o(a) {
    return a instanceof r ? a : new r(function(s) {
      s(a);
    });
  }
  return new (r || (r = Promise))(function(a, s) {
    function l(f) {
      try {
        c(n.next(f));
      } catch (u) {
        s(u);
      }
    }
    function i(f) {
      try {
        c(n.throw(f));
      } catch (u) {
        s(u);
      }
    }
    function c(f) {
      f.done ? a(f.value) : o(f.value).then(l, i);
    }
    c((n = n.apply(e, t || [])).next());
  });
}, pn = function(e, t) {
  var r = {};
  for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, n = Object.getOwnPropertySymbols(e); o < n.length; o++)
      t.indexOf(n[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[o]) && (r[n[o]] = e[n[o]]);
  return r;
};
class gn {
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
    return Z(this, void 0, void 0, function* () {
      this.db = yield cn(this.storageKey, 6, {
        upgrade(t, r, n, o) {
          let a;
          if (r < 5)
            try {
              t.deleteObjectStore("data");
            } catch {
            }
          t.objectStoreNames.contains("data") ? a = o.objectStore("data") : a = t.createObjectStore("data", {
            keyPath: "_id",
            autoIncrement: !0
          }), a && !a.indexNames.contains("_createdAt") && a.createIndex("_createdAt", "_createdAt"), a && !a.indexNames.contains("_groupId") && a.createIndex("_groupId", "_groupId"), a && !a.indexNames.contains("_pk") && a.createIndex("_pk", "_pk", {
            unique: !0
          });
        }
      });
    });
  }
  _dbGetElem(t, r) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        return r || (r = this.db.transaction("data", "readonly")), yield r.store.index("_pk").get(t);
      throw new Error("DB doesnt exist");
    });
  }
  getElem(t) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbGetElem(t);
        } catch (r) {
          console.error(r);
        }
      else
        this.data.get(t);
    });
  }
  _dbSetElem(t, r, n = !1, o, a) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let s = !1;
        a || (a = this.db.transaction("data", "readwrite"));
        const l = a.store, i = yield l.index("_pk").get(t);
        if (i)
          n && (yield l.put(Object.assign(Object.assign({}, i), r)), s = !0);
        else {
          const c = Object.assign({ _pk: t, _createdAt: /* @__PURE__ */ new Date() }, r);
          o && (c._groupId = o), yield l.put(c), s = !0;
        }
        return s;
      } else
        throw new Error("DB doesnt exist");
    });
  }
  addElem(t, r, n = !1, o) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db)
        try {
          return yield this._dbSetElem(t, r, n, o);
        } catch (a) {
          console.error(a);
        }
      else
        this.data.set(t, r);
      return !0;
    });
  }
  addElems(t, r = !1, n) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const o = [], a = this.db.transaction("data", "readwrite"), s = [];
        if (t.forEach(([l, i]) => {
          s.indexOf(l) === -1 && (s.push(l), o.push(this._dbSetElem(l, i, r, n, a)));
        }), o.length > 0) {
          o.push(a.done);
          const l = yield Promise.all(o);
          let i = 0;
          return l.forEach((c) => {
            typeof c == "boolean" && c && (i += 1);
          }), i;
        }
        return 0;
      } else
        return t.forEach(([o, a]) => {
          this.addElem(o, a);
        }), t.length;
    });
  }
  deleteFromGroupId(t) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let r = 0, o = yield this.db.transaction("data", "readwrite").store.index("_groupId").openCursor(IDBKeyRange.only(t));
        for (; o; )
          o.delete(), o = yield o.continue(), r += 1;
        return r;
      } else
        throw new Error("Not Implemented Error");
    });
  }
  clear() {
    return Z(this, void 0, void 0, function* () {
      this.persistent && this.db ? yield this.db.clear("data") : this.data.clear();
    });
  }
  getCount() {
    return Z(this, void 0, void 0, function* () {
      return this.persistent && this.db ? yield this.db.count("data") : this.data.size;
    });
  }
  getAll() {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const t = /* @__PURE__ */ new Map(), r = yield this.db.getAll("data");
        return r && r.forEach((n) => {
          const { _id: o } = n, a = pn(n, ["_id"]);
          t.set(o, a);
        }), t;
      } else
        return this.data;
    });
  }
  toCsvData() {
    return Z(this, void 0, void 0, function* () {
      const t = [];
      return t.push(this.headers), (yield this.getAll()).forEach((n) => {
        try {
          t.push(this.itemToRow(n));
        } catch (o) {
          console.error(o);
        }
      }), t;
    });
  }
}
var Et;
(function(e) {
  e.ADD = "add", e.LOG = "log";
})(Et || (Et = {}));
function vn(e) {
  if (e instanceof Blob)
    return bn(e);
  throw new Error("Unsupported file content type. Expected a `Blob`");
}
function bn(e) {
  return e.arrayBuffer().then(function(t) {
    return new Uint8Array(t);
  });
}
var z = Uint8Array, V = Uint16Array, dt = Int32Array, mt = new z([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), ht = new z([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), It = new z([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), pr = function(e, t) {
  for (var r = new V(31), n = 0; n < 31; ++n)
    r[n] = t += 1 << e[n - 1];
  for (var o = new dt(r[30]), n = 1; n < 30; ++n)
    for (var a = r[n]; a < r[n + 1]; ++a)
      o[a] = a - r[n] << 5 | n;
  return { b: r, r: o };
}, gr = pr(mt, 2), yn = gr.b, ot = gr.r;
yn[28] = 258, ot[258] = 28;
var xn = pr(ht, 0), Ft = xn.r, at = new V(32768);
for (var T = 0; T < 32768; ++T) {
  var J = (T & 43690) >> 1 | (T & 21845) << 1;
  J = (J & 52428) >> 2 | (J & 13107) << 2, J = (J & 61680) >> 4 | (J & 3855) << 4, at[T] = ((J & 65280) >> 8 | (J & 255) << 8) >> 1;
}
var Ae = function(e, t, r) {
  for (var n = e.length, o = 0, a = new V(t); o < n; ++o)
    e[o] && ++a[e[o] - 1];
  var s = new V(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + a[o - 1] << 1;
  var l;
  if (r) {
    l = new V(1 << t);
    var i = 15 - t;
    for (o = 0; o < n; ++o)
      if (e[o])
        for (var c = o << 4 | e[o], f = t - e[o], u = s[e[o] - 1]++ << f, d = u | (1 << f) - 1; u <= d; ++u)
          l[at[u] >> i] = c;
  } else
    for (l = new V(n), o = 0; o < n; ++o)
      e[o] && (l[o] = at[s[e[o] - 1]++] >> 15 - e[o]);
  return l;
}, se = new z(288);
for (var T = 0; T < 144; ++T)
  se[T] = 8;
for (var T = 144; T < 256; ++T)
  se[T] = 9;
for (var T = 256; T < 280; ++T)
  se[T] = 7;
for (var T = 280; T < 288; ++T)
  se[T] = 8;
var ze = new z(32);
for (var T = 0; T < 32; ++T)
  ze[T] = 5;
var wn = /* @__PURE__ */ Ae(se, 9, 0), Sn = /* @__PURE__ */ Ae(ze, 5, 0), vr = function(e) {
  return (e + 7) / 8 | 0;
}, br = function(e, t, r) {
  return (r == null || r > e.length) && (r = e.length), new z(e.subarray(t, r));
}, Cn = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], Xe = function(e, t, r) {
  var n = new Error(t || Cn[e]);
  if (n.code = e, Error.captureStackTrace && Error.captureStackTrace(n, Xe), !r)
    throw n;
  return n;
}, K = function(e, t, r) {
  r <<= t & 7;
  var n = t / 8 | 0;
  e[n] |= r, e[n + 1] |= r >> 8;
}, we = function(e, t, r) {
  r <<= t & 7;
  var n = t / 8 | 0;
  e[n] |= r, e[n + 1] |= r >> 8, e[n + 2] |= r >> 16;
}, qe = function(e, t) {
  for (var r = [], n = 0; n < e.length; ++n)
    e[n] && r.push({ s: n, f: e[n] });
  var o = r.length, a = r.slice();
  if (!o)
    return { t: xr, l: 0 };
  if (o == 1) {
    var s = new z(r[0].s + 1);
    return s[r[0].s] = 1, { t: s, l: 1 };
  }
  r.sort(function(w, E) {
    return w.f - E.f;
  }), r.push({ s: -1, f: 25001 });
  var l = r[0], i = r[1], c = 0, f = 1, u = 2;
  for (r[0] = { s: -1, f: l.f + i.f, l, r: i }; f != o - 1; )
    l = r[r[c].f < r[u].f ? c++ : u++], i = r[c != f && r[c].f < r[u].f ? c++ : u++], r[f++] = { s: -1, f: l.f + i.f, l, r: i };
  for (var d = a[0].s, n = 1; n < o; ++n)
    a[n].s > d && (d = a[n].s);
  var h = new V(d + 1), b = it(r[f - 1], h, 0);
  if (b > t) {
    var n = 0, p = 0, m = b - t, S = 1 << m;
    for (a.sort(function(E, x) {
      return h[x.s] - h[E.s] || E.f - x.f;
    }); n < o; ++n) {
      var C = a[n].s;
      if (h[C] > t)
        p += S - (1 << b - h[C]), h[C] = t;
      else
        break;
    }
    for (p >>= m; p > 0; ) {
      var A = a[n].s;
      h[A] < t ? p -= 1 << t - h[A]++ - 1 : ++n;
    }
    for (; n >= 0 && p; --n) {
      var y = a[n].s;
      h[y] == t && (--h[y], ++p);
    }
    b = t;
  }
  return { t: new z(h), l: b };
}, it = function(e, t, r) {
  return e.s == -1 ? Math.max(it(e.l, t, r + 1), it(e.r, t, r + 1)) : t[e.s] = r;
}, Tt = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var r = new V(++t), n = 0, o = e[0], a = 1, s = function(i) {
    r[n++] = i;
  }, l = 1; l <= t; ++l)
    if (e[l] == o && l != t)
      ++a;
    else {
      if (!o && a > 2) {
        for (; a > 138; a -= 138)
          s(32754);
        a > 2 && (s(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
      } else if (a > 3) {
        for (s(o), --a; a > 6; a -= 6)
          s(8304);
        a > 2 && (s(a - 3 << 5 | 8208), a = 0);
      }
      for (; a--; )
        s(o);
      a = 1, o = e[l];
    }
  return { c: r.subarray(0, n), n: t };
}, Se = function(e, t) {
  for (var r = 0, n = 0; n < t.length; ++n)
    r += e[n] * t[n];
  return r;
}, yr = function(e, t, r) {
  var n = r.length, o = vr(t + 2);
  e[o] = n & 255, e[o + 1] = n >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var a = 0; a < n; ++a)
    e[o + a + 4] = r[a];
  return (o + 4 + n) * 8;
}, Bt = function(e, t, r, n, o, a, s, l, i, c, f) {
  K(t, f++, r), ++o[256];
  for (var u = qe(o, 15), d = u.t, h = u.l, b = qe(a, 15), p = b.t, m = b.l, S = Tt(d), C = S.c, A = S.n, y = Tt(p), w = y.c, E = y.n, x = new V(19), v = 0; v < C.length; ++v)
    ++x[C[v] & 31];
  for (var v = 0; v < w.length; ++v)
    ++x[w[v] & 31];
  for (var g = qe(x, 7), B = g.t, D = g.l, P = 19; P > 4 && !B[It[P - 1]]; --P)
    ;
  var X = c + 5 << 3, L = Se(o, se) + Se(a, ze) + s, M = Se(o, d) + Se(a, p) + s + 14 + 3 * P + Se(x, B) + 2 * x[16] + 3 * x[17] + 7 * x[18];
  if (i >= 0 && X <= L && X <= M)
    return yr(t, f, e.subarray(i, i + c));
  var $, O, R, W;
  if (K(t, f, 1 + (M < L)), f += 2, M < L) {
    $ = Ae(d, h, 0), O = d, R = Ae(p, m, 0), W = p;
    var me = Ae(B, D, 0);
    K(t, f, A - 257), K(t, f + 5, E - 1), K(t, f + 10, P - 4), f += 14;
    for (var v = 0; v < P; ++v)
      K(t, f + 3 * v, B[It[v]]);
    f += 3 * P;
    for (var _ = [C, w], te = 0; te < 2; ++te)
      for (var Y = _[te], v = 0; v < Y.length; ++v) {
        var U = Y[v] & 31;
        K(t, f, me[U]), f += B[U], U > 15 && (K(t, f, Y[v] >> 5 & 127), f += Y[v] >> 12);
      }
  } else
    $ = wn, O = se, R = Sn, W = ze;
  for (var v = 0; v < l; ++v) {
    var k = n[v];
    if (k > 255) {
      var U = k >> 18 & 31;
      we(t, f, $[U + 257]), f += O[U + 257], U > 7 && (K(t, f, k >> 23 & 31), f += mt[U]);
      var H = k & 31;
      we(t, f, R[H]), f += W[H], H > 3 && (we(t, f, k >> 5 & 8191), f += ht[H]);
    } else
      we(t, f, $[k]), f += O[k];
  }
  return we(t, f, $[256]), f + O[256];
}, An = /* @__PURE__ */ new dt([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), xr = /* @__PURE__ */ new z(0), En = function(e, t, r, n, o, a) {
  var s = a.z || e.length, l = new z(n + s + 5 * (1 + Math.ceil(s / 7e3)) + o), i = l.subarray(n, l.length - o), c = a.l, f = (a.r || 0) & 7;
  if (t) {
    f && (i[0] = a.r >> 3);
    for (var u = An[t - 1], d = u >> 13, h = u & 8191, b = (1 << r) - 1, p = a.p || new V(32768), m = a.h || new V(b + 1), S = Math.ceil(r / 3), C = 2 * S, A = function(ne) {
      return (e[ne] ^ e[ne + 1] << S ^ e[ne + 2] << C) & b;
    }, y = new dt(25e3), w = new V(288), E = new V(32), x = 0, v = 0, g = a.i || 0, B = 0, D = a.w || 0, P = 0; g + 2 < s; ++g) {
      var X = A(g), L = g & 32767, M = m[X];
      if (p[L] = M, m[X] = L, D <= g) {
        var $ = s - g;
        if ((x > 7e3 || B > 24576) && ($ > 423 || !c)) {
          f = Bt(e, i, 0, y, w, E, v, B, P, g - P, f), B = x = v = 0, P = g;
          for (var O = 0; O < 286; ++O)
            w[O] = 0;
          for (var O = 0; O < 30; ++O)
            E[O] = 0;
        }
        var R = 2, W = 0, me = h, _ = L - M & 32767;
        if ($ > 2 && X == A(g - _))
          for (var te = Math.min(d, $) - 1, Y = Math.min(32767, g), U = Math.min(258, $); _ <= Y && --me && L != M; ) {
            if (e[g + R] == e[g + R - _]) {
              for (var k = 0; k < U && e[g + k] == e[g + k - _]; ++k)
                ;
              if (k > R) {
                if (R = k, W = _, k > te)
                  break;
                for (var H = Math.min(_, k - 2), he = 0, O = 0; O < H; ++O) {
                  var re = g - _ + O & 32767, We = p[re], pe = re - We & 32767;
                  pe > he && (he = pe, M = re);
                }
              }
            }
            L = M, M = p[L], _ += L - M & 32767;
          }
        if (W) {
          y[B++] = 268435456 | ot[R] << 18 | Ft[W];
          var ge = ot[R] & 31, ve = Ft[W] & 31;
          v += mt[ge] + ht[ve], ++w[257 + ge], ++E[ve], D = g + R, ++x;
        } else
          y[B++] = e[g], ++w[e[g]];
      }
    }
    for (g = Math.max(g, D); g < s; ++g)
      y[B++] = e[g], ++w[e[g]];
    f = Bt(e, i, c, y, w, E, v, B, P, g - P, f), c || (a.r = f & 7 | i[f / 8 | 0] << 3, f -= 7, a.h = m, a.p = p, a.i = g, a.w = D);
  } else {
    for (var g = a.w || 0; g < s + c; g += 65535) {
      var le = g + 65535;
      le >= s && (i[f / 8 | 0] = c, le = s), f = yr(i, f + 1, e.subarray(g, le));
    }
    a.i = s;
  }
  return br(l, 0, n + vr(f) + o);
}, In = /* @__PURE__ */ function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var r = t, n = 9; --n; )
      r = (r & 1 && -306674912) ^ r >>> 1;
    e[t] = r;
  }
  return e;
}(), Fn = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var r = e, n = 0; n < t.length; ++n)
        r = In[r & 255 ^ t[n]] ^ r >>> 8;
      e = r;
    },
    d: function() {
      return ~e;
    }
  };
}, Tn = function(e, t, r, n, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var a = t.dictionary.subarray(-32768), s = new z(a.length + e.length);
    s.set(a), s.set(e, a.length), e = s, o.w = a.length;
  }
  return En(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, r, n, o);
}, wr = function(e, t) {
  var r = {};
  for (var n in e)
    r[n] = e[n];
  for (var n in t)
    r[n] = t[n];
  return r;
}, j = function(e, t, r) {
  for (; r; ++t)
    e[t] = r, r >>>= 8;
};
function Bn(e, t) {
  return Tn(e, t || {}, 0, 0);
}
var Sr = function(e, t, r, n) {
  for (var o in e) {
    var a = e[o], s = t + o, l = n;
    Array.isArray(a) && (l = wr(n, a[1]), a = a[0]), ArrayBuffer.isView(a) ? r[s] = [a, l] : (r[s += "/"] = [new z(0), l], Sr(a, s, r, n));
  }
}, Ot = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), On = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Dn = 0;
try {
  On.decode(xr, { stream: !0 }), Dn = 1;
} catch {
}
function st(e, t) {
  var r;
  if (Ot)
    return Ot.encode(e);
  for (var n = e.length, o = new z(e.length + (e.length >> 1)), a = 0, s = function(c) {
    o[a++] = c;
  }, r = 0; r < n; ++r) {
    if (a + 5 > o.length) {
      var l = new z(a + 8 + (n - r << 1));
      l.set(o), o = l;
    }
    var i = e.charCodeAt(r);
    i < 128 || t ? s(i) : i < 2048 ? (s(192 | i >> 6), s(128 | i & 63)) : i > 55295 && i < 57344 ? (i = 65536 + (i & 1047552) | e.charCodeAt(++r) & 1023, s(240 | i >> 18), s(128 | i >> 12 & 63), s(128 | i >> 6 & 63), s(128 | i & 63)) : (s(224 | i >> 12), s(128 | i >> 6 & 63), s(128 | i & 63));
  }
  return br(o, 0, a);
}
var lt = function(e) {
  var t = 0;
  if (e)
    for (var r in e) {
      var n = e[r].length;
      n > 65535 && Xe(9), t += n + 4;
    }
  return t;
}, Dt = function(e, t, r, n, o, a, s, l) {
  var i = n.length, c = r.extra, f = l && l.length, u = lt(c);
  j(e, t, s != null ? 33639248 : 67324752), t += 4, s != null && (e[t++] = 20, e[t++] = r.os), e[t] = 20, t += 2, e[t++] = r.flag << 1 | (a < 0 && 8), e[t++] = o && 8, e[t++] = r.compression & 255, e[t++] = r.compression >> 8;
  var d = new Date(r.mtime == null ? Date.now() : r.mtime), h = d.getFullYear() - 1980;
  if ((h < 0 || h > 119) && Xe(10), j(e, t, h << 25 | d.getMonth() + 1 << 21 | d.getDate() << 16 | d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1), t += 4, a != -1 && (j(e, t, r.crc), j(e, t + 4, a < 0 ? -a - 2 : a), j(e, t + 8, r.size)), j(e, t + 12, i), j(e, t + 14, u), t += 16, s != null && (j(e, t, f), j(e, t + 6, r.attrs), j(e, t + 10, s), t += 14), e.set(n, t), t += i, u)
    for (var b in c) {
      var p = c[b], m = p.length;
      j(e, t, +b), j(e, t + 2, m), e.set(p, t + 4), t += 4 + m;
    }
  return f && (e.set(l, t), t += f), t;
}, kn = function(e, t, r, n, o) {
  j(e, t, 101010256), j(e, t + 8, r), j(e, t + 10, r), j(e, t + 12, n), j(e, t + 16, o);
};
function Pn(e, t) {
  t || (t = {});
  var r = {}, n = [];
  Sr(e, "", r, t);
  var o = 0, a = 0;
  for (var s in r) {
    var l = r[s], i = l[0], c = l[1], f = c.level == 0 ? 0 : 8, u = st(s), d = u.length, h = c.comment, b = h && st(h), p = b && b.length, m = lt(c.extra);
    d > 65535 && Xe(11);
    var S = f ? Bn(i, c) : i, C = S.length, A = Fn();
    A.p(i), n.push(wr(c, {
      size: i.length,
      crc: A.d(),
      c: S,
      f: u,
      m: b,
      u: d != s.length || b && h.length != p,
      o,
      compression: f
    })), o += 30 + d + m + C, a += 76 + 2 * (d + m) + (p || 0) + C;
  }
  for (var y = new z(a + 22), w = o, E = a - o, x = 0; x < n.length; ++x) {
    var u = n[x];
    Dt(y, u.o, u, u.f, u.u, u.c.length);
    var v = 30 + u.f.length + lt(u.extra);
    y.set(u.c, u.o + v), Dt(y, o, u, u.f, u.u, u.c.length, u.o, u.m), o += 16 + v + (u.m ? u.m.length : 0);
  }
  return kn(y, o, n.length, E, w), y;
}
function jn(e) {
  return Promise.resolve(Pn(e).buffer);
}
function Ln(e, t) {
  var r = {};
  return Promise.all(Object.keys(e).map(function(n) {
    if (e[n] instanceof Uint8Array)
      r[n] = e[n];
    else if (typeof e[n] == "string")
      r[n] = Mn(e[n]);
    else
      return t(e[n]).then(function(o) {
        r[n] = o;
      });
  })).then(function() {
    return r;
  });
}
function Mn(e) {
  return st(e);
}
function Rn(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = $n(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $n(e, t) {
  if (e) {
    if (typeof e == "string") return kt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? kt(e, t) : void 0;
  }
}
function kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function G(e, t, r, n) {
  for (var o = "", a = Rn(t), s; !(s = a()).done; ) {
    var l = s.value, i = l.files && l.files.transform && l.files.transform[e];
    if (i && i.insert) {
      var c = i.insert(r, n);
      c && (o += c);
    }
  }
  return o;
}
function zn(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Nn(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nn(e, t) {
  if (e) {
    if (typeof e == "string") return Pt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Pt(e, t) : void 0;
  }
}
function Pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function q(e, t, r, n, o) {
  for (var a = zn(r), s; !(s = a()).done; ) {
    var l = s.value, i = l.files && l.files.transform && l.files.transform[t];
    i && i.transform && (e = i.transform(e, n, o));
  }
  return e;
}
function Cr(e, t) {
  var r = t.isAttributeValue;
  return e = Ce(e, "&", "&amp;"), e = Ce(e, ">", "&gt;"), e = Ce(e, "<", "&lt;"), r && (e = Ce(e, "'", "&apos;"), e = Ce(e, '"', "&quot;")), e;
}
function Ce(e, t, r) {
  return e.replaceAll ? e.replaceAll(t, r) : e.replace(new RegExp(t, "g"), r);
}
var Vn = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, _n = new RegExp("([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|(?:\\uD83F[\\uDFFE\\uDFFF])|(?:\\uD87F[\\uDFFE\\uDFFF])|(?:\\uD8BF[\\uDFFE\\uDFFF])|(?:\\uD8FF[\\uDFFE\\uDFFF])|(?:\\uD93F[\\uDFFE\\uDFFF])|(?:\\uD97F[\\uDFFE\\uDFFF])|(?:\\uD9BF[\\uDFFE\\uDFFF])|(?:\\uD9FF[\\uDFFE\\uDFFF])|(?:\\uDA3F[\\uDFFE\\uDFFF])|(?:\\uDA7F[\\uDFFE\\uDFFF])|(?:\\uDABF[\\uDFFE\\uDFFF])|(?:\\uDAFF[\\uDFFE\\uDFFF])|(?:\\uDB3F[\\uDFFE\\uDFFF])|(?:\\uDB7F[\\uDFFE\\uDFFF])|(?:\\uDBBF[\\uDFFE\\uDFFF])|(?:\\uDBFF[\\uDFFE\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))", "g");
function pt(e) {
  return e = e.replace(Vn, ""), e = e.replace(_n, ""), e;
}
function N(e) {
  if (typeof e != "string")
    throw new TypeError("Argument must be a string");
  return e = pt(e), Cr(e, {
    isAttributeValue: !0
  });
}
function Un(e) {
  if (typeof e != "string")
    throw new TypeError("Argument must be a string");
  return e = pt(e), e.replace(/[^a-zA-Z_0-9-.:]/g, "").replace(/^[^a-zA-Z_]+/, "");
}
function Hn(e) {
  return Object.keys(e).map(function(t) {
    return "".concat(Un(t), '="').concat(N(String(e[t])), '"');
  }).reduce(function(t, r) {
    return t + " " + r;
  }, "");
}
function Ne(e, t) {
  return "<" + e + (t ? Hn(t) : "") + ">";
}
function ct(e) {
  return "</" + e + ">";
}
function Ve(e, t) {
  return Ne(e, t).slice(0, -1) + "/>";
}
function Xn(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Zn(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zn(e, t) {
  if (e) {
    if (typeof e == "string") return jt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? jt(e, t) : void 0;
  }
}
function jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Ar(e, t, r, n, o, a, s, l) {
  for (var i = Xn(l), c; !(c = i()).done; ) {
    var f = c.value, u = f.files && f.files.transform && f.files.transform[e];
    u && u.transformElementAttributes && (r = u.transformElementAttributes(t, r || Wn, o, s, a));
  }
  return n ? Ne(t, r) + n + ct(t) : Ve(t, r);
}
var Wn = {};
function Kn(e) {
  var t = e.sheetIdsAndNames, r = e.features, n = e.sheetsOptions, o = function(l, i, c, f) {
    return Ar("xl/workbook.xml", l, i, c, f, Gn, n, r);
  }, a = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' + // The order of elements is dictated by the XLSX spec.
  //
  // <workbookPr/>
  o("workbookPr") + // <bookViews/>
  o("bookViews", null, o("workbookView", null, null, 0)) + // <sheets/>
  o("sheets", null, t.map(function(s, l) {
    var i = s.sheetId, c = s.sheetName;
    return o("sheet", {
      "r:id": "rId".concat(i),
      sheetId: i,
      name: c
    }, null, l);
  }).join("")) + // <definedNames/>
  o("definedNames") + // <calcPr/>
  o("calcPr") + // Apply any plugins that insert additional content to this XML.
  G("xl/workbook.xml", r, n) + "</workbook>";
  return a = q(a, "xl/workbook.xml", r, n), a;
}
var Gn = {};
function qn(e) {
  var t = e.sheetIds, r = e.features, n = e.sheetsOptions, o = '<?xml version="1.0" ?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + t.map(function(a) {
    return '<Relationship Id="rId'.concat(a, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet').concat(a, '.xml"/>');
  }).join("") + '<Relationship Id="rId'.concat(t.length + 1, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>') + '<Relationship Id="rId'.concat(t.length + 2, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>') + // Apply any plugins that insert additional content to this XML.
  G("xl/_rels/workbook.xml.rels", r, n) + "</Relationships>";
  return o = q(o, "xl/_rels/workbook.xml.rels", r, n), o;
}
function Yn(e) {
  var t = e.features, r = e.sheetsOptions, n = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId-workbook-1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' + // Apply any plugins that insert additional content to this XML.
  G("_rels/.rels", t, r) + "</Relationships>";
  return n = q(n, "_rels/.rels", t, r), n;
}
function Jn(e) {
  var t = e.sheetIds, r = e.features, n = e.sheetsOptions, o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default ContentType="application/xml" Extension="xml"/><Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/>' + t.map(function(a) {
    return '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet'.concat(a, '.xml"/>');
  }).join("") + t.map(function(a) {
    return Er(a);
  }).join("") + // Apply any plugins that insert additional content to this XML.
  G("[Content_Types].xml", r, n) + "</Types>";
  return o = q(o, "[Content_Types].xml", r, n), o;
}
function Er(e) {
  return '<Override ContentType="application/vnd.openxmlformats-officedocument.drawing+xml" PartName="/xl/drawings/drawing'.concat(e, '.xml"/>');
}
function Qn(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, a = Ir + // Apply any plugins that insert additional content to this XML.
  G("xl/drawings/drawing{id}.xml", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + Fr;
  return a = q(a, "xl/drawings/drawing{id}.xml", o, n, {
    sheetIndex: t,
    sheetId: r
  }), a;
}
var Ir = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">', Fr = "</xdr:wsDr>";
function eo(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, a = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + // Apply any plugins that insert additional content to this XML.
  G("xl/drawings/_rels/drawing{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + "</Relationships>";
  return a = q(a, "xl/drawings/_rels/drawing{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }), a;
}
function to(e, t, r) {
  if (!ro(t))
    return "";
  var n = t.showGridLines, o = t.rightToLeft, a = t.zoomScale, s = {
    tabSelected: r === 0 ? 1 : 0,
    // The first sheet is selected by default.
    workbookViewId: 0
  };
  n === !1 && (s.showGridLines = !1), o && (s.rightToLeft = 1), typeof a == "number" && (s.zoomScale = Math.round(a * 100));
  var l = e("sheetView", s, null, 0);
  return e("sheetViews", null, l);
}
function ro(e) {
  var t = e.showGridLines, r = e.rightToLeft, n = e.zoomScale;
  return t === !1 || r || typeof n == "number";
}
function no(e, t, r) {
  if (!t)
    return "";
  var n = t.width;
  if (!n)
    return "";
  var o = r + 1, a = {
    min: o,
    max: o,
    width: n,
    customWidth: 1
  };
  return e("col", a, null, r);
}
function oo(e, t) {
  if (t) {
    var r = t.map(function(n, o) {
      return no(e, n, o);
    }).join("");
    if (r)
      return e("cols", null, r);
  }
  return "";
}
function Ee(e) {
  if (typeof e != "string")
    throw new TypeError("Argument must be a string");
  return e = pt(e), Cr(e, {
    isAttributeValue: !1
  });
}
function ue(e, t) {
  return "".concat(Tr(t)).concat(e + 1);
}
var Lt = 26;
function Tr(e) {
  if (typeof e != "number")
    return "";
  var t = Math.floor(e / Lt), r = String.fromCharCode(97 + e % Lt).toUpperCase();
  return t === 0 ? r : Tr(t - 1) + r;
}
var ao = 70 * 365 + 19, io = 60 * 60 * 1e3, so = 24 * io;
function lo(e) {
  return e.getTime() / so + ao;
}
function co(e, t) {
  return ho(e) || mo(e, t) || uo(e, t) || fo();
}
function fo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function uo(e, t) {
  if (e) {
    if (typeof e == "string") return Mt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Mt(e, t) : void 0;
  }
}
function Mt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function mo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(i = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); i = !0) ;
    } catch (f) {
      c = !0, o = f;
    } finally {
      try {
        if (!i && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function ho(e) {
  if (Array.isArray(e)) return e;
}
function po(e, t, r, n) {
  var o = t.value, a = t.type, s = t.cellStyleId, l = t.findOrCreateSharedString;
  if (o === null && s === void 0)
    return "";
  var i = {
    r: ue(n, r)
  };
  if (s !== void 0 && (i.s = String(s)), o === null)
    return e("c", i, null, r);
  if (a === Date && s === void 0)
    throw new Error("No `format` was specified for a `Date` value in a cell in row ".concat(n + 1, " column ").concat(r + 1, ". Either specify a `format` for this cell or specify a default global one by passing `dateFormat` option to `writeXlsxFile()` function"));
  var c = vo(a, o, l), f = go(a);
  f && (i.t = f);
  var u = yo(a), d = co(u, 2), h = d[0], b = d[1], p = h + c + b;
  return e("c", i, p, r);
}
function go(e) {
  switch (e) {
    case String:
      return "s";
    case Number:
      return;
    case Date:
      return;
    case Boolean:
      return "b";
    case "Formula":
      return;
    default:
      throw new Error("Unknown type: ".concat(e && e.name || e));
  }
}
function vo(e, t, r) {
  switch (e) {
    case String:
      if (typeof t != "string")
        throw new Error("Invalid cell value: ".concat(t, ". Expected a string"));
      return r(t);
    case Number:
      if (typeof t != "number")
        throw new Error("Invalid cell value: ".concat(t, ". Expected a number"));
      return String(t);
    case Date:
      if (!(t instanceof Date))
        throw new Error("Invalid cell value: ".concat(t, ". Expected a Date"));
      return String(lo(t));
    case Boolean:
      if (typeof t != "boolean")
        throw new Error("Invalid cell value: ".concat(t, ". Expected a boolean"));
      return t ? "1" : "0";
    case "Formula":
      if (typeof t != "string")
        throw new Error("Invalid cell value: ".concat(t, ". Expected a string"));
      return Ee(t);
    default:
      throw new Error("Unknown type: ".concat(e && e.name || e));
  }
}
var bo = /</g;
function yo(e) {
  var t = xo(e), r = t.replace(bo, "</");
  return [t, r];
}
function xo(e) {
  switch (e) {
    case "Formula":
      return "<f>";
    default:
      return "<v>";
  }
}
function ft(e) {
  var t = e.align, r = e.alignVertical, n = e.textRotation, o = e.indent, a = e.wrap;
  return !!(t || r || typeof n == "number" || o || a);
}
function gt(e) {
  var t = e.borderColor, r = e.borderStyle, n = e.leftBorderColor, o = e.leftBorderStyle, a = e.rightBorderColor, s = e.rightBorderStyle, l = e.topBorderColor, i = e.topBorderStyle, c = e.bottomBorderColor, f = e.bottomBorderStyle;
  return !!(t || r || n || o || a || s || l || i || c || f);
}
function Ze(e) {
  var t = e.backgroundColor, r = e.fillPatternStyle, n = e.fillPatternColor;
  return !!(t || r && n);
}
function vt(e) {
  var t = e.fontFamily, r = e.fontSize, n = e.fontWeight, o = e.fontStyle, a = e.textDecoration, s = e.textColor;
  return !!(t || typeof r == "number" || n || o || a && Object.keys(a).length > 0 || s);
}
function Br(e, t) {
  var r = e.align, n = e.alignVertical, o = e.textRotation, a = e.indent, s = e.wrap, l = e.fontFamily, i = e.fontSize, c = e.fontWeight, f = e.fontStyle, u = e.textDecoration, d = e.textColor, h = e.backgroundColor, b = e.fillPatternStyle, p = e.fillPatternColor, m = e.borderColor, S = e.borderStyle, C = e.leftBorderColor, A = e.leftBorderStyle, y = e.rightBorderColor, w = e.rightBorderStyle, E = e.topBorderColor, x = e.topBorderStyle, v = e.bottomBorderColor, g = e.bottomBorderStyle;
  if (ft({
    align: r,
    alignVertical: n,
    textRotation: o,
    indent: a,
    wrap: s
  }) || vt({
    fontFamily: l,
    fontSize: i,
    fontWeight: c,
    fontStyle: f,
    textDecoration: u,
    textColor: d
  }) || Ze({
    backgroundColor: h,
    fillPatternStyle: b,
    fillPatternColor: p
  }) || gt({
    borderColor: m,
    borderStyle: S,
    leftBorderColor: C,
    leftBorderStyle: A,
    rightBorderColor: y,
    rightBorderStyle: w,
    topBorderColor: E,
    topBorderStyle: x,
    bottomBorderColor: v,
    bottomBorderStyle: g
  }))
    return wo({
      // alignment
      align: r,
      alignVertical: n,
      textRotation: o,
      indent: a,
      wrap: s,
      // font
      fontFamily: l,
      fontSize: i,
      fontWeight: c,
      fontStyle: f,
      textDecoration: u,
      textColor: d,
      // fill
      backgroundColor: h,
      fillPatternStyle: b,
      fillPatternColor: p,
      // border
      borderColor: m,
      borderStyle: S,
      leftBorderColor: C,
      leftBorderStyle: A,
      rightBorderColor: y,
      rightBorderStyle: w,
      topBorderColor: E,
      topBorderStyle: x,
      bottomBorderColor: v,
      bottomBorderStyle: g
    });
}
function wo(e) {
  var t = {};
  for (var r in e)
    e[r] !== void 0 && (t[r] = e[r]);
  return t;
}
var So = {}.constructor;
function je(e) {
  return e != null && e.constructor === So;
}
function Or(e) {
  return je(e);
}
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function Rt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Co(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(r), !0).forEach(function(n) {
      Ao(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Rt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Ao(e, t, r) {
  return (t = Eo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Eo(e) {
  var t = Io(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function Io(e, t) {
  if (de(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (de(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Fo(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = To(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function To(e, t) {
  if (e) {
    if (typeof e == "string") return $t(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? $t(e, t) : void 0;
  }
}
function $t(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Bo(e, t, r, n) {
  for (var o, a = Fo(t), s; !(s = a()).done; ) {
    var l = s.value;
    Or(l) && l.height && (o === void 0 || o < l.height) && (o = l.height);
  }
  var i = r, c = t.map(function(u, d) {
    return Oo(e, u, d, i, n);
  }).join(""), f = {
    r: r + 1
  };
  return o && (f.ht = o, f.customHeight = 1), e("row", f, c, r);
}
function Oo(e, t, r, n, o) {
  var a = o.findOrCreateCellStyle, s = o.findOrCreateSharedString, l = o.hasDefaultFont, i = o.dateFormat;
  if (t == null)
    return "";
  var c = Or(t) ? t : {
    value: t
  }, f = Br(c), u = c.type, d = c.value, h = c.format;
  if (Do(d) ? d = null : u === void 0 && (u = ko(d), u === void 0 && (u = String, d = String(d))), h) {
    if (u !== Date && u !== Number && u !== String && u !== "Formula")
      throw new Error('`format` "'.concat(h, '" was specified on a cell of type `').concat(u, '`. `format` could only be specified on a cell of type `Date`, `Number`, `String` or `"Formula"`.'));
    if (u === String && h !== "@")
      throw new Error('`format` "'.concat(h, '" was specified on a cell of type `String`. The only supported `format` for a cell of type `String` is "@".'));
  } else
    u === Date && (h = i);
  var b = !!h, p = !!f, m;
  return (l || b || p) && (m = a(Co({
    format: h
  }, f))), po(e, {
    value: d,
    type: u,
    cellStyleId: m,
    findOrCreateSharedString: s
  }, r, n);
}
function Do(e) {
  return e == null || e === "";
}
function ko(e) {
  switch (de(e)) {
    case "string":
      return String;
    case "number":
      return Number;
    case "boolean":
      return Boolean;
    default:
      if (e instanceof Date)
        return Date;
  }
}
function Po(e, t, r) {
  var n = t.map(function(o, a) {
    return Bo(e, o, a, r);
  }).join("");
  return e("sheetData", null, n);
}
function jo(e, t) {
  for (var r = [], n = function() {
    e = e.slice();
    for (var d = 0; d < e.length; )
      e[d] = e[d].slice(), d++;
    return n = function() {
      return e;
    }, e;
  }, o = 0; o < e.length; ) {
    for (var a = e[o], s = 0; s < a.length; ) {
      var l = a[s];
      if (l) {
        var i = l.rowSpan, c = i === void 0 ? 1 : i, f = typeof l.span == "number" ? l.span : l.columnSpan;
        typeof f != "number" && (f = 1), (f > 1 || c > 1) && (Lo(e, o, s, f, c, n), r.push([[o, s], [o + (c ? c - 1 : 0), s + (f ? f - 1 : 0)]]));
      }
      s++;
    }
    o++;
  }
  return {
    sheetData: e,
    mergedCells: r
  };
}
function Lo(e, t, r, n, o, a, s) {
  var l = Br(e[t][r]);
  l && (e = a());
  for (var i = t; i <= t + (o - 1); ) {
    for (var c = r; c <= r + (n - 1); ) {
      var f = e[i][c];
      if (i > t || c > r) {
        if (f != null)
          throw new Error("[write-excel-file] When using `columnSpan` or `rowSpan` parameters, all hidden overlapped cells should be represented by `null`s or `undefined`s. Cell at row ".concat(t + 1, " and column ").concat(r + 1, " is configured with `columnSpan` ").concat(n, " and `rowSpan` ").concat(o, ". Cell at row ").concat(i + 1, " and column ").concat(c + 1, " is neither `null` nor `undefined`: ").concat(JSON.stringify(f)));
        l && (e[i][c] = l);
      }
      c++;
    }
    i++;
  }
}
function Mo(e, t) {
  return No(e) || zo(e, t) || $o(e, t) || Ro();
}
function Ro() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $o(e, t) {
  if (e) {
    if (typeof e == "string") return zt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? zt(e, t) : void 0;
  }
}
function zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function zo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(i = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); i = !0) ;
    } catch (f) {
      c = !0, o = f;
    } finally {
      try {
        if (!i && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function No(e) {
  if (Array.isArray(e)) return e;
}
function Vo(e, t) {
  if (t.length === 0)
    return "";
  var r = t.map(function(n, o) {
    var a = Mo(n, 2), s = a[0], l = a[1], i = ue(s[0], s[1]) + ":" + ue(l[0], l[1]);
    return e("mergeCell", {
      ref: i
    }, null, o);
  }).join("");
  return e("mergeCells", {
    count: t.length
  }, r);
}
function _o(e, t) {
  var r = t.orientation;
  if (r) {
    var n = 0.7, o = 0.7, a = 0.75, s = 0.75, l = 0.3, i = 0.3;
    return e("pageMargins", {
      left: n,
      right: o,
      top: a,
      bottom: s,
      header: l,
      footer: i
    });
  }
  return "";
}
function Uo(e, t) {
  var r = t.orientation;
  if (r) {
    var n = 9;
    return e("pageSetup", {
      paperSize: n,
      orientation: N(r)
    });
  }
  return "";
}
function Dr(e) {
  return e("drawing", {
    "r:id": "rId-drawing-1"
  });
}
function Ho(e, t) {
  var r = e.sheetData, n = e.sheetOptions, o = e.sheetIndex, a = e.sheetId, s = e.hasDefaultFont, l = e.findOrCreateCellStyle, i = e.findOrCreateSharedString, c = n.columns, f = n.dateFormat, u = n.orientation, d = n.showGridLines, h = n.rightToLeft, b = n.zoomScale, p = jo(r), m = p.sheetData, S = p.mergedCells, C = {
    sheetIndex: o,
    sheetId: a
  }, A = function(E, x, v, g) {
    return Ar("xl/worksheets/sheet{id}.xml", E, x, v, g, C, n, t);
  }, y = '<?xml version="1.0" ?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' + // The order of elements is dictated by the XLSX spec.
  //
  // `<sheetViews/>`
  to(A, {
    showGridLines: d,
    rightToLeft: h,
    zoomScale: b
  }, o) + // `<cols/>`
  oo(A, c) + // `<sheetData/>`
  Po(A, m, {
    findOrCreateCellStyle: l,
    findOrCreateSharedString: i,
    hasDefaultFont: s,
    dateFormat: f
  }) + // `<mergeCells/>`
  Vo(A, S) + // `<pageMargins/>`
  _o(A, {
    orientation: u
  }) + // `<pageSetup/>`
  Uo(A, {
    orientation: u
  }) + // `<drawing/>`
  Dr(A) + // Apply any plugins that insert additional content to this XML.
  G("xl/worksheets/sheet{id}.xml", t, n, {
    sheetIndex: o,
    sheetId: a
  }) + "</worksheet>";
  return y = q(y, "xl/worksheets/sheet{id}.xml", t, n, {
    sheetIndex: o,
    sheetId: a
  }), y;
}
function Xo(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, a = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + // Each sheet has at most one "drawing", so a globally-unique drawing ID is assumed to be the sheet ID.
  kr(r) + // Apply any plugins that insert additional content to this XML.
  G("xl/worksheets/_rels/sheet{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + "</Relationships>";
  return a = q(a, "xl/worksheets/_rels/sheet{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }), a;
}
function kr(e) {
  return '<Relationship Id="rId-drawing-1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing'.concat(e, '.xml"/>');
}
function Zo(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Wo(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wo(e, t) {
  if (e) {
    if (typeof e == "string") return Nt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Nt(e, t) : void 0;
  }
}
function Nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Ko(e) {
  var t = '<?xml version="1.0"?>';
  t += '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  for (var r = Zo(e), n; !(n = r()).done; ) {
    var o = n.value, a = o.trim().length === o.length ? "" : ' xml:space="preserve"';
    t += "<si><t".concat(a, ">"), t += Ee(o), t += "</t></si>";
  }
  return t += "</sst>", t;
}
function _e(e) {
  if (e[0] !== "#")
    throw new Error('Color "'.concat(e, '" must start with a "#"'));
  return "FF".concat(e.slice(1).toUpperCase());
}
function Pr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = t.conditionalFormatting, n = e.backgroundColor, o = e.fillPatternStyle, a = e.fillPatternColor, s = !o || o === "solid";
  if (!Ze(e))
    return '<fill><patternFill patternType="none"/></fill>';
  var l = "<fill>";
  return l += '<patternFill patternType="'.concat(s ? "solid" : o, '">'), l += '<fgColor rgb="'.concat(N(_e(s ? n : a)), '"/>'), l += "<bgColor ".concat(s && !r ? 'indexed="64"' : 'rgb="' + N(_e(n)) + '"', "/>"), l += "</patternFill>", l += "</fill>", l;
}
function jr(e) {
  var t = e.borderColor, r = e.borderStyle, n = e.leftBorderColor, o = e.leftBorderStyle, a = e.rightBorderColor, s = e.rightBorderStyle, l = e.topBorderColor, i = e.topBorderStyle, c = e.bottomBorderColor, f = e.bottomBorderStyle, u = {
    style: o || r,
    color: n || t
  }, d = {
    style: s || r,
    color: a || t
  }, h = {
    style: i || r,
    color: l || t
  }, b = {
    style: f || r,
    color: c || t
  }, p = "<border>";
  return p += Oe("left", u), p += Oe("right", d), p += Oe("top", h), p += Oe("bottom", b), p += "<diagonal/>", p += "</border>", p;
}
function Oe(e, t) {
  var r = t.style, n = t.color;
  n && !r && (r = "thin");
  var o = !!n;
  return "<".concat(e) + (r ? ' style="'.concat(N(r), '"') : "") + (o ? ">" : "/>") + (n ? '<color rgb="'.concat(N(_e(n)), '"/>') : "") + (o ? "</".concat(e, ">") : "");
}
function Lr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  t.isDefaultGenericFont;
  var r = e.fontFamily, n = e.fontSize, o = e.fontWeight, a = e.fontStyle, s = e.textDecoration, l = e.textColor, i = "<font>";
  return r && (i += '<name val="'.concat(N(r), '"/>')), typeof n == "number" && (i += '<sz val="'.concat(n, '"/>')), i += '<family val="2"/>', r || typeof n == "number" || (i += '<scheme val="minor"/>'), o === "bold" && (i += "<b/>"), a === "italic" && (i += "<i/>"), s && (s.strikethrough && (i += "<strike/>"), s.underline ? i += "<u/>" : s.doubleUnderline && (i += '<u val="double"/>')), l ? i += '<color rgb="'.concat(N(_e(l)), '"/>') : i += '<color theme="1"/>', i += "</font>", i;
}
function Go(e) {
  var t = e.align, r = e.alignVertical, n = e.textRotation, o = e.indent, a = e.wrap;
  return "<alignment" + (t ? ' horizontal="'.concat(N(t), '"') : "") + (r ? ' vertical="'.concat(N(r), '"') : "") + (n ? ' textRotation="'.concat(Yo(qo(n)), '"') : "") + (o ? ' indent="'.concat(N(String(o)), '"') : "") + (a ? ' wrapText="1"' : "") + "/>";
}
function qo(e) {
  if (!(e >= -90 && e <= 90))
    throw new Error("Unsupported text rotation angle: ".concat(e, ". Values from -90 to 90 are supported."));
  return e;
}
function Yo(e) {
  return e < 0 ? 90 - e : e;
}
function Ie(e) {
  "@babel/helpers - typeof";
  return Ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ie(e);
}
function Vt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(r), !0).forEach(function(n) {
      Jo(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Vt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Jo(e, t, r) {
  return (t = Qo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Qo(e) {
  var t = ea(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function ea(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Ie(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Mr = 100;
function ta(e) {
  var t = [], r = {}, n = [], o = {}, a = [], s = {}, l = [], i = {}, c = [], f = {}, u = a.length;
  s[Q(e)] = u, a.push(e || {});
  var d = {};
  i[Q(d)] = l.length, l.push(d);
  var h = {};
  f[Q(h)] = c.length, c.push(h);
  var b = {
    gray125: !0
  };
  l.push(b);
  function p(m) {
    var S = m.format, C = m.align, A = m.alignVertical, y = m.textRotation, w = m.indent, E = m.wrap, x = m.fontFamily, v = m.fontSize, g = m.fontWeight, B = m.fontStyle, D = m.textDecoration, P = m.textColor, X = m.backgroundColor, L = m.fillPatternStyle, M = m.fillPatternColor, $ = m.borderColor, O = m.borderStyle, R = m.leftBorderColor, W = m.leftBorderStyle, me = m.rightBorderColor, _ = m.rightBorderStyle, te = m.topBorderColor, Y = m.topBorderStyle, U = m.bottomBorderColor, k = m.bottomBorderStyle, H = {
      fontFamily: x,
      fontSize: v,
      fontWeight: g,
      fontStyle: B,
      textDecoration: D,
      textColor: P
    }, he = {
      backgroundColor: X,
      fillPatternStyle: L,
      fillPatternColor: M
    }, re = {
      borderColor: $,
      borderStyle: O,
      leftBorderColor: R,
      leftBorderStyle: W,
      rightBorderColor: me,
      rightBorderStyle: _,
      topBorderColor: te,
      topBorderStyle: Y,
      bottomBorderColor: U,
      bottomBorderStyle: k
    }, We = {
      align: C,
      alignVertical: A,
      textRotation: y,
      indent: w,
      wrap: E
    }, pe = Q(S), ge = Q(H), ve = Q(he), le = Q(re), ne = Q(m), Qr = function() {
      var be;
      S && (be = r[pe], be === void 0 && (be = Mr + t.length, r[pe] = be, t.push(S)));
      var ce;
      vt(H) ? (ce = s[ge], ce === void 0 && (ce = a.length, s[ge] = ce, a.push(_t(_t({}, H), {}, {
        fontSize: H.fontSize || e && e.fontSize,
        fontFamily: H.fontFamily || e && e.fontFamily
      })))) : e && (ce = u);
      var ye;
      Ze(he) && (ye = i[ve], ye === void 0 && (ye = l.length, i[ve] = ye, l.push({
        backgroundColor: X,
        fillPatternStyle: L,
        fillPatternColor: M
      })));
      var xe;
      gt(re) && (xe = f[le], xe === void 0 && (xe = c.length, f[le] = xe, c.push(re)));
      var yt = n.length;
      return o[ne] = yt, n.push({
        formatId: be,
        fontId: ce,
        fillId: ye,
        borderId: xe,
        alignment: We
      }), yt;
    };
    return o[ne] !== void 0 ? o[ne] : Qr();
  }
  return p({}), {
    getCellStyles: function() {
      return {
        formats: t,
        styles: n,
        fonts: a,
        fills: l,
        borders: c
      };
    },
    findOrCreateCellStyle: p
  };
}
function Q(e) {
  return JSON.stringify(e);
}
function De(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ra(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ra(e, t) {
  if (e) {
    if (typeof e == "string") return Ut(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Ut(e, t) : void 0;
  }
}
function Ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function na(e, t, r) {
  var n = e.formats, o = e.styles, a = e.fonts, s = e.fills, l = e.borders, i = '<?xml version="1.0" ?>';
  if (i += '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">', n.length > 0) {
    i += '<numFmts count="'.concat(n.length, '">');
    for (var c = 0; c < n.length; c++)
      i += '<numFmt numFmtId="'.concat(Mr + c, '" formatCode="').concat(N(n[c]), '"/>');
    i += "</numFmts>";
  }
  i += '<fonts count="'.concat(a.length, '">');
  for (var f = De(a), u; !(u = f()).done; ) {
    var d = u.value;
    i += Lr(d);
  }
  i += "</fonts>", i += '<fills count="'.concat(s.length, '">');
  for (var h = De(s), b; !(b = h()).done; ) {
    var p = b.value;
    p.gray125 ? (i += "<fill>", i += '<patternFill patternType="gray125"/>', i += "</fill>") : i += Pr(p);
  }
  i += "</fills>", i += '<borders count="'.concat(l.length, '">');
  for (var m = De(l), S; !(S = m()).done; ) {
    var C = S.value;
    i += jr(C);
  }
  i += "</borders>", i += '<cellXfs count="'.concat(o.length, '">');
  for (var A = De(o), y; !(y = A()).done; ) {
    var w = y.value, E = w.fontId, x = w.fillId, v = w.borderId, g = w.alignment, B = w.formatId;
    i += "<xf " + [
      B === void 0 ? void 0 : 'numFmtId="'.concat(B, '" applyNumberFormat="1"'),
      E === void 0 ? void 0 : 'fontId="'.concat(E, '" applyFont="1"'),
      x === void 0 ? void 0 : 'fillId="'.concat(x, '" applyFill="1"'),
      v === void 0 ? void 0 : 'borderId="'.concat(v, '" applyBorder="1"'),
      ft(g) ? 'applyAlignment="1"' : void 0
      // 'xfId="0"'
    ].filter(function(D) {
      return D;
    }).join(" ") + ">" + // Possible horizontal alignment values:
    //  left, center, right, fill, justify, center_across, distributed.
    // Possible vertical alignment values:
    //  top, vcenter, bottom, vjustify, vdistributed.
    // https://xlsxwriter.readthedocs.io/format.html#set_align
    (ft(g) ? Go(g) : "") + "</xf>";
  }
  return i += "</cellXfs>", i += G("xl/styles.xml", r, t), i += "</styleSheet>", i = q(i, "xl/styles.xml", r, t), i;
}
function Rr(e) {
  for (var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = t.tagName, n = t.stopAfterFirstMatch, o = new RegExp($r(r), n ? void 0 : "g"), a = [], s; (s = o.exec(e)) !== null; ) {
    for (var l = s[0], i = r || s[1], c = {}, f = new RegExp('\\s+([^\\s=>]+)(?:="([^\\s=>]+)")', "g"), u = void 0; (u = f.exec(l)) !== null; )
      c[u[1]] = u[2];
    var d = {
      tagName: i,
      // openingTagMarkup: openingTag,
      openingTagStartIndex: s.index,
      openingTagEndIndex: s.index + l.length - 1,
      openingTagAttributes: c,
      selfClosingTag: !1,
      // closingTagMarkup: undefined,
      closingTagStartIndex: void 0,
      closingTagEndIndex: void 0
    };
    if (l[l.length - 2] === "/")
      d.selfClosingTag = !0;
    else {
      var h = oa(e, d.openingTagEndIndex + 1, i);
      if (!h)
        throw new Error("Invalid XML: opening tag was found but closing tag was not: </".concat(i, ">"));
      d.closingTagStartIndex = h[0], d.closingTagEndIndex = h[1];
    }
    if (a.push(d), n)
      break;
    d.selfClosingTag ? o.lastIndex = d.openingTagEndIndex + 1 : o.lastIndex = d.closingTagEndIndex + 1;
  }
  return a;
}
function oa(e, t, r) {
  var n = new RegExp("<(/)?" + r + "(?:\\s+[^>]+|/)?>", "g");
  n.lastIndex = t;
  for (var o = 0, a; (a = n.exec(e)) !== null; ) {
    var s = a[0], l = a[1];
    if (l)
      if (o > 0)
        o--;
      else
        return [a.index, a.index + s.length - 1];
    else
      o++;
  }
}
function $r(e) {
  return "<" + (e || "([^\\s/>]+)") + "(?:\\s+[^>]+|/)?>";
}
function oe(e, t) {
  var r = Rr(e, {
    tagName: t,
    stopAfterFirstMatch: !0
  });
  return r[0];
}
function zr(e, t, r) {
  return r ? t.selfClosingTag ? e.slice(0, t.openingTagEndIndex - 1) + ">" + r + "</" + t.tagName + ">" + e.slice(t.openingTagEndIndex + 1) : e.slice(0, t.openingTagEndIndex + 1) + r + e.slice(t.closingTagStartIndex) : t.selfClosingTag ? e : e.slice(0, t.openingTagEndIndex) + "/>" + e.slice(t.closingTagEndIndex + 1);
}
function Le(e, t, r) {
  return t.selfClosingTag ? zr(e, t, r) : e.slice(0, t.closingTagStartIndex) + r + e.slice(t.closingTagStartIndex);
}
function Nr(e, t) {
  return t.selfClosingTag ? "" : e.substring(t.openingTagEndIndex + 1, t.closingTagStartIndex);
}
function Vr(e, t) {
  var r = t.openingTagEndIndex + 1;
  e.openingTagStartIndex += r, e.openingTagEndIndex += r, e.selfClosingTag || (e.closingTagStartIndex += r, e.closingTagEndIndex += r);
}
function aa(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ia(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ia(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Ht(e, t) : void 0;
  }
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Xt(e, t) {
  for (var r = Rr(Nr(e, t)), n = aa(r), o; !(o = n()).done; ) {
    var a = o.value;
    Vr(a, t);
  }
  return r;
}
function _r(e, t, r) {
  return t.selfClosingTag ? zr(e, t, r) : e.slice(0, t.openingTagEndIndex + 1) + r + e.slice(t.openingTagEndIndex + 1);
}
function Zt(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = sa(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sa(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Wt(e, t) : void 0;
  }
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Ur(e, t, r) {
  for (var n = arguments.length, o = new Array(n > 3 ? n - 3 : 0), a = 3; a < n; a++)
    o[a - 3] = arguments[a];
  if (o.length === 0)
    throw new Error("At least one parent element tag name is required");
  o = o.slice().reverse();
  for (var s, l = function() {
    var y = c.value;
    if (s ? s = Xt(e, s).find(function(w) {
      return w.tagName === y;
    }) : s = oe(e, y), !s)
      throw new Error("Element not found: <".concat(y, ">"));
  }, i = Zt(o), c; !(c = i()).done; )
    l();
  var f = t.match(la);
  if (!f)
    throw new Error("Couldn't extract tag name from markup: ".concat(t));
  var u = f[1];
  if (!r || r.length < 2)
    return Le(e, s, t);
  var d = Xt(e, s);
  if (d.length === 0)
    return Le(e, s, t);
  var h = r.indexOf(u);
  if (h < 0)
    return Le(e, s, t);
  for (var b = r.slice(0, h).reverse(), p = function() {
    var y = C.value, w = d.find(function(E) {
      return E.tagName === y;
    });
    if (w)
      return {
        v: e.slice(0, w.selfClosingTag ? w.openingTagEndIndex + 1 : w.closingTagEndIndex + 1) + t + e.slice(w.selfClosingTag ? w.openingTagEndIndex + 1 : w.closingTagEndIndex + 1)
      };
  }, m, S = Zt(b), C; !(C = S()).done; )
    if (m = p(), m) return m.v;
  return _r(e, s, t);
}
var la = new RegExp($r());
const ca = {
  // This is what Google AI returned for a search query: "xlsx workbook.xml elements order".
  // They say, this order is defined in `CT_Workbook` schema of ECMA-376 specification.
  "xl/workbook.xml": [["workbook", [
    "workbookPr",
    // (Workbook Properties)
    "bookViews",
    // (Book Views)
    "sheets",
    // (List of sheets)
    "pivotCaches",
    // (If applicable)
    "definedNames",
    // (Named ranges)
    "calcPr"
    // (Calculation properties)
  ]]],
  // This is what Google AI returned for a search query: "xlsx styles.xml elements order".
  // They say, this order is defined in `CT_Stylesheet` schema of ECMA-376 specification.
  "xl/styles.xml": [["styleSheet", [
    "numFmts",
    // Defines custom number formats.
    "fonts",
    // Contains font definitions (font name, size, color).
    "fills",
    // Defines cell background colors/patterns.
    "borders",
    // Defines cell borders.
    "cellStyleXfs",
    // Master cell styles (usually style 0 is "Normal").
    "cellXfs",
    // Actual cell formatting definitions (<xf>) referenced by cells.
    "cellStyles",
    // Connects named styles to cellStyleXfs.
    "dxfs",
    // Differential formats (conditional formatting).
    "tableStyles"
    // Table-specific styles.
  ]]],
  // This is what Google AI returned for a search query: "xlsx sheet.xml elements order".
  // They say, this order is defined in `CT_Worksheet` schema of ECMA-376 specification.
  "xl/worksheets/sheet{id}.xml": [["worksheet", [
    "sheetPr",
    // Sheet properties (e.g., tab color, filter configurations).
    "dimension",
    // Defines the range of used cells (e.g., ref="A1:C10").
    "sheetViews",
    // View settings like freeze panes, zoom level, and whether the sheet is selected.
    "sheetFormatPr",
    // Default row height and column width properties.
    "cols",
    // Defines column-specific properties (width, hidden status).
    "sheetData",
    // (Required) The main container for cell data, rows, and values.
    "sheetCalcPr",
    // Calculation properties.
    "sheetProtection",
    // Sheet-level security and locked status.
    "protectedRanges",
    // Specific ranges that are protected.
    "scenarios",
    // Worksheet scenarios.
    "autoFilter",
    // Filter range definitions.
    "sortState",
    // Current sort information.
    "dataConsolidate",
    // Data consolidation settings.
    "customSheetViews",
    // Custom view settings.
    "mergeCells",
    // Defines ranges of merged cells.
    "phoneticPr",
    // Phonetic information properties.
    "conditionalFormatting",
    // Rules for formatting based on cell values.
    "dataValidations",
    // Data entry rules and dropdowns.
    "hyperlinks",
    // Links to external sites or other sheet locations.
    "printOptions",
    // Defines specific printing preferences, such as centering, gridlines, and headings.
    "pageMargins",
    // Defines the white space between the worksheet data and the edges of the printed page.
    "pageSetup",
    // Printing and layout settings.
    "headerFooter",
    // Sheet header and footer content.
    "rowBreaks",
    // Manual page breaks.
    "colBreaks",
    // Manual page breaks.
    "drawing",
    // References to graphics or charts (points to drawing.xml).
    "legacyDrawing",
    // References to legacy objects like comments or form controls.
    "picture",
    // Background image properties.
    "oleObjects",
    // Embedded OLE objects.
    "controls",
    // Form or ActiveX controls.
    "tableParts",
    // Links to defined Excel tables within the sheet.
    "extLst"
    // Extension list for future-proofing and custom metadata.
  ]]]
};
function Hr(e) {
  var t = ca[e];
  if (t) {
    for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
      n[o - 1] = arguments[o];
    if (n.length === 0)
      throw new Error("At least one parent element tag name is required");
    for (var a = function() {
      var f = i[l], u = t.find(function(d) {
        return Array.isArray(d) ? d[0] === f : d === f;
      });
      if (!u)
        return {
          v: void 0
        };
      if (Array.isArray(u))
        t = u[1];
      else
        return {
          v: void 0
        };
    }, s, l = 0, i = n; l < i.length; l++)
      if (s = a(), s) return s.v;
    if (t)
      return t.map(function(c) {
        return Array.isArray(c) ? c[0] : c;
      });
  }
}
function Me(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = fa(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fa(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Kt(e, t) : void 0;
  }
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
const ua = {
  files: {
    transform: {
      "xl/worksheets/sheet{id}.xml": {
        // For some weird reason, Excel 2007 demands `<conditionalFormatting/>` element to go before `<drawing/>` element.
        // Because `<drawing/>` element is added before any of the `insert()`s of any features,
        // this feature has to use a `transform()` function instead of an `insert()` function.
        transform: function(t, r, n) {
          n.sheetIndex, n.sheetId;
          var o = r.conditionalFormatting;
          if (o) {
            var a = da(o);
            return Ur(t, a, Hr("xl/worksheets/sheet{id}.xml", "worksheet"), "worksheet");
          }
          return t;
        }
      },
      "xl/styles.xml": {
        insert: function(t) {
          var r = t.map(function(n) {
            return n.conditionalFormatting;
          });
          if (r.some(Boolean))
            return ma(r);
        }
      }
    }
  }
};
function da(e) {
  for (var t = "", r = 0, n = Me(e), o; !(o = n()).done; ) {
    var a = o.value, s = a.cellRange, l = s.from, i = s.to, c = a.condition, f = c.formula, u = c.operator, d = c.value, h = c.value2, b = ue(l.row - 1, l.column - 1) + ":" + ue(i.row - 1, i.column - 1);
    t += '<conditionalFormatting sqref="'.concat(b, '">');
    var p = r + 1, m = a._globalIndex;
    if (f)
      t += '<cfRule type="expression" dxfId="'.concat(m, '" priority="').concat(p, '">'), t += "<formula>".concat(Ee(f), "</formula>"), t += "</cfRule>";
    else if (u)
      t += '<cfRule type="cellIs" operator="'.concat(qt(u), '" dxfId="').concat(m, '" priority="').concat(p, '">'), t += "<formula>".concat(Ee(Gt(d)), "</formula>"), qt(u) === "between" && (t += "<formula>".concat(Ee(Gt(h)), "</formula>")), t += "</cfRule>";
    else
      throw new Error(`Invalid conditional formatting rule:
`.concat(JSON.stringify(a, null, 2)));
    t += "</conditionalFormatting>", r++;
  }
  return t;
}
function Gt(e) {
  return typeof e == "string" ? '"' + e + '"' : String(e);
}
function qt(e) {
  switch (e) {
    case "<":
      return "lessThan";
    case ">":
      return "greaterThan";
    case "<=":
      return "lessThanOrEqual";
    case ">=":
      return "greaterThanOrEqual";
    case "=":
      return "equal";
    case "!=":
      return "notEqual";
    case "...":
      return "between";
    default:
      throw new Error("Unknown conditional formatting operator: ".concat(e));
  }
}
function ma(e) {
  for (var t = 0, r = Me(e), n; !(n = r()).done; ) {
    var o = n.value;
    o && (t += o.length);
  }
  var a = "";
  a += '<dxfs count="'.concat(t, '">');
  for (var s = Me(e), l; !(l = s()).done; ) {
    var i = l.value;
    if (i)
      for (var c = Me(i), f; !(f = c()).done; ) {
        var u = f.value, d = u.style, h = d.fontFamily, b = d.fontSize, p = d.fontWeight, m = d.fontStyle, S = d.textDecoration, C = d.textColor, A = d.backgroundColor, y = d.fillPatternStyle, w = d.fillPatternColor, E = d.borderColor, x = d.borderStyle, v = d.leftBorderColor, g = d.leftBorderStyle, B = d.rightBorderColor, D = d.rightBorderStyle, P = d.topBorderColor, X = d.topBorderStyle, L = d.bottomBorderColor, M = d.bottomBorderStyle;
        a += "<dxf>";
        var $ = {
          fontFamily: h,
          fontSize: b,
          fontWeight: p,
          fontStyle: m,
          textDecoration: S,
          textColor: C
        };
        if (vt($)) {
          if (h)
            throw new Error("Conditional formatting can't be used to override font family");
          if (typeof b == "number")
            throw new Error("Conditional formatting can't be used to override font size");
          a += Lr($);
        }
        var O = {
          backgroundColor: A,
          fillPatternStyle: y,
          fillPatternColor: w
        };
        Ze(O) && (a += Pr(O, {
          conditionalFormatting: !0
        }));
        var R = {
          borderColor: E,
          borderStyle: x,
          leftBorderColor: v,
          leftBorderStyle: g,
          rightBorderColor: B,
          rightBorderStyle: D,
          topBorderColor: P,
          topBorderStyle: X,
          bottomBorderColor: L,
          bottomBorderStyle: M
        };
        gt(R) && (a += jr(R)), a += "</dxf>";
      }
  }
  return a += "</dxfs>", a;
}
function Xr(e) {
  if (!e)
    throw new Error("`contentType` is required");
  var t = e.toLowerCase().replace(/.*\//, "");
  if (!t)
    throw new Error("Unsupported `contentType`: " + e);
  return t;
}
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
function bt(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Zr(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Yt(e) {
  return ga(e) || pa(e) || Zr(e) || ha();
}
function ha() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zr(e, t) {
  if (e) {
    if (typeof e == "string") return ut(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ut(e, t) : void 0;
  }
}
function pa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ga(e) {
  if (Array.isArray(e)) return ut(e);
}
function ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Jt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function ke(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Jt(Object(r), !0).forEach(function(n) {
      Wr(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Jt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Wr(e, t, r) {
  return (t = va(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function va(e) {
  var t = ba(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function ba(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Fe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
const ya = {
  files: {
    transform: {
      "[Content_Types].xml": {
        insert: function(t) {
          var r = t.map(function(n) {
            return n.images;
          });
          if (r.some(Boolean))
            return xa(r);
        }
      },
      "xl/drawings/drawing{id}.xml": {
        insert: function(t, r) {
          r.sheetIndex, r.sheetId;
          var n = t.images;
          if (n)
            return Sa({
              images: n
            });
        }
      },
      "xl/drawings/_rels/drawing{id}.xml.rels": {
        insert: function(t, r) {
          var n = r.sheetIndex;
          r.sheetId;
          var o = t.images;
          if (o)
            return Ca({
              images: o,
              sheetIndex: n
            });
        }
      }
    },
    write: {
      files: function(t, r) {
        r.read;
        var n = t.map(function(o) {
          return o.images;
        });
        if (n.some(Boolean))
          return n.map(function(o, a) {
            return o ? o.reduce(function(s, l, i) {
              return ke(ke({}, s), {}, Wr({}, "xl/media/".concat(Kr(l, {
                sheetIndex: a,
                imageIndex: i
              })), l.content));
            }, {}) : {};
          }).reduce(function(o, a) {
            return ke(ke({}, o), a);
          }, {});
      }
    }
  }
};
function xa(e) {
  for (var t = e.reduce(function(i, c) {
    return [].concat(Yt(i), Yt(c || []));
  }, []), r = "", n = bt(wa(t)), o; !(o = n()).done; ) {
    var a = o.value, s = a.fileExtension, l = a.contentType;
    r += '<Default Extension="'.concat(s, '" ContentType="').concat(l, '"/>');
  }
  return r;
}
function wa(e) {
  for (var t = [], r = function(l) {
    var i = Xr(l.contentType), c = t.find(function(f) {
      return f.fileExtension === i;
    });
    c || t.push({
      fileExtension: i,
      contentType: l.contentType
    });
  }, n = bt(e), o; !(o = n()).done; ) {
    var a = o.value;
    r(a);
  }
  return t;
}
function Kr(e, t) {
  var r = t.sheetIndex, n = t.imageIndex, o = r + 1, a = n + 1;
  return "sheet".concat(o, "-image").concat(a, ".").concat(Xr(e.contentType));
}
function Sa(e) {
  for (var t = e.images, r = "", n = 0, o = function() {
    var i = s.value, c = n + 1, f = function(d) {
      return Ea(d, i.dpi);
    };
    r += "<xdr:oneCellAnchor>", r += "<xdr:from>", r += "<xdr:col>".concat(i.anchor.column - 1, "</xdr:col>"), r += "<xdr:colOff>".concat(typeof i.offsetX == "number" ? f(i.offsetX) : 0, "</xdr:colOff>"), r += "<xdr:row>".concat(i.anchor.row - 1, "</xdr:row>"), r += "<xdr:rowOff>".concat(typeof i.offsetY == "number" ? f(i.offsetY) : 0, "</xdr:rowOff>"), r += "</xdr:from>", r += '<xdr:ext cx="'.concat(f(i.width), '" cy="').concat(f(i.height), '"/>'), r += "<xdr:pic>", r += "<xdr:nvPicPr>", r += '<xdr:cNvPr id="'.concat(c, '" name="').concat(i.title ? N(i.title) : "Picture " + c, '" descr="').concat(i.description ? N(i.description) : "", '"/>'), r += "<xdr:cNvPicPr>", r += '<a:picLocks noChangeAspect="1"/>', r += "</xdr:cNvPicPr>", r += "</xdr:nvPicPr>", r += "<xdr:blipFill>", r += '<a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId-image-'.concat(c, '" cstate="print"/>'), r += "<a:stretch>", r += "<a:fillRect/>", r += "</a:stretch>", r += "</xdr:blipFill>", r += "<xdr:spPr>", r += '<a:prstGeom prst="rect">', r += "<a:avLst/>", r += "</a:prstGeom>", r += "</xdr:spPr>", r += "</xdr:pic>", r += "<xdr:clientData/>", r += "</xdr:oneCellAnchor>", n++;
  }, a = bt(t), s; !(s = a()).done; )
    o();
  return r;
}
function Ca(e) {
  var t = e.images, r = e.sheetIndex;
  return t.map(function(n, o) {
    var a = o + 1;
    return '<Relationship Id="rId-image-'.concat(a, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/').concat(Kr(n, {
      sheetIndex: r,
      imageIndex: o
    }), '"/>');
  }).join("");
}
var Qt = 96, Aa = 96;
function Ea(e, t) {
  var r = Qt;
  return Math.round(e * 9525 * (Qt / r) * (Aa / t));
}
function Ia(e, t, r) {
  return t.selfClosingTag ? e.slice(0, t.openingTagStartIndex) + r + e.slice(t.openingTagEndIndex + 1) : e.slice(0, t.openingTagStartIndex) + r + e.slice(t.closingTagEndIndex + 1);
}
function Fa(e, t, r) {
  var n = oe(Nr(e, r), t);
  if (n)
    return Vr(n, r), n;
}
const Ta = {
  files: {
    transform: {
      "xl/worksheets/sheet{id}.xml": {
        transform: function(t, r, n) {
          var o = n.sheetIndex, a = n.sheetId;
          if (er(r)) {
            var s = r.stickyRowsCount, l = r.stickyColumnsCount, i = {
              // The vertical position of the split, in 1/20th of a point (twips),
              // or, when frozen, the number of visible rows in the top pane(s).
              ySplit: s || 0,
              // The horizontal position of the split, in 1/20th of a point (twips),
              // or, when frozen, the number of visible columns in the left pane(s).
              xSplit: l || 0,
              // The visible cell in the top-left corner of the bottom-right pane.
              topLeftCell: ue(s || 0, l || 0),
              // `activePane` defines which pane is active in a "split" or "frozen" `state`.
              // Possible values: "bottomLeft", "bottomRight", "topLeft", "topRight".
              activePane: "bottomRight",
              // `state: "frozen"` indicates that the panes are frozen, meaning the split area
              // (usually top rows or leftmost columns) remains fixed while the rest of the sheet scrolls.
              // Other possible values:
              // "split" — Indicates that the window is split into separate panes that can be scrolled independently, but are not locked in place.
              // "frozenSplit" — A combination used in specific scenarios (often by Excel itself) to manage complex freezing.
              state: "frozen"
            }, c = oe(t, "sheetView");
            if (c) {
              var f = Fa(t, "pane", c), u = Ve("pane", i);
              f ? t = Ia(t, f, u) : t = Le(t, c, u);
            } else {
              var d = oe(t, "sheetViews");
              if (d)
                throw new Error("xl/worksheets/sheet".concat(a, ".xml: <sheetViews/> element exists but it doesn't contain any <sheetView/> elements"));
              var h = {
                tabSelected: o === 0 ? 1 : 0,
                // The first sheet is selected by default.
                workbookViewId: 0
              }, b = Ne("sheetViews") + Ne("sheetView", h) + Ve("pane", i) + ct("sheetView") + ct("sheetViews"), p = oe(t, "worksheet");
              t = _r(t, p, b);
            }
          }
          return t;
        }
      },
      "xl/workbook.xml": {
        transform: function(t, r) {
          if (r.some(er)) {
            var n = oe(t, "workbookView");
            if (!n) {
              var o = oe(t, "bookViews");
              if (o)
                throw new Error("xl/workbook.xml: <bookViews/> element exists but it doesn't contain any <workbookView/> elements");
              return Ur(t, "<bookViews><workbookView/></bookViews>", Hr("xl/workbook.xml", "workbook"), "workbook");
            }
          }
          return t;
        }
      }
    }
  }
};
function er(e) {
  return !!e.stickyRowsCount || !!e.stickyColumnsCount;
}
function Ba(e) {
  var t = [];
  return t.push(ua), t.push(ya), t.push(Ta), e && (e.forEach(Da), t = t.concat(e)), t;
}
var Oa = ["[Content_Types].xml", "_rels/.rels", "xl/styles.xml", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/worksheets/sheet{id}.xml", "xl/worksheets/_rels/sheet{id}.xml.rels", "xl/drawings/drawing{id}.xml", "xl/drawings/_rels/drawing{id}.xml.rels"];
function Da(e) {
  if (e.files && e.files.transform)
    for (var t = 0, r = Object.keys(e.files.transform); t < r.length; t++) {
      var n = r[t];
      if (Oa.indexOf(n) < 0)
        throw new Error("Unknown file to transform: ".concat(n));
    }
}
function ka(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Pa(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pa(e, t) {
  if (e) {
    if (typeof e == "string") return tr(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? tr(e, t) : void 0;
  }
}
function tr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function rr(e) {
  if (!Array.isArray(e))
    throw new TypeError("Expected sheet data to be an array of rows");
  for (var t = ka(e), r; !(r = t()).done; ) {
    var n = r.value;
    if (Array.isArray(n))
      return;
    throw new Error("Expected each sheet data row to be an array");
  }
}
function ja() {
  var e = [], t = {};
  return {
    getSharedStrings: function() {
      return e;
    },
    findOrCreateSharedString: function(n) {
      var o = t[n];
      return o === void 0 && (o = e.length, t[n] = o, e.push(n)), o;
    }
  };
}
var La = /[\[\]\/\\:*?]+/;
function Ma(e) {
  if (!e)
    throw new Error("Sheet name can't be empty");
  if (e.length > 31)
    throw new Error('Sheet name "'.concat(e, `" can't be longer than 31 characters`));
  if (La.test(e))
    throw new Error('Sheet name "'.concat(e, '" contains illegal characters: []/\\:*?'));
}
function Ra(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = $a(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(e, t) {
  if (e) {
    if (typeof e == "string") return nr(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? nr(e, t) : void 0;
  }
}
function nr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function za(e, t, r) {
  for (var n = ja(), o = n.getSharedStrings, a = n.findOrCreateSharedString, s = Na(r), l = ta(s), i = l.getCellStyles, c = l.findOrCreateCellStyle, f = t.map(function(m) {
    return m.sheet;
  }), u = Ra(f), d; !(d = u()).done; ) {
    var h = d.value;
    Ma(h);
  }
  for (var b = [], p = 0; p < f.length; )
    b.push({
      sheetData: e[p],
      sheetOptions: t[p],
      sheetIndex: p,
      sheetId: or(p),
      hasDefaultFont: !!s,
      // hasDefaultFont: Boolean(sheetsDefaultFonts[sheetIndex]),
      // findOrCreateCellStyle: (style) => findOrCreateCellStyle(style, sheetIndex),
      findOrCreateCellStyle: c,
      findOrCreateSharedString: a
    }), p++;
  return {
    sheets: f.map(function(m, S) {
      var C = S;
      return {
        sheetId: or(C),
        sheetName: m,
        sheetXmlParameters: b[C]
      };
    }),
    getSharedStrings: o,
    getCellStyles: i
  };
}
function or(e) {
  return String(e + 1);
}
function Na(e) {
  var t = e.fontFamily, r = e.fontSize;
  if (t || typeof r == "number")
    return {
      fontFamily: t,
      fontSize: r
    };
}
function Va(e, t) {
  var r;
  return t.some(function(n) {
    return n.header;
  }) && (r = t.map(function(n) {
    var o = n.header;
    return o || null;
  })), (r ? [r] : []).concat(e.map(function(n, o) {
    return t.map(function(a) {
      var s = a.cell;
      return s(n, o);
    });
  }));
}
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function ar(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function ir(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ar(Object(r), !0).forEach(function(n) {
      _a(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ar(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function _a(e, t, r) {
  return (t = Ua(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Ua(e) {
  var t = Ha(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function Ha(e, t) {
  if (Te(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Te(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Xa(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Za(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Za(e, t) {
  if (e) {
    if (typeof e == "string") return sr(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? sr(e, t) : void 0;
  }
}
function sr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Wa(e, t, r) {
  for (var n = r.read, o = {}, a = Xa(e), s; !(s = a()).done; ) {
    var l = s.value;
    if (l.files && l.files.write && l.files.write.files) {
      var i = l.files.write.files(t, {
        read: n
      });
      i && (o = ir(ir({}, o), i));
    }
  }
  return o;
}
function Be(e) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Be(e);
}
var Ka = ["data"];
function lr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function fe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? lr(Object(r), !0).forEach(function(n) {
      Ga(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : lr(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Ga(e, t, r) {
  return (t = qa(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function qa(e) {
  var t = Ya(e, "string");
  return Be(t) == "symbol" ? t : t + "";
}
function Ya(e, t) {
  if (Be(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Be(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ja(e, t) {
  if (e == null) return {};
  var r, n, o = Qa(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++) r = a[n], t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (o[r] = e[r]);
  }
  return o;
}
function Qa(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e) if ({}.hasOwnProperty.call(e, n)) {
    if (t.indexOf(n) !== -1) continue;
    r[n] = e[n];
  }
  return r;
}
function Gr(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ei(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ei(e, t) {
  if (e) {
    if (typeof e == "string") return cr(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? cr(e, t) : void 0;
  }
}
function cr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function ti(e, t, r) {
  var n = qr(e, t), o = n.sheets, a = n.options, s = o.map(function(x) {
    return x.data;
  }), l = o.map(function(x) {
    return x.options;
  });
  l = ii(l), l = si(l);
  var i = Ba(a.features), c = {}, f = function(v) {
    return c[v];
  }, u = function(v) {
    for (var g = 0, B = Object.keys(v); g < B.length; g++) {
      var D = B[g];
      oi(D), ai(D, v[D]), c[D] = v[D];
    }
  }, d = za(s, l, a), h = d.sheets, b = d.getSharedStrings, p = d.getCellStyles;
  c["[Content_Types].xml"] = Jn({
    sheetIds: h.map(function(x) {
      return x.sheetId;
    }),
    features: i,
    sheetsOptions: l
  }), c["_rels/.rels"] = Yn({
    features: i,
    sheetsOptions: l
  }), c["xl/_rels/workbook.xml.rels"] = qn({
    sheetIds: h.map(function(x) {
      return x.sheetId;
    }),
    features: i,
    sheetsOptions: l
  }), c["xl/workbook.xml"] = Kn({
    sheetIdsAndNames: h.map(function(x) {
      var v = x.sheetId, g = x.sheetName;
      return {
        sheetId: v,
        sheetName: g
      };
    }),
    features: i,
    sheetsOptions: l
  });
  for (var m = 0, S = Gr(h), C; !(C = S()).done; ) {
    var A = C.value, y = A.sheetId, w = A.sheetXmlParameters, E = l[m];
    c["xl/worksheets/sheet".concat(y, ".xml")] = Ho(w, i), c["xl/worksheets/_rels/sheet".concat(y, ".xml.rels")] = Xo({
      sheetIndex: m,
      sheetId: y,
      sheetOptions: E,
      features: i
    }), c["xl/drawings/drawing".concat(y, ".xml")] = Qn({
      sheetIndex: m,
      sheetId: y,
      sheetOptions: E,
      features: i
    }), c["xl/drawings/_rels/drawing".concat(y, ".xml.rels")] = eo({
      sheetIndex: m,
      sheetId: y,
      sheetOptions: E,
      features: i
    }), m++;
  }
  return u(Wa(i, l, {
    read: f
  })), c["xl/styles.xml"] = na(p(), l, i), c["xl/sharedStrings.xml"] = Ko(b()), ri(c, h), c;
}
function ri(e, t) {
  for (var r = Gr(t), n; !(n = r()).done; ) {
    var o = n.value.sheetId;
    if (e["xl/drawings/drawing".concat(o, ".xml")] === Ir + Fr) {
      if (delete e["xl/drawings/drawing".concat(o, ".xml")], delete e["xl/drawings/_rels/drawing".concat(o, ".xml.rels")], !Ye(e, "xl/worksheets/sheet".concat(o, ".xml"), Dr(Ve)))
        throw new Error(ni);
      Ye(e, "xl/worksheets/_rels/sheet".concat(o, ".xml.rels"), kr(o)), Ye(e, "[Content_Types].xml", Er(o));
    }
  }
}
var ni = "Couldn't remove unused drawings";
function Ye(e, t, r) {
  if (!e[t])
    throw new Error("File not found: ".concat(t));
  if (e[t].indexOf(r) < 0)
    throw new Error('Substring "'.concat(r, '" not found in "').concat(t, '"'));
  var n = e[t], o = n.replace(r, "");
  return e[t] = o, n !== o;
}
function oi(e) {
  if (e[0] === "/")
    throw new Error("File path must not start with a slash (/)");
}
function ai(e, t) {
  if (!t)
    throw new Error("File `content` not specified: ".concat(e));
}
function qr(e, t, r) {
  if (Array.isArray(e))
    if (e.length === 0 || Array.isArray(e[0])) {
      if (rr(e), Array.isArray(e[0]) && e.length > 0 && Array.isArray(e[0][0]))
        throw new Error("In order to write multiple sheets, pass an array of sheet objects");
      return {
        sheets: [{
          data: e,
          options: t || {}
        }],
        options: {}
      };
    } else if (je(e[0])) {
      if (je(t) && Array.isArray(t.schema))
        throw new Error("`schema` parameter was removed, use `columns` parameter instead");
      return je(t) && Array.isArray(t.columns) ? qr(Va(e, t.columns), t) : {
        sheets: e.map(function(n) {
          var o = n.data, a = Ja(n, Ka);
          if (!o)
            throw new Error("`data` property is required for each sheet");
          return rr(o), {
            data: o,
            options: a || {}
          };
        }),
        options: t || {}
      };
    } else
      throw new Error("Invalid first argument: must be either sheet data — an array of arrays — or an array of sheet objects");
  else
    throw new Error("Invalid first argument: must be an array");
}
function ii(e) {
  return e.map(function(t, r) {
    return fe(fe({}, t), {}, {
      sheet: t.sheet || "Sheet".concat(r + 1)
    });
  });
}
function si(e) {
  var t = 0;
  return e.map(function(r) {
    return fe(fe({}, r), {}, {
      conditionalFormatting: r.conditionalFormatting && r.conditionalFormatting.map(function(n) {
        return fe(fe({}, n), {}, {
          // `++` operator returns the value before the increment.
          _globalIndex: t++
        });
      })
    });
  });
}
function li(e, t, r) {
  return {
    toBlob: function() {
      return ui(e, t, r, vn);
    }
  };
}
function ci(e, t, r, n, o, a) {
  var s = ti(e, t);
  return Ln(s, n).then(function(l) {
    var i = o(l);
    return i.then(function(c) {
      return fi(c);
    });
  });
}
function fi(e) {
  return new Blob([e], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
function ui(e, t, r, n) {
  return ci(e, t, r, n, jn);
}
const di = (e) => /^\d+$/.test(e) ? `https://www.facebook.com/profile.php?id=${e}` : "", Ue = [
  { header: "Profile Id", width: 18, value: (e) => e.profileId },
  { header: "Full Name", width: 28, value: (e) => e.fullName },
  { header: "Profile Link", width: 42, value: (e) => e.profileLink, link: !0 },
  { header: "Profile Link (Id)", width: 54, value: (e) => di(e.profileId), link: !0 },
  { header: "Bio", width: 40, value: (e) => e.bio },
  { header: "ImageSrc", width: 24, value: (e) => e.imageSrc },
  { header: "GroupId", width: 18, value: (e) => e.groupId },
  { header: "Group Joining Text", width: 28, value: (e) => e.groupJoiningText },
  { header: "Profile Type", width: 12, value: (e) => e.profileType }
];
function mi(e, t) {
  const r = URL.createObjectURL(e), n = document.createElement("a");
  n.href = r, n.download = t, document.body.appendChild(n), n.click(), n.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
const hi = (e) => /^[=+\-@\t\r]/.test(e) ? `'${e}` : e;
function pi(e) {
  const t = (n) => {
    const o = hi(n ?? "");
    return /[",\r\n]/.test(o) ? `"${o.replace(/"/g, '""')}"` : o;
  }, r = e.map((n) => n.map(t).join(",")).join(`\r
`);
  return new Blob(["\uFEFF" + r + `\r
`], { type: "text/csv;charset=utf-8" });
}
const gi = (e) => /^https:\/\/(www|web|m)\.facebook\.com\/[^"]*$/.test(e) && e.length <= 255;
async function vi(e, t) {
  const [r, ...n] = e, o = r.map((l) => ({
    value: l,
    fontWeight: "bold",
    backgroundColor: "#E8F5EF",
    bottomBorderStyle: "thin",
    bottomBorderColor: "#9CCDB8"
  })), a = n.map((l) => l.map((i, c) => {
    var f;
    return (f = Ue[c]) != null && f.link && i && gi(i) ? {
      type: "Formula",
      // SpreadsheetML stores formulas without the leading "=".
      value: `HYPERLINK("${i}","${i}")`,
      textColor: "#0563C1",
      textDecoration: { underline: !0 }
    } : { type: String, value: i ?? "" };
  })), s = [o, ...a];
  return li(s, {
    sheet: t,
    columns: Ue.map((l) => ({ width: l.width })),
    stickyRowsCount: 1
  }).toBlob();
}
const bi = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M164.38,181.1a52,52,0,1,0-72.76,0,75.89,75.89,0,0,0-30,28.89,12,12,0,0,0,20.78,12,53,53,0,0,1,91.22,0,12,12,0,1,0,20.78-12A75.89,75.89,0,0,0,164.38,181.1ZM100,144a28,28,0,1,1,28,28A28,28,0,0,1,100,144Zm147.21,9.59a12,12,0,0,1-16.81-2.39c-8.33-11.09-19.85-19.59-29.33-21.64a12,12,0,0,1-1.82-22.91,20,20,0,1,0-24.78-28.3,12,12,0,1,1-21-11.6,44,44,0,1,1,73.28,48.35,92.18,92.18,0,0,1,22.85,21.69A12,12,0,0,1,247.21,153.59Zm-192.28-24c-9.48,2.05-21,10.55-29.33,21.65A12,12,0,0,1,6.41,136.79,92.37,92.37,0,0,1,29.26,115.1a44,44,0,1,1,73.28-48.35,12,12,0,1,1-21,11.6,20,20,0,1,0-24.78,28.3,12,12,0,0,1-1.82,22.91Z"/></svg>', yi = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M160,208a12,12,0,0,1-12,12H120a12,12,0,0,1-12-12V152a12,12,0,0,1,24,0v44h16A12,12,0,0,1,160,208ZM91,142.22A12,12,0,0,0,74.24,145L64,159.34,53.77,145a12,12,0,1,0-19.53,14l15,21-15,21A12,12,0,1,0,53.77,215L64,200.62,74.24,215A12,12,0,0,0,93.77,201l-15-21,15-21A12,12,0,0,0,91,142.22Zm122.53,32.05c-5.12-3.45-11.32-5.24-16.79-6.82a79.69,79.69,0,0,1-7.92-2.59c2.45-1.18,9.71-1.3,16.07.33A12,12,0,0,0,211,142a69,69,0,0,0-12-1.86c-9.93-.66-18,1.08-24.1,5.17a24.45,24.45,0,0,0-10.69,17.76c-1.1,8.74,2.49,16.27,10.11,21.19,4.78,3.09,10.36,4.7,15.75,6.26,3,.89,7.94,2.3,9.88,3.53a2.48,2.48,0,0,1-.21.71c-1.37,1.55-9.58,1.79-16.39-.06a12,12,0,1,0-6.46,23.11A63.75,63.75,0,0,0,193.1,220c6.46,0,13.73-1.17,19.73-5.15a24.73,24.73,0,0,0,10.95-18C225,187.53,221.33,179.53,213.51,174.27ZM36,108V40A20,20,0,0,1,56,20h96a12,12,0,0,1,8.49,3.51l56,56A12,12,0,0,1,220,88v20a12,12,0,1,1-24,0v-4H148a12,12,0,0,1-12-12V44H60v64a12,12,0,1,1-24,0ZM160,80h23L160,57Z"/></svg>', xi = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M48,180c0,8.67,5.49,16,12,16a10.27,10.27,0,0,0,7.33-3.43,12,12,0,1,1,17.34,16.6A34,34,0,0,1,60,220C40.15,220,24,202,24,180s16.15-40,36-40a34,34,0,0,1,24.67,10.83,12,12,0,1,1-17.34,16.6A10.27,10.27,0,0,0,60,164C53.49,164,48,171.31,48,180Zm97.51-5.71c-5.13-3.45-11.33-5.24-16.8-6.82a79.5,79.5,0,0,1-7.91-2.59c2.45-1.18,9.71-1.3,16.07.33A12,12,0,0,0,143,142a69.24,69.24,0,0,0-12-1.86c-9.93-.66-18,1.08-24.1,5.17a24.45,24.45,0,0,0-10.69,17.76c-1.1,8.74,2.48,16.27,10.11,21.19,4.78,3.09,10.36,4.7,15.75,6.26,3,.89,7.94,2.3,9.88,3.53a2,2,0,0,1-.22.71c-1.36,1.55-9.57,1.79-16.39-.06a12,12,0,0,0-6.45,23.11A63.73,63.73,0,0,0,125.09,220c6.47,0,13.74-1.17,19.74-5.15a24.73,24.73,0,0,0,10.95-18C157,187.53,153.32,179.53,145.51,174.27ZM216,140.68A12,12,0,0,0,200.7,148L192,172.3,183.3,148A12,12,0,1,0,160.7,156l20,56a12,12,0,0,0,22.6,0l20-56A12,12,0,0,0,216,140.68ZM36,108V40A20,20,0,0,1,56,20h96a12,12,0,0,1,8.49,3.51l56,56A12,12,0,0,1,220,88v20a12,12,0,1,1-24,0v-4H148a12,12,0,0,1-12-12V44H60v64a12,12,0,1,1-24,0ZM160,80h23L160,57Z"/></svg>', fr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M47.51,112.49a12,12,0,0,1,17-17L116,147V32a12,12,0,0,1,24,0V147l51.51-51.52a12,12,0,0,1,17,17l-72,72a12,12,0,0,1-17,0ZM216,204H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/></svg>', wi = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M200,28H160a20,20,0,0,0-20,20V208a20,20,0,0,0,20,20h40a20,20,0,0,0,20-20V48A20,20,0,0,0,200,28Zm-4,176H164V52h32ZM96,28H56A20,20,0,0,0,36,48V208a20,20,0,0,0,20,20H96a20,20,0,0,0,20-20V48A20,20,0,0,0,96,28ZM92,204H60V52H92Z"/></svg>', Je = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H180V36A28,28,0,0,0,152,8H104A28,28,0,0,0,76,36V48H40a12,12,0,0,0,0,24h4V208a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V72h4a12,12,0,0,0,0-24ZM100,36a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4V48H100Zm88,168H68V72H188ZM116,104v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm48,0v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Z"/></svg>', Si = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"/></svg>', Ci = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M220,48V96a12,12,0,0,1-24,0V77l-39.51,39.52a12,12,0,0,1-17-17L179,60H160a12,12,0,0,1,0-24h48A12,12,0,0,1,220,48ZM99.51,139.51,60,179V160a12,12,0,0,0-24,0v48a12,12,0,0,0,12,12H96a12,12,0,0,0,0-24H77l39.52-39.51a12,12,0,0,0-17-17Z"/></svg>', Ai = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M108,60A16,16,0,1,1,92,44,16,16,0,0,1,108,60Zm56,16a16,16,0,1,0-16-16A16,16,0,0,0,164,76ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,180a16,16,0,1,0,16,16A16,16,0,0,0,92,180Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,180Z"/></svg>';
class Ei extends gn {
  constructor() {
    super(...arguments);
    F(this, "name", "fb-scrape-storage");
  }
  get headers() {
    return Ue.map((r) => r.header);
  }
  itemToRow(r) {
    return Ue.map((n) => n.value(r) ?? "");
  }
}
const ae = new Ei();
let Ii = null;
function Yr(e = 5e3) {
  return Ii ?? (Ii = (async () => {
    const t = Date.now();
    for (; ae.persistent && !ae.db && Date.now() - t < e; )
      await new Promise((r) => setTimeout(r, 50));
  })());
}
const Fi = `
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

@media (prefers-reduced-motion: reduce) {
    .fbs-panel, .fbs-panel.fbs-pulse, .fbs-dot.fbs-dot-on { animation: none !important; }
    .fbs-panel * { transition: none !important; }
}
`;
function Ti() {
  if (document.getElementById("fbs-styles")) return;
  const e = document.createElement("style");
  e.id = "fbs-styles", e.textContent = Fi, document.head.appendChild(e);
}
const Jr = {
  en: {
    locale: "en-US",
    membersLabel: "members captured",
    groups: (e) => `from ${e} group${e !== 1 ? "s" : ""}`,
    hintStart: "Open the group's People tab to start",
    hintCapturing: "Capturing members... keep scrolling!",
    hintIdle: "Scroll for more, or download when ready",
    hintDone: "Looks like the end of the list. Download your file.",
    downloadExcel: "Download Excel",
    downloadCsv: "CSV",
    sheetName: "Members",
    autoScroll: "Auto scroll",
    stopScroll: "Stop",
    reset: "Clear",
    confirmReset: "Confirm?",
    minimize: "Minimize",
    expand: "Expand",
    activity: "Activity",
    ready: "Ready",
    loadedFromCache: (e) => `Loaded ${e} from cache`,
    added: (e) => `+${e} members`,
    scrollStarted: "Auto scroll started",
    scrollStopped: "Auto scroll stopped",
    autoStopped: (e) => `No new members for ${e}s, auto scroll stopped`,
    downloaded: (e, t) => `Downloaded ${e} members (${t})`,
    downloadFailed: "Download failed",
    cleared: "All data cleared"
  },
  vi: {
    locale: "vi-VN",
    membersLabel: "thành viên đã lấy",
    groups: (e) => `từ ${e} nhóm`,
    hintStart: "Mở tab Mọi người của nhóm để bắt đầu",
    hintCapturing: "Đang lấy thành viên... cứ cuộn tiếp!",
    hintIdle: "Cuộn thêm để lấy tiếp, hoặc tải file khi đủ",
    hintDone: "Có vẻ đã hết danh sách. Bấm Tải Excel để lưu.",
    downloadExcel: "Tải Excel",
    downloadCsv: "CSV",
    sheetName: "Thành viên",
    autoScroll: "Tự động cuộn",
    stopScroll: "Dừng cuộn",
    reset: "Xóa",
    confirmReset: "Xác nhận?",
    minimize: "Thu nhỏ",
    expand: "Mở rộng",
    activity: "Hoạt động",
    ready: "Sẵn sàng",
    loadedFromCache: (e) => `Đã nạp ${e} người từ bộ nhớ`,
    added: (e) => `+${e} thành viên`,
    scrollStarted: "Bắt đầu tự động cuộn",
    scrollStopped: "Đã dừng tự động cuộn",
    autoStopped: (e) => `${e} giây không có thành viên mới, đã tự dừng cuộn`,
    downloaded: (e, t) => `Đã tải xuống ${e} thành viên (${t})`,
    downloadFailed: "Tải xuống thất bại",
    cleared: "Đã xóa toàn bộ dữ liệu"
  }
};
let I = Jr.en;
const Pe = (e) => e.toLocaleString(I.locale);
function Bi() {
  return (document.documentElement.lang || navigator.language || "").toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Oi() {
  for (const e of [document.body, document.documentElement]) {
    const t = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
    if (!t || t.length === 4 && Number(t[3]) === 0) continue;
    const [r, n, o] = t.map(Number);
    return 0.2126 * r + 0.7152 * n + 0.0722 * o < 128 ? "dark" : "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
const ur = 15e3;
function Re(e, t) {
  const r = document.createElement("span");
  return t && (r.className = t), r.innerHTML = e, r.setAttribute("aria-hidden", "true"), r;
}
function ee(e, t, r) {
  e.replaceChildren(Re(t), document.createTextNode(r));
}
class Di {
  constructor() {
    F(this, "panel");
    F(this, "body");
    F(this, "counterEl");
    F(this, "groupCountEl");
    F(this, "hintEl");
    F(this, "dot");
    F(this, "badge");
    F(this, "logEntries");
    F(this, "excelBtn");
    F(this, "csvBtn");
    F(this, "scrollBtn");
    F(this, "minimizeBtn");
    F(this, "resetBtn");
    F(this, "isMinimized", !1);
    F(this, "isScrolling", !1);
    F(this, "scrollTimer", null);
    F(this, "lastNewMemberAt", 0);
    F(this, "groups", /* @__PURE__ */ new Set());
    F(this, "pulseTimer", null);
    F(this, "confirmingReset", !1);
    F(this, "confirmTimer", null);
    F(this, "isDragging", !1);
    F(this, "dragOffX", 0);
    F(this, "dragOffY", 0);
    this.build(), this.setupDrag();
  }
  // ── Build DOM ──
  build() {
    var i;
    (i = document.getElementById("fbs-panel")) == null || i.remove(), this.panel = document.createElement("div"), this.panel.id = "fbs-panel", this.panel.className = "fbs-panel", this.panel.setAttribute("role", "region"), this.panel.setAttribute("aria-label", "FB Scraper");
    const t = document.createElement("div");
    t.className = "fbs-header";
    const r = document.createElement("span");
    r.className = "fbs-title", r.textContent = "FB Scraper", this.dot = document.createElement("span"), this.dot.className = "fbs-dot", this.badge = document.createElement("span"), this.badge.className = "fbs-badge", this.badge.textContent = "0", this.minimizeBtn = document.createElement("button"), this.minimizeBtn.type = "button", this.minimizeBtn.className = "fbs-icon-btn", this.minimizeBtn.addEventListener("click", (c) => {
      c.stopPropagation(), this.toggleMinimize();
    }), t.append(
      Re(Ai, "fbs-grip"),
      Re(bi, "fbs-logo"),
      r,
      this.dot,
      this.badge,
      this.minimizeBtn
    ), this.body = document.createElement("div"), this.body.className = "fbs-body";
    const n = document.createElement("div");
    n.className = "fbs-stats", this.counterEl = document.createElement("span"), this.counterEl.className = "fbs-counter", this.counterEl.textContent = "0", this.counterEl.setAttribute("aria-live", "polite");
    const o = document.createElement("div");
    o.className = "fbs-counter-label", o.textContent = I.membersLabel, this.groupCountEl = document.createElement("span"), this.groupCountEl.className = "fbs-groups", this.groupCountEl.textContent = I.groups(0), n.append(this.counterEl, o, this.groupCountEl), this.hintEl = document.createElement("div"), this.hintEl.className = "fbs-hint", this.hintEl.textContent = I.hintStart;
    const a = document.createElement("div");
    a.className = "fbs-actions", this.excelBtn = document.createElement("button"), this.excelBtn.type = "button", this.excelBtn.className = "fbs-btn fbs-btn-primary", ee(this.excelBtn, yi, I.downloadExcel), this.excelBtn.addEventListener("click", () => this.download("xlsx")), this.csvBtn = document.createElement("button"), this.csvBtn.type = "button", this.csvBtn.className = "fbs-btn fbs-btn-secondary fbs-btn-csv", ee(this.csvBtn, xi, I.downloadCsv), this.csvBtn.addEventListener("click", () => this.download("csv")), this.scrollBtn = document.createElement("button"), this.scrollBtn.type = "button", this.scrollBtn.className = "fbs-btn fbs-btn-secondary fbs-btn-scroll", ee(this.scrollBtn, fr, I.autoScroll), this.scrollBtn.addEventListener("click", () => this.toggleAutoScroll()), this.resetBtn = document.createElement("button"), this.resetBtn.type = "button", this.resetBtn.className = "fbs-btn fbs-btn-ghost", ee(this.resetBtn, Je, I.reset), this.resetBtn.addEventListener("click", () => this.handleReset()), a.append(this.excelBtn, this.csvBtn, this.scrollBtn, this.resetBtn);
    const s = document.createElement("div");
    s.className = "fbs-log";
    const l = document.createElement("div");
    l.className = "fbs-log-title", l.textContent = I.activity, this.logEntries = document.createElement("div"), this.logEntries.className = "fbs-log-entries", s.append(l, this.logEntries), this.body.append(n, this.hintEl, a, s), this.panel.append(t, this.body), this.applyMinimized(), this.setEmpty(!0);
  }
  // ── Drag ──
  setupDrag() {
    this.panel.querySelector(".fbs-header").addEventListener("mousedown", (r) => {
      if (r.target.closest(".fbs-icon-btn")) return;
      this.isDragging = !0;
      const n = this.panel.getBoundingClientRect();
      this.dragOffX = r.clientX - n.left, this.dragOffY = r.clientY - n.top, r.preventDefault();
    }), window.addEventListener("mousemove", (r) => {
      if (!this.isDragging) return;
      const n = Math.max(0, Math.min(r.clientX - this.dragOffX, window.innerWidth - 100)), o = Math.max(0, Math.min(r.clientY - this.dragOffY, window.innerHeight - 50));
      this.panel.style.right = "auto", this.panel.style.bottom = "auto", this.panel.style.left = n + "px", this.panel.style.top = o + "px";
    }), window.addEventListener("mouseup", () => {
      this.isDragging = !1;
    });
  }
  // ── Public ──
  render() {
    document.body.appendChild(this.panel), Yr().then(() => this.refreshCounter()).then((t) => {
      this.addLog(t > 0 ? I.loadedFromCache(Pe(t)) : I.ready);
    });
  }
  setTheme(t) {
    this.panel.dataset.theme !== t && (this.panel.dataset.theme = t);
  }
  setVisible(t) {
    this.panel.style.display = t ? "" : "none", !t && this.isScrolling && this.stopAutoScroll(!1);
  }
  async onCapture(t, r) {
    this.lastNewMemberAt = Date.now(), r && this.groups.add(r), this.groupCountEl.textContent = I.groups(this.groups.size), await this.refreshCounter(), this.addLog(I.added(Pe(t))), this.dot.classList.add("fbs-dot-on"), this.hintEl.textContent = I.hintCapturing, this.panel.classList.remove("fbs-pulse"), this.panel.offsetWidth, this.panel.classList.add("fbs-pulse"), this.pulseTimer && clearTimeout(this.pulseTimer), this.pulseTimer = setTimeout(() => {
      this.panel.classList.remove("fbs-pulse"), this.dot.classList.remove("fbs-dot-on"), this.hintEl.textContent = I.hintIdle;
    }, 2500);
  }
  // ── Private ──
  async refreshCounter() {
    const t = await ae.getCount(), r = Pe(t);
    return this.counterEl.textContent = r, this.badge.textContent = r, this.setEmpty(t === 0), t;
  }
  setEmpty(t) {
    this.excelBtn.disabled = t, this.csvBtn.disabled = t, this.confirmingReset || (this.resetBtn.disabled = t);
  }
  addLog(t) {
    var a;
    const r = document.createElement("div");
    r.className = "fbs-log-entry";
    const n = (/* @__PURE__ */ new Date()).toLocaleTimeString(I.locale, {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }), o = document.createElement("span");
    for (o.className = "fbs-log-time", o.textContent = n, r.append(o, document.createTextNode(t)), this.logEntries.prepend(r); this.logEntries.children.length > 50; )
      (a = this.logEntries.lastChild) == null || a.remove();
  }
  toggleMinimize() {
    this.isMinimized = !this.isMinimized, this.applyMinimized();
  }
  applyMinimized() {
    this.body.style.display = this.isMinimized ? "none" : "", this.panel.classList.toggle("fbs-min", this.isMinimized), this.minimizeBtn.replaceChildren(Re(this.isMinimized ? Ci : Si));
    const t = this.isMinimized ? I.expand : I.minimize;
    this.minimizeBtn.title = t, this.minimizeBtn.setAttribute("aria-label", t), this.minimizeBtn.setAttribute("aria-expanded", String(!this.isMinimized));
  }
  toggleAutoScroll() {
    if (this.isScrolling) {
      this.stopAutoScroll(!1);
      return;
    }
    this.isScrolling = !0, this.lastNewMemberAt = Date.now(), ee(this.scrollBtn, wi, I.stopScroll), this.scrollBtn.classList.add("fbs-on"), this.scrollBtn.setAttribute("aria-pressed", "true"), this.scrollTimer = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight), Date.now() - this.lastNewMemberAt > ur && this.stopAutoScroll(!0);
    }, 150), this.addLog(I.scrollStarted);
  }
  stopAutoScroll(t) {
    this.isScrolling = !1, ee(this.scrollBtn, fr, I.autoScroll), this.scrollBtn.classList.remove("fbs-on"), this.scrollBtn.setAttribute("aria-pressed", "false"), this.scrollTimer && (clearInterval(this.scrollTimer), this.scrollTimer = null), t ? (this.addLog(I.autoStopped(ur / 1e3)), this.hintEl.textContent = I.hintDone) : this.addLog(I.scrollStopped);
  }
  async download(t) {
    const r = await ae.getCount();
    if (r === 0) return;
    const n = await ae.toCsvData(), o = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    try {
      const a = t === "xlsx" ? await vi(n, I.sheetName) : pi(n);
      mi(a, `fb-members-${o}.${t}`), this.addLog(I.downloaded(Pe(r), t === "xlsx" ? "Excel" : "CSV"));
    } catch (a) {
      this.addLog(I.downloadFailed), console.error(a);
    }
  }
  handleReset() {
    if (!this.confirmingReset) {
      this.confirmingReset = !0, ee(this.resetBtn, Je, I.confirmReset), this.resetBtn.classList.add("fbs-confirm"), this.confirmTimer = setTimeout(() => this.cancelReset(), 3e3);
      return;
    }
    this.confirmTimer && clearTimeout(this.confirmTimer), this.cancelReset(), ae.clear().then(() => {
      this.groups.clear(), this.groupCountEl.textContent = I.groups(0), this.refreshCounter(), this.addLog(I.cleared), this.hintEl.textContent = I.hintStart;
    });
  }
  cancelReset() {
    this.confirmingReset = !1, ee(this.resetBtn, Je, I.reset), this.resetBtn.classList.remove("fbs-confirm");
  }
}
let $e;
function ki(e) {
  var a, s, l, i, c, f;
  let t;
  if ((a = e == null ? void 0 : e.data) != null && a.group)
    t = e.data.group;
  else if (((l = (s = e == null ? void 0 : e.data) == null ? void 0 : s.node) == null ? void 0 : l.__typename) === "Group")
    t = e.data.node;
  else
    return;
  let r;
  if ((i = t == null ? void 0 : t.new_members) != null && i.edges)
    r = t.new_members.edges;
  else if ((c = t == null ? void 0 : t.new_forum_members) != null && c.edges)
    r = t.new_forum_members.edges;
  else if ((f = t == null ? void 0 : t.search_results) != null && f.edges)
    r = t.search_results.edges;
  else
    return;
  const n = [];
  let o;
  r.forEach((u) => {
    var w, E, x, v, g;
    const d = u.node.__isEntity === "GroupUserInvite" ? u.node.invitee_profile : u.node;
    if (!d) return;
    const { id: h, name: b, bio_text: p, url: m, profile_picture: S, __isProfile: C } = d, A = ((w = u == null ? void 0 : u.join_status_text) == null ? void 0 : w.text) || ((x = (E = u == null ? void 0 : u.membership) == null ? void 0 : E.join_status_text) == null ? void 0 : x.text), y = (g = (v = d.group_membership) == null ? void 0 : v.associated_group) == null ? void 0 : g.id;
    y && (o = y), n.push([h, {
      profileId: h,
      fullName: b,
      profileLink: m,
      bio: (p == null ? void 0 : p.text) || "",
      imageSrc: (S == null ? void 0 : S.uri) || "",
      groupId: y || "",
      groupJoiningText: A || "",
      profileType: C || ""
    }]);
  }), n.length > 0 && Yr().then(() => ae.addElems(n)).then((u) => {
    typeof u == "number" && u > 0 && ($e == null || $e.onCapture(u, o));
  });
}
function dr(e) {
  const t = [];
  try {
    t.push(JSON.parse(e));
  } catch {
    const r = e.split(`
`);
    if (r.length <= 1) return;
    for (const n of r)
      try {
        t.push(JSON.parse(n));
      } catch {
      }
  }
  for (const r of t)
    ki(r);
}
function Pi() {
  const e = "/api/graphql/", t = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener("readystatechange", function() {
      this.responseURL.includes(e) && this.readyState === 4 && dr(this.responseText);
    }, !1), t.apply(this, arguments);
  };
  const r = window.fetch;
  window.fetch = async function(...n) {
    const o = await r.apply(this, n), a = n[0];
    return (a instanceof Request ? a.url : String(a)).includes(e) && o.clone().text().then(dr).catch(() => {
    }), o;
  };
}
function ji({ groupPagesOnly: e }) {
  Pi();
  const t = () => {
    I = Jr[Bi()], Ti();
    const r = new Di();
    $e = r, r.render();
    const n = () => {
      r.setTheme(Oi());
    };
    n(), setInterval(n, 1e3);
  };
  document.body ? t() : document.addEventListener("DOMContentLoaded", t, { once: !0 });
}
ji({ groupPagesOnly: !1 });
