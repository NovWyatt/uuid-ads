var en = Object.defineProperty;
var tn = (e, t, r) => t in e ? en(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var k = (e, t, r) => tn(e, typeof t != "symbol" ? t + "" : t, r);
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
      e.removeEventListener("success", i), e.removeEventListener("error", s);
    }, i = () => {
      r(ae(e.result)), o();
    }, s = () => {
      n(e.error), o();
    };
    e.addEventListener("success", i), e.addEventListener("error", s);
  });
  return He.set(t, e), t;
}
function an(e) {
  if (et.has(e))
    return;
  const t = new Promise((r, n) => {
    const o = () => {
      e.removeEventListener("complete", i), e.removeEventListener("error", s), e.removeEventListener("abort", s);
    }, i = () => {
      r(), o();
    }, s = () => {
      n(e.error || new DOMException("AbortError", "AbortError")), o();
    };
    e.addEventListener("complete", i), e.addEventListener("error", s), e.addEventListener("abort", s);
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
    return ae(e[t]);
  },
  set(e, t, r) {
    return e[t] = r, !0;
  },
  has(e, t) {
    return e instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in e;
  }
};
function hr(e) {
  tt = e(tt);
}
function sn(e) {
  return nn().includes(e) ? function(...t) {
    return e.apply(rt(this), t), ae(this.request);
  } : function(...t) {
    return ae(e.apply(rt(this), t));
  };
}
function ln(e) {
  return typeof e == "function" ? sn(e) : (e instanceof IDBTransaction && an(e), Qe(e, rn()) ? new Proxy(e, tt) : e);
}
function ae(e) {
  if (e instanceof IDBRequest)
    return on(e);
  if (Ke.has(e))
    return Ke.get(e);
  const t = ln(e);
  return Object.is(t, e) || (Ke.set(e, t), He.set(t, e)), t;
}
const rt = (e) => He.get(e);
function cn(e, t, { blocked: r, upgrade: n, blocking: o, terminated: i } = {}) {
  const s = indexedDB.open(e, t), l = ae(s);
  return n && s.addEventListener("upgradeneeded", (a) => {
    n(ae(s.result), a.oldVersion, a.newVersion, ae(s.transaction), a);
  }), r && s.addEventListener("blocked", (a) => r(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    a.oldVersion,
    a.newVersion,
    a
  )), l.then((a) => {
    i && a.addEventListener("close", () => i()), o && a.addEventListener("versionchange", (c) => o(c.oldVersion, c.newVersion, c));
  }).catch(() => {
  }), l;
}
const fn = ["get", "getKey", "getAll", "getAllKeys", "count"], un = ["put", "add", "delete", "clear"], qe = {};
function St(e, t) {
  if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string"))
    return;
  if (qe[t])
    return qe[t];
  const r = t.replace(/FromIndex$/, ""), n = t !== r, o = un.includes(r);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(r in (n ? IDBIndex : IDBObjectStore).prototype) || !(o || fn.includes(r))
  )
    return;
  const i = async function(s, ...l) {
    const a = this.transaction(s, o ? "readwrite" : "readonly");
    let c = a.store;
    return n && (c = c.index(l.shift())), (await Promise.all([
      c[r](...l),
      o && a.done
    ]))[0];
  };
  return qe[t] = i;
}
hr((e) => ({
  ...e,
  get: (t, r, n) => St(t, r) || e.get(t, r, n),
  has: (t, r) => !!St(t, r) || e.has(t, r)
}));
const dn = ["advance", "continue", "continuePrimaryKey"], Ct = {}, nt = /* @__PURE__ */ new WeakMap(), mr = /* @__PURE__ */ new WeakMap(), hn = {
  get(e, t) {
    if (!dn.includes(t))
      return e[t];
    let r = Ct[t];
    return r || (r = Ct[t] = function(...n) {
      nt.set(this, mr.get(this)[t](...n));
    }), r;
  }
};
async function* mn(...e) {
  let t = this;
  if (t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)
    return;
  t = t;
  const r = new Proxy(t, hn);
  for (mr.set(r, t), He.set(r, rt(t)); t; )
    yield r, t = await (nt.get(r) || t.continue()), nt.delete(r);
}
function Et(e, t) {
  return t === Symbol.asyncIterator && Qe(e, [IDBIndex, IDBObjectStore, IDBCursor]) || t === "iterate" && Qe(e, [IDBIndex, IDBObjectStore]);
}
hr((e) => ({
  ...e,
  get(t, r, n) {
    return Et(t, r) ? mn : e.get(t, r, n);
  },
  has(t, r) {
    return Et(t, r) || e.has(t, r);
  }
}));
var Z = function(e, t, r, n) {
  function o(i) {
    return i instanceof r ? i : new r(function(s) {
      s(i);
    });
  }
  return new (r || (r = Promise))(function(i, s) {
    function l(f) {
      try {
        c(n.next(f));
      } catch (u) {
        s(u);
      }
    }
    function a(f) {
      try {
        c(n.throw(f));
      } catch (u) {
        s(u);
      }
    }
    function c(f) {
      f.done ? i(f.value) : o(f.value).then(l, a);
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
          let i;
          if (r < 5)
            try {
              t.deleteObjectStore("data");
            } catch {
            }
          t.objectStoreNames.contains("data") ? i = o.objectStore("data") : i = t.createObjectStore("data", {
            keyPath: "_id",
            autoIncrement: !0
          }), i && !i.indexNames.contains("_createdAt") && i.createIndex("_createdAt", "_createdAt"), i && !i.indexNames.contains("_groupId") && i.createIndex("_groupId", "_groupId"), i && !i.indexNames.contains("_pk") && i.createIndex("_pk", "_pk", {
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
  _dbSetElem(t, r, n = !1, o, i) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        let s = !1;
        i || (i = this.db.transaction("data", "readwrite"));
        const l = i.store, a = yield l.index("_pk").get(t);
        if (a)
          n && (yield l.put(Object.assign(Object.assign({}, a), r)), s = !0);
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
        } catch (i) {
          console.error(i);
        }
      else
        this.data.set(t, r);
      return !0;
    });
  }
  addElems(t, r = !1, n) {
    return Z(this, void 0, void 0, function* () {
      if (this.persistent && this.db) {
        const o = [], i = this.db.transaction("data", "readwrite"), s = [];
        if (t.forEach(([l, a]) => {
          s.indexOf(l) === -1 && (s.push(l), o.push(this._dbSetElem(l, a, r, n, i)));
        }), o.length > 0) {
          o.push(i.done);
          const l = yield Promise.all(o);
          let a = 0;
          return l.forEach((c) => {
            typeof c == "boolean" && c && (a += 1);
          }), a;
        }
        return 0;
      } else
        return t.forEach(([o, i]) => {
          this.addElem(o, i);
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
          const { _id: o } = n, i = pn(n, ["_id"]);
          t.set(o, i);
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
var At;
(function(e) {
  e.ADD = "add", e.LOG = "log";
})(At || (At = {}));
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
var N = Uint8Array, z = Uint16Array, dt = Int32Array, ht = new N([
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
]), mt = new N([
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
]), It = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), pr = function(e, t) {
  for (var r = new z(31), n = 0; n < 31; ++n)
    r[n] = t += 1 << e[n - 1];
  for (var o = new dt(r[30]), n = 1; n < 30; ++n)
    for (var i = r[n]; i < r[n + 1]; ++i)
      o[i] = i - r[n] << 5 | n;
  return { b: r, r: o };
}, gr = pr(ht, 2), yn = gr.b, ot = gr.r;
yn[28] = 258, ot[258] = 28;
var xn = pr(mt, 0), kt = xn.r, it = new z(32768);
for (var T = 0; T < 32768; ++T) {
  var J = (T & 43690) >> 1 | (T & 21845) << 1;
  J = (J & 52428) >> 2 | (J & 13107) << 2, J = (J & 61680) >> 4 | (J & 3855) << 4, it[T] = ((J & 65280) >> 8 | (J & 255) << 8) >> 1;
}
var Ee = function(e, t, r) {
  for (var n = e.length, o = 0, i = new z(t); o < n; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new z(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var l;
  if (r) {
    l = new z(1 << t);
    var a = 15 - t;
    for (o = 0; o < n; ++o)
      if (e[o])
        for (var c = o << 4 | e[o], f = t - e[o], u = s[e[o] - 1]++ << f, d = u | (1 << f) - 1; u <= d; ++u)
          l[it[u] >> a] = c;
  } else
    for (l = new z(n), o = 0; o < n; ++o)
      e[o] && (l[o] = it[s[e[o] - 1]++] >> 15 - e[o]);
  return l;
}, se = new N(288);
for (var T = 0; T < 144; ++T)
  se[T] = 8;
for (var T = 144; T < 256; ++T)
  se[T] = 9;
for (var T = 256; T < 280; ++T)
  se[T] = 7;
for (var T = 280; T < 288; ++T)
  se[T] = 8;
var Ne = new N(32);
for (var T = 0; T < 32; ++T)
  Ne[T] = 5;
var wn = /* @__PURE__ */ Ee(se, 9, 0), Sn = /* @__PURE__ */ Ee(Ne, 5, 0), vr = function(e) {
  return (e + 7) / 8 | 0;
}, br = function(e, t, r) {
  return (r == null || r > e.length) && (r = e.length), new N(e.subarray(t, r));
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
}, Ge = function(e, t) {
  for (var r = [], n = 0; n < e.length; ++n)
    e[n] && r.push({ s: n, f: e[n] });
  var o = r.length, i = r.slice();
  if (!o)
    return { t: xr, l: 0 };
  if (o == 1) {
    var s = new N(r[0].s + 1);
    return s[r[0].s] = 1, { t: s, l: 1 };
  }
  r.sort(function(w, I) {
    return w.f - I.f;
  }), r.push({ s: -1, f: 25001 });
  var l = r[0], a = r[1], c = 0, f = 1, u = 2;
  for (r[0] = { s: -1, f: l.f + a.f, l, r: a }; f != o - 1; )
    l = r[r[c].f < r[u].f ? c++ : u++], a = r[c != f && r[c].f < r[u].f ? c++ : u++], r[f++] = { s: -1, f: l.f + a.f, l, r: a };
  for (var d = i[0].s, n = 1; n < o; ++n)
    i[n].s > d && (d = i[n].s);
  var m = new z(d + 1), b = at(r[f - 1], m, 0);
  if (b > t) {
    var n = 0, p = 0, h = b - t, C = 1 << h;
    for (i.sort(function(I, x) {
      return m[x.s] - m[I.s] || I.f - x.f;
    }); n < o; ++n) {
      var E = i[n].s;
      if (m[E] > t)
        p += C - (1 << b - m[E]), m[E] = t;
      else
        break;
    }
    for (p >>= h; p > 0; ) {
      var A = i[n].s;
      m[A] < t ? p -= 1 << t - m[A]++ - 1 : ++n;
    }
    for (; n >= 0 && p; --n) {
      var y = i[n].s;
      m[y] == t && (--m[y], ++p);
    }
    b = t;
  }
  return { t: new N(m), l: b };
}, at = function(e, t, r) {
  return e.s == -1 ? Math.max(at(e.l, t, r + 1), at(e.r, t, r + 1)) : t[e.s] = r;
}, Tt = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var r = new z(++t), n = 0, o = e[0], i = 1, s = function(a) {
    r[n++] = a;
  }, l = 1; l <= t; ++l)
    if (e[l] == o && l != t)
      ++i;
    else {
      if (!o && i > 2) {
        for (; i > 138; i -= 138)
          s(32754);
        i > 2 && (s(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (s(o), --i; i > 6; i -= 6)
          s(8304);
        i > 2 && (s(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        s(o);
      i = 1, o = e[l];
    }
  return { c: r.subarray(0, n), n: t };
}, Se = function(e, t) {
  for (var r = 0, n = 0; n < t.length; ++n)
    r += e[n] * t[n];
  return r;
}, yr = function(e, t, r) {
  var n = r.length, o = vr(t + 2);
  e[o] = n & 255, e[o + 1] = n >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < n; ++i)
    e[o + i + 4] = r[i];
  return (o + 4 + n) * 8;
}, Ft = function(e, t, r, n, o, i, s, l, a, c, f) {
  K(t, f++, r), ++o[256];
  for (var u = Ge(o, 15), d = u.t, m = u.l, b = Ge(i, 15), p = b.t, h = b.l, C = Tt(d), E = C.c, A = C.n, y = Tt(p), w = y.c, I = y.n, x = new z(19), v = 0; v < E.length; ++v)
    ++x[E[v] & 31];
  for (var v = 0; v < w.length; ++v)
    ++x[w[v] & 31];
  for (var g = Ge(x, 7), F = g.t, O = g.l, P = 19; P > 4 && !F[It[P - 1]]; --P)
    ;
  var X = c + 5 << 3, L = Se(o, se) + Se(i, Ne) + s, M = Se(o, d) + Se(i, p) + s + 14 + 3 * P + Se(x, F) + 2 * x[16] + 3 * x[17] + 7 * x[18];
  if (a >= 0 && X <= L && X <= M)
    return yr(t, f, e.subarray(a, a + c));
  var $, B, R, W;
  if (K(t, f, 1 + (M < L)), f += 2, M < L) {
    $ = Ee(d, m, 0), B = d, R = Ee(p, h, 0), W = p;
    var he = Ee(F, O, 0);
    K(t, f, A - 257), K(t, f + 5, I - 1), K(t, f + 10, P - 4), f += 14;
    for (var v = 0; v < P; ++v)
      K(t, f + 3 * v, F[It[v]]);
    f += 3 * P;
    for (var V = [E, w], te = 0; te < 2; ++te)
      for (var Y = V[te], v = 0; v < Y.length; ++v) {
        var U = Y[v] & 31;
        K(t, f, he[U]), f += F[U], U > 15 && (K(t, f, Y[v] >> 5 & 127), f += Y[v] >> 12);
      }
  } else
    $ = wn, B = se, R = Sn, W = Ne;
  for (var v = 0; v < l; ++v) {
    var D = n[v];
    if (D > 255) {
      var U = D >> 18 & 31;
      we(t, f, $[U + 257]), f += B[U + 257], U > 7 && (K(t, f, D >> 23 & 31), f += ht[U]);
      var H = D & 31;
      we(t, f, R[H]), f += W[H], H > 3 && (we(t, f, D >> 5 & 8191), f += mt[H]);
    } else
      we(t, f, $[D]), f += B[D];
  }
  return we(t, f, $[256]), f + B[256];
}, En = /* @__PURE__ */ new dt([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), xr = /* @__PURE__ */ new N(0), An = function(e, t, r, n, o, i) {
  var s = i.z || e.length, l = new N(n + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = l.subarray(n, l.length - o), c = i.l, f = (i.r || 0) & 7;
  if (t) {
    f && (a[0] = i.r >> 3);
    for (var u = En[t - 1], d = u >> 13, m = u & 8191, b = (1 << r) - 1, p = i.p || new z(32768), h = i.h || new z(b + 1), C = Math.ceil(r / 3), E = 2 * C, A = function(ne) {
      return (e[ne] ^ e[ne + 1] << C ^ e[ne + 2] << E) & b;
    }, y = new dt(25e3), w = new z(288), I = new z(32), x = 0, v = 0, g = i.i || 0, F = 0, O = i.w || 0, P = 0; g + 2 < s; ++g) {
      var X = A(g), L = g & 32767, M = h[X];
      if (p[L] = M, h[X] = L, O <= g) {
        var $ = s - g;
        if ((x > 7e3 || F > 24576) && ($ > 423 || !c)) {
          f = Ft(e, a, 0, y, w, I, v, F, P, g - P, f), F = x = v = 0, P = g;
          for (var B = 0; B < 286; ++B)
            w[B] = 0;
          for (var B = 0; B < 30; ++B)
            I[B] = 0;
        }
        var R = 2, W = 0, he = m, V = L - M & 32767;
        if ($ > 2 && X == A(g - V))
          for (var te = Math.min(d, $) - 1, Y = Math.min(32767, g), U = Math.min(258, $); V <= Y && --he && L != M; ) {
            if (e[g + R] == e[g + R - V]) {
              for (var D = 0; D < U && e[g + D] == e[g + D - V]; ++D)
                ;
              if (D > R) {
                if (R = D, W = V, D > te)
                  break;
                for (var H = Math.min(V, D - 2), me = 0, B = 0; B < H; ++B) {
                  var re = g - V + B & 32767, We = p[re], pe = re - We & 32767;
                  pe > me && (me = pe, M = re);
                }
              }
            }
            L = M, M = p[L], V += L - M & 32767;
          }
        if (W) {
          y[F++] = 268435456 | ot[R] << 18 | kt[W];
          var ge = ot[R] & 31, ve = kt[W] & 31;
          v += ht[ge] + mt[ve], ++w[257 + ge], ++I[ve], O = g + R, ++x;
        } else
          y[F++] = e[g], ++w[e[g]];
      }
    }
    for (g = Math.max(g, O); g < s; ++g)
      y[F++] = e[g], ++w[e[g]];
    f = Ft(e, a, c, y, w, I, v, F, P, g - P, f), c || (i.r = f & 7 | a[f / 8 | 0] << 3, f -= 7, i.h = h, i.p = p, i.i = g, i.w = O);
  } else {
    for (var g = i.w || 0; g < s + c; g += 65535) {
      var le = g + 65535;
      le >= s && (a[f / 8 | 0] = c, le = s), f = yr(a, f + 1, e.subarray(g, le));
    }
    i.i = s;
  }
  return br(l, 0, n + vr(f) + o);
}, In = /* @__PURE__ */ function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var r = t, n = 9; --n; )
      r = (r & 1 && -306674912) ^ r >>> 1;
    e[t] = r;
  }
  return e;
}(), kn = function() {
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
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return An(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, r, n, o);
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
function Fn(e, t) {
  return Tn(e, t || {}, 0, 0);
}
var Sr = function(e, t, r, n) {
  for (var o in e) {
    var i = e[o], s = t + o, l = n;
    Array.isArray(i) && (l = wr(n, i[1]), i = i[0]), ArrayBuffer.isView(i) ? r[s] = [i, l] : (r[s += "/"] = [new N(0), l], Sr(i, s, r, n));
  }
}, Bt = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Bn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), On = 0;
try {
  Bn.decode(xr, { stream: !0 }), On = 1;
} catch {
}
function st(e, t) {
  var r;
  if (Bt)
    return Bt.encode(e);
  for (var n = e.length, o = new N(e.length + (e.length >> 1)), i = 0, s = function(c) {
    o[i++] = c;
  }, r = 0; r < n; ++r) {
    if (i + 5 > o.length) {
      var l = new N(i + 8 + (n - r << 1));
      l.set(o), o = l;
    }
    var a = e.charCodeAt(r);
    a < 128 || t ? s(a) : a < 2048 ? (s(192 | a >> 6), s(128 | a & 63)) : a > 55295 && a < 57344 ? (a = 65536 + (a & 1047552) | e.charCodeAt(++r) & 1023, s(240 | a >> 18), s(128 | a >> 12 & 63), s(128 | a >> 6 & 63), s(128 | a & 63)) : (s(224 | a >> 12), s(128 | a >> 6 & 63), s(128 | a & 63));
  }
  return br(o, 0, i);
}
var lt = function(e) {
  var t = 0;
  if (e)
    for (var r in e) {
      var n = e[r].length;
      n > 65535 && Xe(9), t += n + 4;
    }
  return t;
}, Ot = function(e, t, r, n, o, i, s, l) {
  var a = n.length, c = r.extra, f = l && l.length, u = lt(c);
  j(e, t, s != null ? 33639248 : 67324752), t += 4, s != null && (e[t++] = 20, e[t++] = r.os), e[t] = 20, t += 2, e[t++] = r.flag << 1 | (i < 0 && 8), e[t++] = o && 8, e[t++] = r.compression & 255, e[t++] = r.compression >> 8;
  var d = new Date(r.mtime == null ? Date.now() : r.mtime), m = d.getFullYear() - 1980;
  if ((m < 0 || m > 119) && Xe(10), j(e, t, m << 25 | d.getMonth() + 1 << 21 | d.getDate() << 16 | d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1), t += 4, i != -1 && (j(e, t, r.crc), j(e, t + 4, i < 0 ? -i - 2 : i), j(e, t + 8, r.size)), j(e, t + 12, a), j(e, t + 14, u), t += 16, s != null && (j(e, t, f), j(e, t + 6, r.attrs), j(e, t + 10, s), t += 14), e.set(n, t), t += a, u)
    for (var b in c) {
      var p = c[b], h = p.length;
      j(e, t, +b), j(e, t + 2, h), e.set(p, t + 4), t += 4 + h;
    }
  return f && (e.set(l, t), t += f), t;
}, Dn = function(e, t, r, n, o) {
  j(e, t, 101010256), j(e, t + 8, r), j(e, t + 10, r), j(e, t + 12, n), j(e, t + 16, o);
};
function Pn(e, t) {
  t || (t = {});
  var r = {}, n = [];
  Sr(e, "", r, t);
  var o = 0, i = 0;
  for (var s in r) {
    var l = r[s], a = l[0], c = l[1], f = c.level == 0 ? 0 : 8, u = st(s), d = u.length, m = c.comment, b = m && st(m), p = b && b.length, h = lt(c.extra);
    d > 65535 && Xe(11);
    var C = f ? Fn(a, c) : a, E = C.length, A = kn();
    A.p(a), n.push(wr(c, {
      size: a.length,
      crc: A.d(),
      c: C,
      f: u,
      m: b,
      u: d != s.length || b && m.length != p,
      o,
      compression: f
    })), o += 30 + d + h + E, i += 76 + 2 * (d + h) + (p || 0) + E;
  }
  for (var y = new N(i + 22), w = o, I = i - o, x = 0; x < n.length; ++x) {
    var u = n[x];
    Ot(y, u.o, u, u.f, u.u, u.c.length);
    var v = 30 + u.f.length + lt(u.extra);
    y.set(u.c, u.o + v), Ot(y, o, u, u.f, u.u, u.c.length, u.o, u.m), o += 16 + v + (u.m ? u.m.length : 0);
  }
  return Dn(y, o, n.length, I, w), y;
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
    if (typeof e == "string") return Dt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Dt(e, t) : void 0;
  }
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function q(e, t, r, n) {
  for (var o = "", i = Rn(t), s; !(s = i()).done; ) {
    var l = s.value, a = l.files && l.files.transform && l.files.transform[e];
    if (a && a.insert) {
      var c = a.insert(r, n);
      c && (o += c);
    }
  }
  return o;
}
function Nn(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = _n(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _n(e, t) {
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
function G(e, t, r, n, o) {
  for (var i = Nn(r), s; !(s = i()).done; ) {
    var l = s.value, a = l.files && l.files.transform && l.files.transform[t];
    a && a.transform && (e = a.transform(e, n, o));
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
var zn = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, Vn = new RegExp("([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|(?:\\uD83F[\\uDFFE\\uDFFF])|(?:\\uD87F[\\uDFFE\\uDFFF])|(?:\\uD8BF[\\uDFFE\\uDFFF])|(?:\\uD8FF[\\uDFFE\\uDFFF])|(?:\\uD93F[\\uDFFE\\uDFFF])|(?:\\uD97F[\\uDFFE\\uDFFF])|(?:\\uD9BF[\\uDFFE\\uDFFF])|(?:\\uD9FF[\\uDFFE\\uDFFF])|(?:\\uDA3F[\\uDFFE\\uDFFF])|(?:\\uDA7F[\\uDFFE\\uDFFF])|(?:\\uDABF[\\uDFFE\\uDFFF])|(?:\\uDAFF[\\uDFFE\\uDFFF])|(?:\\uDB3F[\\uDFFE\\uDFFF])|(?:\\uDB7F[\\uDFFE\\uDFFF])|(?:\\uDBBF[\\uDFFE\\uDFFF])|(?:\\uDBFF[\\uDFFE\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))", "g");
function pt(e) {
  return e = e.replace(zn, ""), e = e.replace(Vn, ""), e;
}
function _(e) {
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
    return "".concat(Un(t), '="').concat(_(String(e[t])), '"');
  }).reduce(function(t, r) {
    return t + " " + r;
  }, "");
}
function _e(e, t) {
  return "<" + e + (t ? Hn(t) : "") + ">";
}
function ct(e) {
  return "</" + e + ">";
}
function ze(e, t) {
  return _e(e, t).slice(0, -1) + "/>";
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
function Er(e, t, r, n, o, i, s, l) {
  for (var a = Xn(l), c; !(c = a()).done; ) {
    var f = c.value, u = f.files && f.files.transform && f.files.transform[e];
    u && u.transformElementAttributes && (r = u.transformElementAttributes(t, r || Wn, o, s, i));
  }
  return n ? _e(t, r) + n + ct(t) : ze(t, r);
}
var Wn = {};
function Kn(e) {
  var t = e.sheetIdsAndNames, r = e.features, n = e.sheetsOptions, o = function(l, a, c, f) {
    return Er("xl/workbook.xml", l, a, c, f, qn, n, r);
  }, i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' + // The order of elements is dictated by the XLSX spec.
  //
  // <workbookPr/>
  o("workbookPr") + // <bookViews/>
  o("bookViews", null, o("workbookView", null, null, 0)) + // <sheets/>
  o("sheets", null, t.map(function(s, l) {
    var a = s.sheetId, c = s.sheetName;
    return o("sheet", {
      "r:id": "rId".concat(a),
      sheetId: a,
      name: c
    }, null, l);
  }).join("")) + // <definedNames/>
  o("definedNames") + // <calcPr/>
  o("calcPr") + // Apply any plugins that insert additional content to this XML.
  q("xl/workbook.xml", r, n) + "</workbook>";
  return i = G(i, "xl/workbook.xml", r, n), i;
}
var qn = {};
function Gn(e) {
  var t = e.sheetIds, r = e.features, n = e.sheetsOptions, o = '<?xml version="1.0" ?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + t.map(function(i) {
    return '<Relationship Id="rId'.concat(i, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet').concat(i, '.xml"/>');
  }).join("") + '<Relationship Id="rId'.concat(t.length + 1, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>') + '<Relationship Id="rId'.concat(t.length + 2, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>') + // Apply any plugins that insert additional content to this XML.
  q("xl/_rels/workbook.xml.rels", r, n) + "</Relationships>";
  return o = G(o, "xl/_rels/workbook.xml.rels", r, n), o;
}
function Yn(e) {
  var t = e.features, r = e.sheetsOptions, n = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId-workbook-1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' + // Apply any plugins that insert additional content to this XML.
  q("_rels/.rels", t, r) + "</Relationships>";
  return n = G(n, "_rels/.rels", t, r), n;
}
function Jn(e) {
  var t = e.sheetIds, r = e.features, n = e.sheetsOptions, o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default ContentType="application/xml" Extension="xml"/><Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/>' + t.map(function(i) {
    return '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet'.concat(i, '.xml"/>');
  }).join("") + t.map(function(i) {
    return Ar(i);
  }).join("") + // Apply any plugins that insert additional content to this XML.
  q("[Content_Types].xml", r, n) + "</Types>";
  return o = G(o, "[Content_Types].xml", r, n), o;
}
function Ar(e) {
  return '<Override ContentType="application/vnd.openxmlformats-officedocument.drawing+xml" PartName="/xl/drawings/drawing'.concat(e, '.xml"/>');
}
function Qn(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, i = Ir + // Apply any plugins that insert additional content to this XML.
  q("xl/drawings/drawing{id}.xml", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + kr;
  return i = G(i, "xl/drawings/drawing{id}.xml", o, n, {
    sheetIndex: t,
    sheetId: r
  }), i;
}
var Ir = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">', kr = "</xdr:wsDr>";
function eo(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + // Apply any plugins that insert additional content to this XML.
  q("xl/drawings/_rels/drawing{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + "</Relationships>";
  return i = G(i, "xl/drawings/_rels/drawing{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }), i;
}
function to(e, t, r) {
  if (!ro(t))
    return "";
  var n = t.showGridLines, o = t.rightToLeft, i = t.zoomScale, s = {
    tabSelected: r === 0 ? 1 : 0,
    // The first sheet is selected by default.
    workbookViewId: 0
  };
  n === !1 && (s.showGridLines = !1), o && (s.rightToLeft = 1), typeof i == "number" && (s.zoomScale = Math.round(i * 100));
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
  var o = r + 1, i = {
    min: o,
    max: o,
    width: n,
    customWidth: 1
  };
  return e("col", i, null, r);
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
function Ae(e) {
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
var io = 70 * 365 + 19, ao = 60 * 60 * 1e3, so = 24 * ao;
function lo(e) {
  return e.getTime() / so + io;
}
function co(e, t) {
  return mo(e) || ho(e, t) || uo(e, t) || fo();
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
function ho(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, i, s, l = [], a = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(a = (n = i.call(r)).done) && (l.push(n.value), l.length !== t); a = !0) ;
    } catch (f) {
      c = !0, o = f;
    } finally {
      try {
        if (!a && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function mo(e) {
  if (Array.isArray(e)) return e;
}
function po(e, t, r, n) {
  var o = t.value, i = t.type, s = t.cellStyleId, l = t.findOrCreateSharedString;
  if (o === null && s === void 0)
    return "";
  var a = {
    r: ue(n, r)
  };
  if (s !== void 0 && (a.s = String(s)), o === null)
    return e("c", a, null, r);
  if (i === Date && s === void 0)
    throw new Error("No `format` was specified for a `Date` value in a cell in row ".concat(n + 1, " column ").concat(r + 1, ". Either specify a `format` for this cell or specify a default global one by passing `dateFormat` option to `writeXlsxFile()` function"));
  var c = vo(i, o, l), f = go(i);
  f && (a.t = f);
  var u = yo(i), d = co(u, 2), m = d[0], b = d[1], p = m + c + b;
  return e("c", a, p, r);
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
      return Ae(t);
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
  var t = e.align, r = e.alignVertical, n = e.textRotation, o = e.indent, i = e.wrap;
  return !!(t || r || typeof n == "number" || o || i);
}
function gt(e) {
  var t = e.borderColor, r = e.borderStyle, n = e.leftBorderColor, o = e.leftBorderStyle, i = e.rightBorderColor, s = e.rightBorderStyle, l = e.topBorderColor, a = e.topBorderStyle, c = e.bottomBorderColor, f = e.bottomBorderStyle;
  return !!(t || r || n || o || i || s || l || a || c || f);
}
function Ze(e) {
  var t = e.backgroundColor, r = e.fillPatternStyle, n = e.fillPatternColor;
  return !!(t || r && n);
}
function vt(e) {
  var t = e.fontFamily, r = e.fontSize, n = e.fontWeight, o = e.fontStyle, i = e.textDecoration, s = e.textColor;
  return !!(t || typeof r == "number" || n || o || i && Object.keys(i).length > 0 || s);
}
function Fr(e, t) {
  var r = e.align, n = e.alignVertical, o = e.textRotation, i = e.indent, s = e.wrap, l = e.fontFamily, a = e.fontSize, c = e.fontWeight, f = e.fontStyle, u = e.textDecoration, d = e.textColor, m = e.backgroundColor, b = e.fillPatternStyle, p = e.fillPatternColor, h = e.borderColor, C = e.borderStyle, E = e.leftBorderColor, A = e.leftBorderStyle, y = e.rightBorderColor, w = e.rightBorderStyle, I = e.topBorderColor, x = e.topBorderStyle, v = e.bottomBorderColor, g = e.bottomBorderStyle;
  if (ft({
    align: r,
    alignVertical: n,
    textRotation: o,
    indent: i,
    wrap: s
  }) || vt({
    fontFamily: l,
    fontSize: a,
    fontWeight: c,
    fontStyle: f,
    textDecoration: u,
    textColor: d
  }) || Ze({
    backgroundColor: m,
    fillPatternStyle: b,
    fillPatternColor: p
  }) || gt({
    borderColor: h,
    borderStyle: C,
    leftBorderColor: E,
    leftBorderStyle: A,
    rightBorderColor: y,
    rightBorderStyle: w,
    topBorderColor: I,
    topBorderStyle: x,
    bottomBorderColor: v,
    bottomBorderStyle: g
  }))
    return wo({
      // alignment
      align: r,
      alignVertical: n,
      textRotation: o,
      indent: i,
      wrap: s,
      // font
      fontFamily: l,
      fontSize: a,
      fontWeight: c,
      fontStyle: f,
      textDecoration: u,
      textColor: d,
      // fill
      backgroundColor: m,
      fillPatternStyle: b,
      fillPatternColor: p,
      // border
      borderColor: h,
      borderStyle: C,
      leftBorderColor: E,
      leftBorderStyle: A,
      rightBorderColor: y,
      rightBorderStyle: w,
      topBorderColor: I,
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
function Br(e) {
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
      Eo(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Rt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Eo(e, t, r) {
  return (t = Ao(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Ao(e) {
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
function ko(e, t) {
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
function Fo(e, t, r, n) {
  for (var o, i = ko(t), s; !(s = i()).done; ) {
    var l = s.value;
    Br(l) && l.height && (o === void 0 || o < l.height) && (o = l.height);
  }
  var a = r, c = t.map(function(u, d) {
    return Bo(e, u, d, a, n);
  }).join(""), f = {
    r: r + 1
  };
  return o && (f.ht = o, f.customHeight = 1), e("row", f, c, r);
}
function Bo(e, t, r, n, o) {
  var i = o.findOrCreateCellStyle, s = o.findOrCreateSharedString, l = o.hasDefaultFont, a = o.dateFormat;
  if (t == null)
    return "";
  var c = Br(t) ? t : {
    value: t
  }, f = Fr(c), u = c.type, d = c.value, m = c.format;
  if (Oo(d) ? d = null : u === void 0 && (u = Do(d), u === void 0 && (u = String, d = String(d))), m) {
    if (u !== Date && u !== Number && u !== String && u !== "Formula")
      throw new Error('`format` "'.concat(m, '" was specified on a cell of type `').concat(u, '`. `format` could only be specified on a cell of type `Date`, `Number`, `String` or `"Formula"`.'));
    if (u === String && m !== "@")
      throw new Error('`format` "'.concat(m, '" was specified on a cell of type `String`. The only supported `format` for a cell of type `String` is "@".'));
  } else
    u === Date && (m = a);
  var b = !!m, p = !!f, h;
  return (l || b || p) && (h = i(Co({
    format: m
  }, f))), po(e, {
    value: d,
    type: u,
    cellStyleId: h,
    findOrCreateSharedString: s
  }, r, n);
}
function Oo(e) {
  return e == null || e === "";
}
function Do(e) {
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
  var n = t.map(function(o, i) {
    return Fo(e, o, i, r);
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
    for (var i = e[o], s = 0; s < i.length; ) {
      var l = i[s];
      if (l) {
        var a = l.rowSpan, c = a === void 0 ? 1 : a, f = typeof l.span == "number" ? l.span : l.columnSpan;
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
function Lo(e, t, r, n, o, i, s) {
  var l = Fr(e[t][r]);
  l && (e = i());
  for (var a = t; a <= t + (o - 1); ) {
    for (var c = r; c <= r + (n - 1); ) {
      var f = e[a][c];
      if (a > t || c > r) {
        if (f != null)
          throw new Error("[write-excel-file] When using `columnSpan` or `rowSpan` parameters, all hidden overlapped cells should be represented by `null`s or `undefined`s. Cell at row ".concat(t + 1, " and column ").concat(r + 1, " is configured with `columnSpan` ").concat(n, " and `rowSpan` ").concat(o, ". Cell at row ").concat(a + 1, " and column ").concat(c + 1, " is neither `null` nor `undefined`: ").concat(JSON.stringify(f)));
        l && (e[a][c] = l);
      }
      c++;
    }
    a++;
  }
}
function Mo(e, t) {
  return _o(e) || No(e, t) || $o(e, t) || Ro();
}
function Ro() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $o(e, t) {
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
function No(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, i, s, l = [], a = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(a = (n = i.call(r)).done) && (l.push(n.value), l.length !== t); a = !0) ;
    } catch (f) {
      c = !0, o = f;
    } finally {
      try {
        if (!a && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function _o(e) {
  if (Array.isArray(e)) return e;
}
function zo(e, t) {
  if (t.length === 0)
    return "";
  var r = t.map(function(n, o) {
    var i = Mo(n, 2), s = i[0], l = i[1], a = ue(s[0], s[1]) + ":" + ue(l[0], l[1]);
    return e("mergeCell", {
      ref: a
    }, null, o);
  }).join("");
  return e("mergeCells", {
    count: t.length
  }, r);
}
function Vo(e, t) {
  var r = t.orientation;
  if (r) {
    var n = 0.7, o = 0.7, i = 0.75, s = 0.75, l = 0.3, a = 0.3;
    return e("pageMargins", {
      left: n,
      right: o,
      top: i,
      bottom: s,
      header: l,
      footer: a
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
      orientation: _(r)
    });
  }
  return "";
}
function Or(e) {
  return e("drawing", {
    "r:id": "rId-drawing-1"
  });
}
function Ho(e, t) {
  var r = e.sheetData, n = e.sheetOptions, o = e.sheetIndex, i = e.sheetId, s = e.hasDefaultFont, l = e.findOrCreateCellStyle, a = e.findOrCreateSharedString, c = n.columns, f = n.dateFormat, u = n.orientation, d = n.showGridLines, m = n.rightToLeft, b = n.zoomScale, p = jo(r), h = p.sheetData, C = p.mergedCells, E = {
    sheetIndex: o,
    sheetId: i
  }, A = function(I, x, v, g) {
    return Er("xl/worksheets/sheet{id}.xml", I, x, v, g, E, n, t);
  }, y = '<?xml version="1.0" ?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' + // The order of elements is dictated by the XLSX spec.
  //
  // `<sheetViews/>`
  to(A, {
    showGridLines: d,
    rightToLeft: m,
    zoomScale: b
  }, o) + // `<cols/>`
  oo(A, c) + // `<sheetData/>`
  Po(A, h, {
    findOrCreateCellStyle: l,
    findOrCreateSharedString: a,
    hasDefaultFont: s,
    dateFormat: f
  }) + // `<mergeCells/>`
  zo(A, C) + // `<pageMargins/>`
  Vo(A, {
    orientation: u
  }) + // `<pageSetup/>`
  Uo(A, {
    orientation: u
  }) + // `<drawing/>`
  Or(A) + // Apply any plugins that insert additional content to this XML.
  q("xl/worksheets/sheet{id}.xml", t, n, {
    sheetIndex: o,
    sheetId: i
  }) + "</worksheet>";
  return y = G(y, "xl/worksheets/sheet{id}.xml", t, n, {
    sheetIndex: o,
    sheetId: i
  }), y;
}
function Xo(e) {
  var t = e.sheetIndex, r = e.sheetId, n = e.sheetOptions, o = e.features, i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + // Each sheet has at most one "drawing", so a globally-unique drawing ID is assumed to be the sheet ID.
  Dr(r) + // Apply any plugins that insert additional content to this XML.
  q("xl/worksheets/_rels/sheet{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }) + "</Relationships>";
  return i = G(i, "xl/worksheets/_rels/sheet{id}.xml.rels", o, n, {
    sheetIndex: t,
    sheetId: r
  }), i;
}
function Dr(e) {
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
    if (typeof e == "string") return _t(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? _t(e, t) : void 0;
  }
}
function _t(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Ko(e) {
  var t = '<?xml version="1.0"?>';
  t += '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  for (var r = Zo(e), n; !(n = r()).done; ) {
    var o = n.value, i = o.trim().length === o.length ? "" : ' xml:space="preserve"';
    t += "<si><t".concat(i, ">"), t += Ae(o), t += "</t></si>";
  }
  return t += "</sst>", t;
}
function Ve(e) {
  if (e[0] !== "#")
    throw new Error('Color "'.concat(e, '" must start with a "#"'));
  return "FF".concat(e.slice(1).toUpperCase());
}
function Pr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = t.conditionalFormatting, n = e.backgroundColor, o = e.fillPatternStyle, i = e.fillPatternColor, s = !o || o === "solid";
  if (!Ze(e))
    return '<fill><patternFill patternType="none"/></fill>';
  var l = "<fill>";
  return l += '<patternFill patternType="'.concat(s ? "solid" : o, '">'), l += '<fgColor rgb="'.concat(_(Ve(s ? n : i)), '"/>'), l += "<bgColor ".concat(s && !r ? 'indexed="64"' : 'rgb="' + _(Ve(n)) + '"', "/>"), l += "</patternFill>", l += "</fill>", l;
}
function jr(e) {
  var t = e.borderColor, r = e.borderStyle, n = e.leftBorderColor, o = e.leftBorderStyle, i = e.rightBorderColor, s = e.rightBorderStyle, l = e.topBorderColor, a = e.topBorderStyle, c = e.bottomBorderColor, f = e.bottomBorderStyle, u = {
    style: o || r,
    color: n || t
  }, d = {
    style: s || r,
    color: i || t
  }, m = {
    style: a || r,
    color: l || t
  }, b = {
    style: f || r,
    color: c || t
  }, p = "<border>";
  return p += Be("left", u), p += Be("right", d), p += Be("top", m), p += Be("bottom", b), p += "<diagonal/>", p += "</border>", p;
}
function Be(e, t) {
  var r = t.style, n = t.color;
  n && !r && (r = "thin");
  var o = !!n;
  return "<".concat(e) + (r ? ' style="'.concat(_(r), '"') : "") + (o ? ">" : "/>") + (n ? '<color rgb="'.concat(_(Ve(n)), '"/>') : "") + (o ? "</".concat(e, ">") : "");
}
function Lr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  t.isDefaultGenericFont;
  var r = e.fontFamily, n = e.fontSize, o = e.fontWeight, i = e.fontStyle, s = e.textDecoration, l = e.textColor, a = "<font>";
  return r && (a += '<name val="'.concat(_(r), '"/>')), typeof n == "number" && (a += '<sz val="'.concat(n, '"/>')), a += '<family val="2"/>', r || typeof n == "number" || (a += '<scheme val="minor"/>'), o === "bold" && (a += "<b/>"), i === "italic" && (a += "<i/>"), s && (s.strikethrough && (a += "<strike/>"), s.underline ? a += "<u/>" : s.doubleUnderline && (a += '<u val="double"/>')), l ? a += '<color rgb="'.concat(_(Ve(l)), '"/>') : a += '<color theme="1"/>', a += "</font>", a;
}
function qo(e) {
  var t = e.align, r = e.alignVertical, n = e.textRotation, o = e.indent, i = e.wrap;
  return "<alignment" + (t ? ' horizontal="'.concat(_(t), '"') : "") + (r ? ' vertical="'.concat(_(r), '"') : "") + (n ? ' textRotation="'.concat(Yo(Go(n)), '"') : "") + (o ? ' indent="'.concat(_(String(o)), '"') : "") + (i ? ' wrapText="1"' : "") + "/>";
}
function Go(e) {
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
function zt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zt(Object(r), !0).forEach(function(n) {
      Jo(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : zt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Jo(e, t, r) {
  return (t = Qo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Qo(e) {
  var t = ei(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function ei(e, t) {
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
function ti(e) {
  var t = [], r = {}, n = [], o = {}, i = [], s = {}, l = [], a = {}, c = [], f = {}, u = i.length;
  s[Q(e)] = u, i.push(e || {});
  var d = {};
  a[Q(d)] = l.length, l.push(d);
  var m = {};
  f[Q(m)] = c.length, c.push(m);
  var b = {
    gray125: !0
  };
  l.push(b);
  function p(h) {
    var C = h.format, E = h.align, A = h.alignVertical, y = h.textRotation, w = h.indent, I = h.wrap, x = h.fontFamily, v = h.fontSize, g = h.fontWeight, F = h.fontStyle, O = h.textDecoration, P = h.textColor, X = h.backgroundColor, L = h.fillPatternStyle, M = h.fillPatternColor, $ = h.borderColor, B = h.borderStyle, R = h.leftBorderColor, W = h.leftBorderStyle, he = h.rightBorderColor, V = h.rightBorderStyle, te = h.topBorderColor, Y = h.topBorderStyle, U = h.bottomBorderColor, D = h.bottomBorderStyle, H = {
      fontFamily: x,
      fontSize: v,
      fontWeight: g,
      fontStyle: F,
      textDecoration: O,
      textColor: P
    }, me = {
      backgroundColor: X,
      fillPatternStyle: L,
      fillPatternColor: M
    }, re = {
      borderColor: $,
      borderStyle: B,
      leftBorderColor: R,
      leftBorderStyle: W,
      rightBorderColor: he,
      rightBorderStyle: V,
      topBorderColor: te,
      topBorderStyle: Y,
      bottomBorderColor: U,
      bottomBorderStyle: D
    }, We = {
      align: E,
      alignVertical: A,
      textRotation: y,
      indent: w,
      wrap: I
    }, pe = Q(C), ge = Q(H), ve = Q(me), le = Q(re), ne = Q(h), Qr = function() {
      var be;
      C && (be = r[pe], be === void 0 && (be = Mr + t.length, r[pe] = be, t.push(C)));
      var ce;
      vt(H) ? (ce = s[ge], ce === void 0 && (ce = i.length, s[ge] = ce, i.push(Vt(Vt({}, H), {}, {
        fontSize: H.fontSize || e && e.fontSize,
        fontFamily: H.fontFamily || e && e.fontFamily
      })))) : e && (ce = u);
      var ye;
      Ze(me) && (ye = a[ve], ye === void 0 && (ye = l.length, a[ve] = ye, l.push({
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
        fonts: i,
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
function Oe(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ri(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ri(e, t) {
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
function ni(e, t, r) {
  var n = e.formats, o = e.styles, i = e.fonts, s = e.fills, l = e.borders, a = '<?xml version="1.0" ?>';
  if (a += '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">', n.length > 0) {
    a += '<numFmts count="'.concat(n.length, '">');
    for (var c = 0; c < n.length; c++)
      a += '<numFmt numFmtId="'.concat(Mr + c, '" formatCode="').concat(_(n[c]), '"/>');
    a += "</numFmts>";
  }
  a += '<fonts count="'.concat(i.length, '">');
  for (var f = Oe(i), u; !(u = f()).done; ) {
    var d = u.value;
    a += Lr(d);
  }
  a += "</fonts>", a += '<fills count="'.concat(s.length, '">');
  for (var m = Oe(s), b; !(b = m()).done; ) {
    var p = b.value;
    p.gray125 ? (a += "<fill>", a += '<patternFill patternType="gray125"/>', a += "</fill>") : a += Pr(p);
  }
  a += "</fills>", a += '<borders count="'.concat(l.length, '">');
  for (var h = Oe(l), C; !(C = h()).done; ) {
    var E = C.value;
    a += jr(E);
  }
  a += "</borders>", a += '<cellXfs count="'.concat(o.length, '">');
  for (var A = Oe(o), y; !(y = A()).done; ) {
    var w = y.value, I = w.fontId, x = w.fillId, v = w.borderId, g = w.alignment, F = w.formatId;
    a += "<xf " + [
      F === void 0 ? void 0 : 'numFmtId="'.concat(F, '" applyNumberFormat="1"'),
      I === void 0 ? void 0 : 'fontId="'.concat(I, '" applyFont="1"'),
      x === void 0 ? void 0 : 'fillId="'.concat(x, '" applyFill="1"'),
      v === void 0 ? void 0 : 'borderId="'.concat(v, '" applyBorder="1"'),
      ft(g) ? 'applyAlignment="1"' : void 0
      // 'xfId="0"'
    ].filter(function(O) {
      return O;
    }).join(" ") + ">" + // Possible horizontal alignment values:
    //  left, center, right, fill, justify, center_across, distributed.
    // Possible vertical alignment values:
    //  top, vcenter, bottom, vjustify, vdistributed.
    // https://xlsxwriter.readthedocs.io/format.html#set_align
    (ft(g) ? qo(g) : "") + "</xf>";
  }
  return a += "</cellXfs>", a += q("xl/styles.xml", r, t), a += "</styleSheet>", a = G(a, "xl/styles.xml", r, t), a;
}
function Rr(e) {
  for (var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = t.tagName, n = t.stopAfterFirstMatch, o = new RegExp($r(r), n ? void 0 : "g"), i = [], s; (s = o.exec(e)) !== null; ) {
    for (var l = s[0], a = r || s[1], c = {}, f = new RegExp('\\s+([^\\s=>]+)(?:="([^\\s=>]+)")', "g"), u = void 0; (u = f.exec(l)) !== null; )
      c[u[1]] = u[2];
    var d = {
      tagName: a,
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
      var m = oi(e, d.openingTagEndIndex + 1, a);
      if (!m)
        throw new Error("Invalid XML: opening tag was found but closing tag was not: </".concat(a, ">"));
      d.closingTagStartIndex = m[0], d.closingTagEndIndex = m[1];
    }
    if (i.push(d), n)
      break;
    d.selfClosingTag ? o.lastIndex = d.openingTagEndIndex + 1 : o.lastIndex = d.closingTagEndIndex + 1;
  }
  return i;
}
function oi(e, t, r) {
  var n = new RegExp("<(/)?" + r + "(?:\\s+[^>]+|/)?>", "g");
  n.lastIndex = t;
  for (var o = 0, i; (i = n.exec(e)) !== null; ) {
    var s = i[0], l = i[1];
    if (l)
      if (o > 0)
        o--;
      else
        return [i.index, i.index + s.length - 1];
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
function Nr(e, t, r) {
  return r ? t.selfClosingTag ? e.slice(0, t.openingTagEndIndex - 1) + ">" + r + "</" + t.tagName + ">" + e.slice(t.openingTagEndIndex + 1) : e.slice(0, t.openingTagEndIndex + 1) + r + e.slice(t.closingTagStartIndex) : t.selfClosingTag ? e : e.slice(0, t.openingTagEndIndex) + "/>" + e.slice(t.closingTagEndIndex + 1);
}
function Le(e, t, r) {
  return t.selfClosingTag ? Nr(e, t, r) : e.slice(0, t.closingTagStartIndex) + r + e.slice(t.closingTagStartIndex);
}
function _r(e, t) {
  return t.selfClosingTag ? "" : e.substring(t.openingTagEndIndex + 1, t.closingTagStartIndex);
}
function zr(e, t) {
  var r = t.openingTagEndIndex + 1;
  e.openingTagStartIndex += r, e.openingTagEndIndex += r, e.selfClosingTag || (e.closingTagStartIndex += r, e.closingTagEndIndex += r);
}
function ii(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ai(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ai(e, t) {
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
  for (var r = Rr(_r(e, t)), n = ii(r), o; !(o = n()).done; ) {
    var i = o.value;
    zr(i, t);
  }
  return r;
}
function Vr(e, t, r) {
  return t.selfClosingTag ? Nr(e, t, r) : e.slice(0, t.openingTagEndIndex + 1) + r + e.slice(t.openingTagEndIndex + 1);
}
function Zt(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = si(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function si(e, t) {
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
  for (var n = arguments.length, o = new Array(n > 3 ? n - 3 : 0), i = 3; i < n; i++)
    o[i - 3] = arguments[i];
  if (o.length === 0)
    throw new Error("At least one parent element tag name is required");
  o = o.slice().reverse();
  for (var s, l = function() {
    var y = c.value;
    if (s ? s = Xt(e, s).find(function(w) {
      return w.tagName === y;
    }) : s = oe(e, y), !s)
      throw new Error("Element not found: <".concat(y, ">"));
  }, a = Zt(o), c; !(c = a()).done; )
    l();
  var f = t.match(li);
  if (!f)
    throw new Error("Couldn't extract tag name from markup: ".concat(t));
  var u = f[1];
  if (!r || r.length < 2)
    return Le(e, s, t);
  var d = Xt(e, s);
  if (d.length === 0)
    return Le(e, s, t);
  var m = r.indexOf(u);
  if (m < 0)
    return Le(e, s, t);
  for (var b = r.slice(0, m).reverse(), p = function() {
    var y = E.value, w = d.find(function(I) {
      return I.tagName === y;
    });
    if (w)
      return {
        v: e.slice(0, w.selfClosingTag ? w.openingTagEndIndex + 1 : w.closingTagEndIndex + 1) + t + e.slice(w.selfClosingTag ? w.openingTagEndIndex + 1 : w.closingTagEndIndex + 1)
      };
  }, h, C = Zt(b), E; !(E = C()).done; )
    if (h = p(), h) return h.v;
  return Vr(e, s, t);
}
var li = new RegExp($r());
const ci = {
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
  var t = ci[e];
  if (t) {
    for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
      n[o - 1] = arguments[o];
    if (n.length === 0)
      throw new Error("At least one parent element tag name is required");
    for (var i = function() {
      var f = a[l], u = t.find(function(d) {
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
    }, s, l = 0, a = n; l < a.length; l++)
      if (s = i(), s) return s.v;
    if (t)
      return t.map(function(c) {
        return Array.isArray(c) ? c[0] : c;
      });
  }
}
function Me(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = fi(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fi(e, t) {
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
const ui = {
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
            var i = di(o);
            return Ur(t, i, Hr("xl/worksheets/sheet{id}.xml", "worksheet"), "worksheet");
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
            return hi(r);
        }
      }
    }
  }
};
function di(e) {
  for (var t = "", r = 0, n = Me(e), o; !(o = n()).done; ) {
    var i = o.value, s = i.cellRange, l = s.from, a = s.to, c = i.condition, f = c.formula, u = c.operator, d = c.value, m = c.value2, b = ue(l.row - 1, l.column - 1) + ":" + ue(a.row - 1, a.column - 1);
    t += '<conditionalFormatting sqref="'.concat(b, '">');
    var p = r + 1, h = i._globalIndex;
    if (f)
      t += '<cfRule type="expression" dxfId="'.concat(h, '" priority="').concat(p, '">'), t += "<formula>".concat(Ae(f), "</formula>"), t += "</cfRule>";
    else if (u)
      t += '<cfRule type="cellIs" operator="'.concat(Gt(u), '" dxfId="').concat(h, '" priority="').concat(p, '">'), t += "<formula>".concat(Ae(qt(d)), "</formula>"), Gt(u) === "between" && (t += "<formula>".concat(Ae(qt(m)), "</formula>")), t += "</cfRule>";
    else
      throw new Error(`Invalid conditional formatting rule:
`.concat(JSON.stringify(i, null, 2)));
    t += "</conditionalFormatting>", r++;
  }
  return t;
}
function qt(e) {
  return typeof e == "string" ? '"' + e + '"' : String(e);
}
function Gt(e) {
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
function hi(e) {
  for (var t = 0, r = Me(e), n; !(n = r()).done; ) {
    var o = n.value;
    o && (t += o.length);
  }
  var i = "";
  i += '<dxfs count="'.concat(t, '">');
  for (var s = Me(e), l; !(l = s()).done; ) {
    var a = l.value;
    if (a)
      for (var c = Me(a), f; !(f = c()).done; ) {
        var u = f.value, d = u.style, m = d.fontFamily, b = d.fontSize, p = d.fontWeight, h = d.fontStyle, C = d.textDecoration, E = d.textColor, A = d.backgroundColor, y = d.fillPatternStyle, w = d.fillPatternColor, I = d.borderColor, x = d.borderStyle, v = d.leftBorderColor, g = d.leftBorderStyle, F = d.rightBorderColor, O = d.rightBorderStyle, P = d.topBorderColor, X = d.topBorderStyle, L = d.bottomBorderColor, M = d.bottomBorderStyle;
        i += "<dxf>";
        var $ = {
          fontFamily: m,
          fontSize: b,
          fontWeight: p,
          fontStyle: h,
          textDecoration: C,
          textColor: E
        };
        if (vt($)) {
          if (m)
            throw new Error("Conditional formatting can't be used to override font family");
          if (typeof b == "number")
            throw new Error("Conditional formatting can't be used to override font size");
          i += Lr($);
        }
        var B = {
          backgroundColor: A,
          fillPatternStyle: y,
          fillPatternColor: w
        };
        Ze(B) && (i += Pr(B, {
          conditionalFormatting: !0
        }));
        var R = {
          borderColor: I,
          borderStyle: x,
          leftBorderColor: v,
          leftBorderStyle: g,
          rightBorderColor: F,
          rightBorderStyle: O,
          topBorderColor: P,
          topBorderStyle: X,
          bottomBorderColor: L,
          bottomBorderStyle: M
        };
        gt(R) && (i += jr(R)), i += "</dxf>";
      }
  }
  return i += "</dxfs>", i;
}
function Xr(e) {
  if (!e)
    throw new Error("`contentType` is required");
  var t = e.toLowerCase().replace(/.*\//, "");
  if (!t)
    throw new Error("Unsupported `contentType`: " + e);
  return t;
}
function ke(e) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ke(e);
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
  return gi(e) || pi(e) || Zr(e) || mi();
}
function mi() {
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
function pi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gi(e) {
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
function De(e) {
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
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function vi(e) {
  var t = bi(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function bi(e, t) {
  if (ke(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (ke(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
const yi = {
  files: {
    transform: {
      "[Content_Types].xml": {
        insert: function(t) {
          var r = t.map(function(n) {
            return n.images;
          });
          if (r.some(Boolean))
            return xi(r);
        }
      },
      "xl/drawings/drawing{id}.xml": {
        insert: function(t, r) {
          r.sheetIndex, r.sheetId;
          var n = t.images;
          if (n)
            return Si({
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
            return Ci({
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
          return n.map(function(o, i) {
            return o ? o.reduce(function(s, l, a) {
              return De(De({}, s), {}, Wr({}, "xl/media/".concat(Kr(l, {
                sheetIndex: i,
                imageIndex: a
              })), l.content));
            }, {}) : {};
          }).reduce(function(o, i) {
            return De(De({}, o), i);
          }, {});
      }
    }
  }
};
function xi(e) {
  for (var t = e.reduce(function(a, c) {
    return [].concat(Yt(a), Yt(c || []));
  }, []), r = "", n = bt(wi(t)), o; !(o = n()).done; ) {
    var i = o.value, s = i.fileExtension, l = i.contentType;
    r += '<Default Extension="'.concat(s, '" ContentType="').concat(l, '"/>');
  }
  return r;
}
function wi(e) {
  for (var t = [], r = function(l) {
    var a = Xr(l.contentType), c = t.find(function(f) {
      return f.fileExtension === a;
    });
    c || t.push({
      fileExtension: a,
      contentType: l.contentType
    });
  }, n = bt(e), o; !(o = n()).done; ) {
    var i = o.value;
    r(i);
  }
  return t;
}
function Kr(e, t) {
  var r = t.sheetIndex, n = t.imageIndex, o = r + 1, i = n + 1;
  return "sheet".concat(o, "-image").concat(i, ".").concat(Xr(e.contentType));
}
function Si(e) {
  for (var t = e.images, r = "", n = 0, o = function() {
    var a = s.value, c = n + 1, f = function(d) {
      return Ai(d, a.dpi);
    };
    r += "<xdr:oneCellAnchor>", r += "<xdr:from>", r += "<xdr:col>".concat(a.anchor.column - 1, "</xdr:col>"), r += "<xdr:colOff>".concat(typeof a.offsetX == "number" ? f(a.offsetX) : 0, "</xdr:colOff>"), r += "<xdr:row>".concat(a.anchor.row - 1, "</xdr:row>"), r += "<xdr:rowOff>".concat(typeof a.offsetY == "number" ? f(a.offsetY) : 0, "</xdr:rowOff>"), r += "</xdr:from>", r += '<xdr:ext cx="'.concat(f(a.width), '" cy="').concat(f(a.height), '"/>'), r += "<xdr:pic>", r += "<xdr:nvPicPr>", r += '<xdr:cNvPr id="'.concat(c, '" name="').concat(a.title ? _(a.title) : "Picture " + c, '" descr="').concat(a.description ? _(a.description) : "", '"/>'), r += "<xdr:cNvPicPr>", r += '<a:picLocks noChangeAspect="1"/>', r += "</xdr:cNvPicPr>", r += "</xdr:nvPicPr>", r += "<xdr:blipFill>", r += '<a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId-image-'.concat(c, '" cstate="print"/>'), r += "<a:stretch>", r += "<a:fillRect/>", r += "</a:stretch>", r += "</xdr:blipFill>", r += "<xdr:spPr>", r += '<a:prstGeom prst="rect">', r += "<a:avLst/>", r += "</a:prstGeom>", r += "</xdr:spPr>", r += "</xdr:pic>", r += "<xdr:clientData/>", r += "</xdr:oneCellAnchor>", n++;
  }, i = bt(t), s; !(s = i()).done; )
    o();
  return r;
}
function Ci(e) {
  var t = e.images, r = e.sheetIndex;
  return t.map(function(n, o) {
    var i = o + 1;
    return '<Relationship Id="rId-image-'.concat(i, '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/').concat(Kr(n, {
      sheetIndex: r,
      imageIndex: o
    }), '"/>');
  }).join("");
}
var Qt = 96, Ei = 96;
function Ai(e, t) {
  var r = Qt;
  return Math.round(e * 9525 * (Qt / r) * (Ei / t));
}
function Ii(e, t, r) {
  return t.selfClosingTag ? e.slice(0, t.openingTagStartIndex) + r + e.slice(t.openingTagEndIndex + 1) : e.slice(0, t.openingTagStartIndex) + r + e.slice(t.closingTagEndIndex + 1);
}
function ki(e, t, r) {
  var n = oe(_r(e, r), t);
  if (n)
    return zr(n, r), n;
}
const Ti = {
  files: {
    transform: {
      "xl/worksheets/sheet{id}.xml": {
        transform: function(t, r, n) {
          var o = n.sheetIndex, i = n.sheetId;
          if (er(r)) {
            var s = r.stickyRowsCount, l = r.stickyColumnsCount, a = {
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
              var f = ki(t, "pane", c), u = ze("pane", a);
              f ? t = Ii(t, f, u) : t = Le(t, c, u);
            } else {
              var d = oe(t, "sheetViews");
              if (d)
                throw new Error("xl/worksheets/sheet".concat(i, ".xml: <sheetViews/> element exists but it doesn't contain any <sheetView/> elements"));
              var m = {
                tabSelected: o === 0 ? 1 : 0,
                // The first sheet is selected by default.
                workbookViewId: 0
              }, b = _e("sheetViews") + _e("sheetView", m) + ze("pane", a) + ct("sheetView") + ct("sheetViews"), p = oe(t, "worksheet");
              t = Vr(t, p, b);
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
function Fi(e) {
  var t = [];
  return t.push(ui), t.push(yi), t.push(Ti), e && (e.forEach(Oi), t = t.concat(e)), t;
}
var Bi = ["[Content_Types].xml", "_rels/.rels", "xl/styles.xml", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/worksheets/sheet{id}.xml", "xl/worksheets/_rels/sheet{id}.xml.rels", "xl/drawings/drawing{id}.xml", "xl/drawings/_rels/drawing{id}.xml.rels"];
function Oi(e) {
  if (e.files && e.files.transform)
    for (var t = 0, r = Object.keys(e.files.transform); t < r.length; t++) {
      var n = r[t];
      if (Bi.indexOf(n) < 0)
        throw new Error("Unknown file to transform: ".concat(n));
    }
}
function Di(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Pi(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pi(e, t) {
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
  for (var t = Di(e), r; !(r = t()).done; ) {
    var n = r.value;
    if (Array.isArray(n))
      return;
    throw new Error("Expected each sheet data row to be an array");
  }
}
function ji() {
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
var Li = /[\[\]\/\\:*?]+/;
function Mi(e) {
  if (!e)
    throw new Error("Sheet name can't be empty");
  if (e.length > 31)
    throw new Error('Sheet name "'.concat(e, `" can't be longer than 31 characters`));
  if (Li.test(e))
    throw new Error('Sheet name "'.concat(e, '" contains illegal characters: []/\\:*?'));
}
function Ri(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = $i(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $i(e, t) {
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
function Ni(e, t, r) {
  for (var n = ji(), o = n.getSharedStrings, i = n.findOrCreateSharedString, s = _i(r), l = ti(s), a = l.getCellStyles, c = l.findOrCreateCellStyle, f = t.map(function(h) {
    return h.sheet;
  }), u = Ri(f), d; !(d = u()).done; ) {
    var m = d.value;
    Mi(m);
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
      findOrCreateSharedString: i
    }), p++;
  return {
    sheets: f.map(function(h, C) {
      var E = C;
      return {
        sheetId: or(E),
        sheetName: h,
        sheetXmlParameters: b[E]
      };
    }),
    getSharedStrings: o,
    getCellStyles: a
  };
}
function or(e) {
  return String(e + 1);
}
function _i(e) {
  var t = e.fontFamily, r = e.fontSize;
  if (t || typeof r == "number")
    return {
      fontFamily: t,
      fontSize: r
    };
}
function zi(e, t) {
  var r;
  return t.some(function(n) {
    return n.header;
  }) && (r = t.map(function(n) {
    var o = n.header;
    return o || null;
  })), (r ? [r] : []).concat(e.map(function(n, o) {
    return t.map(function(i) {
      var s = i.cell;
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
function ir(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function ar(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ir(Object(r), !0).forEach(function(n) {
      Vi(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ir(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Vi(e, t, r) {
  return (t = Ui(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Ui(e) {
  var t = Hi(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function Hi(e, t) {
  if (Te(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Te(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Xi(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = Zi(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zi(e, t) {
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
function Wi(e, t, r) {
  for (var n = r.read, o = {}, i = Xi(e), s; !(s = i()).done; ) {
    var l = s.value;
    if (l.files && l.files.write && l.files.write.files) {
      var a = l.files.write.files(t, {
        read: n
      });
      a && (o = ar(ar({}, o), a));
    }
  }
  return o;
}
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
var Ki = ["data"];
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
      qi(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : lr(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function qi(e, t, r) {
  return (t = Gi(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Gi(e) {
  var t = Yi(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function Yi(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Fe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ji(e, t) {
  if (e == null) return {};
  var r, n, o = Qi(e, t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (n = 0; n < i.length; n++) r = i[n], t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (o[r] = e[r]);
  }
  return o;
}
function Qi(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e) if ({}.hasOwnProperty.call(e, n)) {
    if (t.indexOf(n) !== -1) continue;
    r[n] = e[n];
  }
  return r;
}
function qr(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r) return (r = r.call(e)).next.bind(r);
  if (Array.isArray(e) || (r = ea(e)) || t) {
    r && (e = r);
    var n = 0;
    return function() {
      return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
    };
  }
  throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ea(e, t) {
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
function ta(e, t, r) {
  var n = Gr(e, t), o = n.sheets, i = n.options, s = o.map(function(x) {
    return x.data;
  }), l = o.map(function(x) {
    return x.options;
  });
  l = aa(l), l = sa(l);
  var a = Fi(i.features), c = {}, f = function(v) {
    return c[v];
  }, u = function(v) {
    for (var g = 0, F = Object.keys(v); g < F.length; g++) {
      var O = F[g];
      oa(O), ia(O, v[O]), c[O] = v[O];
    }
  }, d = Ni(s, l, i), m = d.sheets, b = d.getSharedStrings, p = d.getCellStyles;
  c["[Content_Types].xml"] = Jn({
    sheetIds: m.map(function(x) {
      return x.sheetId;
    }),
    features: a,
    sheetsOptions: l
  }), c["_rels/.rels"] = Yn({
    features: a,
    sheetsOptions: l
  }), c["xl/_rels/workbook.xml.rels"] = Gn({
    sheetIds: m.map(function(x) {
      return x.sheetId;
    }),
    features: a,
    sheetsOptions: l
  }), c["xl/workbook.xml"] = Kn({
    sheetIdsAndNames: m.map(function(x) {
      var v = x.sheetId, g = x.sheetName;
      return {
        sheetId: v,
        sheetName: g
      };
    }),
    features: a,
    sheetsOptions: l
  });
  for (var h = 0, C = qr(m), E; !(E = C()).done; ) {
    var A = E.value, y = A.sheetId, w = A.sheetXmlParameters, I = l[h];
    c["xl/worksheets/sheet".concat(y, ".xml")] = Ho(w, a), c["xl/worksheets/_rels/sheet".concat(y, ".xml.rels")] = Xo({
      sheetIndex: h,
      sheetId: y,
      sheetOptions: I,
      features: a
    }), c["xl/drawings/drawing".concat(y, ".xml")] = Qn({
      sheetIndex: h,
      sheetId: y,
      sheetOptions: I,
      features: a
    }), c["xl/drawings/_rels/drawing".concat(y, ".xml.rels")] = eo({
      sheetIndex: h,
      sheetId: y,
      sheetOptions: I,
      features: a
    }), h++;
  }
  return u(Wi(a, l, {
    read: f
  })), c["xl/styles.xml"] = ni(p(), l, a), c["xl/sharedStrings.xml"] = Ko(b()), ra(c, m), c;
}
function ra(e, t) {
  for (var r = qr(t), n; !(n = r()).done; ) {
    var o = n.value.sheetId;
    if (e["xl/drawings/drawing".concat(o, ".xml")] === Ir + kr) {
      if (delete e["xl/drawings/drawing".concat(o, ".xml")], delete e["xl/drawings/_rels/drawing".concat(o, ".xml.rels")], !Ye(e, "xl/worksheets/sheet".concat(o, ".xml"), Or(ze)))
        throw new Error(na);
      Ye(e, "xl/worksheets/_rels/sheet".concat(o, ".xml.rels"), Dr(o)), Ye(e, "[Content_Types].xml", Ar(o));
    }
  }
}
var na = "Couldn't remove unused drawings";
function Ye(e, t, r) {
  if (!e[t])
    throw new Error("File not found: ".concat(t));
  if (e[t].indexOf(r) < 0)
    throw new Error('Substring "'.concat(r, '" not found in "').concat(t, '"'));
  var n = e[t], o = n.replace(r, "");
  return e[t] = o, n !== o;
}
function oa(e) {
  if (e[0] === "/")
    throw new Error("File path must not start with a slash (/)");
}
function ia(e, t) {
  if (!t)
    throw new Error("File `content` not specified: ".concat(e));
}
function Gr(e, t, r) {
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
      return je(t) && Array.isArray(t.columns) ? Gr(zi(e, t.columns), t) : {
        sheets: e.map(function(n) {
          var o = n.data, i = Ji(n, Ki);
          if (!o)
            throw new Error("`data` property is required for each sheet");
          return rr(o), {
            data: o,
            options: i || {}
          };
        }),
        options: t || {}
      };
    } else
      throw new Error("Invalid first argument: must be either sheet data — an array of arrays — or an array of sheet objects");
  else
    throw new Error("Invalid first argument: must be an array");
}
function aa(e) {
  return e.map(function(t, r) {
    return fe(fe({}, t), {}, {
      sheet: t.sheet || "Sheet".concat(r + 1)
    });
  });
}
function sa(e) {
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
function la(e, t, r) {
  return {
    toBlob: function() {
      return ua(e, t, r, vn);
    }
  };
}
function ca(e, t, r, n, o, i) {
  var s = ta(e, t);
  return Ln(s, n).then(function(l) {
    var a = o(l);
    return a.then(function(c) {
      return fa(c);
    });
  });
}
function fa(e) {
  return new Blob([e], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
function ua(e, t, r, n) {
  return ca(e, t, r, n, jn);
}
const da = (e) => /^\d+$/.test(e) ? `https://www.facebook.com/profile.php?id=${e}` : "", Ue = [
  { header: "Profile Id", width: 18, value: (e) => e.profileId },
  { header: "Full Name", width: 28, value: (e) => e.fullName },
  { header: "Profile Link", width: 42, value: (e) => e.profileLink, link: !0 },
  { header: "Profile Link (Id)", width: 54, value: (e) => da(e.profileId), link: !0 },
  { header: "Bio", width: 40, value: (e) => e.bio },
  { header: "ImageSrc", width: 24, value: (e) => e.imageSrc },
  { header: "GroupId", width: 18, value: (e) => e.groupId },
  { header: "Group Joining Text", width: 28, value: (e) => e.groupJoiningText },
  { header: "Profile Type", width: 12, value: (e) => e.profileType }
];
function ha(e, t) {
  const r = URL.createObjectURL(e), n = document.createElement("a");
  n.href = r, n.download = t, document.body.appendChild(n), n.click(), n.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
const ma = (e) => /^[=+\-@\t\r]/.test(e) ? `'${e}` : e;
function pa(e) {
  const t = (n) => {
    const o = ma(n ?? "");
    return /[",\r\n]/.test(o) ? `"${o.replace(/"/g, '""')}"` : o;
  }, r = e.map((n) => n.map(t).join(",")).join(`\r
`);
  return new Blob(["\uFEFF" + r + `\r
`], { type: "text/csv;charset=utf-8" });
}
const ga = (e) => /^https:\/\/(www|web|m)\.facebook\.com\/[^"]*$/.test(e) && e.length <= 255;
async function va(e, t) {
  const [r, ...n] = e, o = r.map((l) => ({
    value: l,
    fontWeight: "bold",
    backgroundColor: "#E8F5EF",
    bottomBorderStyle: "thin",
    bottomBorderColor: "#9CCDB8"
  })), i = n.map((l) => l.map((a, c) => {
    var f;
    return (f = Ue[c]) != null && f.link && a && ga(a) ? {
      type: "Formula",
      // SpreadsheetML stores formulas without the leading "=".
      value: `HYPERLINK("${a}","${a}")`,
      textColor: "#0563C1",
      textDecoration: { underline: !0 }
    } : { type: String, value: a ?? "" };
  })), s = [o, ...i];
  return la(s, {
    sheet: t,
    columns: Ue.map((l) => ({ width: l.width })),
    stickyRowsCount: 1
  }).toBlob();
}
const ba = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M164.38,181.1a52,52,0,1,0-72.76,0,75.89,75.89,0,0,0-30,28.89,12,12,0,0,0,20.78,12,53,53,0,0,1,91.22,0,12,12,0,1,0,20.78-12A75.89,75.89,0,0,0,164.38,181.1ZM100,144a28,28,0,1,1,28,28A28,28,0,0,1,100,144Zm147.21,9.59a12,12,0,0,1-16.81-2.39c-8.33-11.09-19.85-19.59-29.33-21.64a12,12,0,0,1-1.82-22.91,20,20,0,1,0-24.78-28.3,12,12,0,1,1-21-11.6,44,44,0,1,1,73.28,48.35,92.18,92.18,0,0,1,22.85,21.69A12,12,0,0,1,247.21,153.59Zm-192.28-24c-9.48,2.05-21,10.55-29.33,21.65A12,12,0,0,1,6.41,136.79,92.37,92.37,0,0,1,29.26,115.1a44,44,0,1,1,73.28-48.35,12,12,0,1,1-21,11.6,20,20,0,1,0-24.78,28.3,12,12,0,0,1-1.82,22.91Z"/></svg>', ya = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M160,208a12,12,0,0,1-12,12H120a12,12,0,0,1-12-12V152a12,12,0,0,1,24,0v44h16A12,12,0,0,1,160,208ZM91,142.22A12,12,0,0,0,74.24,145L64,159.34,53.77,145a12,12,0,1,0-19.53,14l15,21-15,21A12,12,0,1,0,53.77,215L64,200.62,74.24,215A12,12,0,0,0,93.77,201l-15-21,15-21A12,12,0,0,0,91,142.22Zm122.53,32.05c-5.12-3.45-11.32-5.24-16.79-6.82a79.69,79.69,0,0,1-7.92-2.59c2.45-1.18,9.71-1.3,16.07.33A12,12,0,0,0,211,142a69,69,0,0,0-12-1.86c-9.93-.66-18,1.08-24.1,5.17a24.45,24.45,0,0,0-10.69,17.76c-1.1,8.74,2.49,16.27,10.11,21.19,4.78,3.09,10.36,4.7,15.75,6.26,3,.89,7.94,2.3,9.88,3.53a2.48,2.48,0,0,1-.21.71c-1.37,1.55-9.58,1.79-16.39-.06a12,12,0,1,0-6.46,23.11A63.75,63.75,0,0,0,193.1,220c6.46,0,13.73-1.17,19.73-5.15a24.73,24.73,0,0,0,10.95-18C225,187.53,221.33,179.53,213.51,174.27ZM36,108V40A20,20,0,0,1,56,20h96a12,12,0,0,1,8.49,3.51l56,56A12,12,0,0,1,220,88v20a12,12,0,1,1-24,0v-4H148a12,12,0,0,1-12-12V44H60v64a12,12,0,1,1-24,0ZM160,80h23L160,57Z"/></svg>', xa = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M48,180c0,8.67,5.49,16,12,16a10.27,10.27,0,0,0,7.33-3.43,12,12,0,1,1,17.34,16.6A34,34,0,0,1,60,220C40.15,220,24,202,24,180s16.15-40,36-40a34,34,0,0,1,24.67,10.83,12,12,0,1,1-17.34,16.6A10.27,10.27,0,0,0,60,164C53.49,164,48,171.31,48,180Zm97.51-5.71c-5.13-3.45-11.33-5.24-16.8-6.82a79.5,79.5,0,0,1-7.91-2.59c2.45-1.18,9.71-1.3,16.07.33A12,12,0,0,0,143,142a69.24,69.24,0,0,0-12-1.86c-9.93-.66-18,1.08-24.1,5.17a24.45,24.45,0,0,0-10.69,17.76c-1.1,8.74,2.48,16.27,10.11,21.19,4.78,3.09,10.36,4.7,15.75,6.26,3,.89,7.94,2.3,9.88,3.53a2,2,0,0,1-.22.71c-1.36,1.55-9.57,1.79-16.39-.06a12,12,0,0,0-6.45,23.11A63.73,63.73,0,0,0,125.09,220c6.47,0,13.74-1.17,19.74-5.15a24.73,24.73,0,0,0,10.95-18C157,187.53,153.32,179.53,145.51,174.27ZM216,140.68A12,12,0,0,0,200.7,148L192,172.3,183.3,148A12,12,0,1,0,160.7,156l20,56a12,12,0,0,0,22.6,0l20-56A12,12,0,0,0,216,140.68ZM36,108V40A20,20,0,0,1,56,20h96a12,12,0,0,1,8.49,3.51l56,56A12,12,0,0,1,220,88v20a12,12,0,1,1-24,0v-4H148a12,12,0,0,1-12-12V44H60v64a12,12,0,1,1-24,0ZM160,80h23L160,57Z"/></svg>', fr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M47.51,112.49a12,12,0,0,1,17-17L116,147V32a12,12,0,0,1,24,0V147l51.51-51.52a12,12,0,0,1,17,17l-72,72a12,12,0,0,1-17,0ZM216,204H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/></svg>', wa = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M200,28H160a20,20,0,0,0-20,20V208a20,20,0,0,0,20,20h40a20,20,0,0,0,20-20V48A20,20,0,0,0,200,28Zm-4,176H164V52h32ZM96,28H56A20,20,0,0,0,36,48V208a20,20,0,0,0,20,20H96a20,20,0,0,0,20-20V48A20,20,0,0,0,96,28ZM92,204H60V52H92Z"/></svg>', Je = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H180V36A28,28,0,0,0,152,8H104A28,28,0,0,0,76,36V48H40a12,12,0,0,0,0,24h4V208a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V72h4a12,12,0,0,0,0-24ZM100,36a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4V48H100Zm88,168H68V72H188ZM116,104v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm48,0v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Z"/></svg>', Sa = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"/></svg>', Ca = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M220,48V96a12,12,0,0,1-24,0V77l-39.51,39.52a12,12,0,0,1-17-17L179,60H160a12,12,0,0,1,0-24h48A12,12,0,0,1,220,48ZM99.51,139.51,60,179V160a12,12,0,0,0-24,0v48a12,12,0,0,0,12,12H96a12,12,0,0,0,0-24H77l39.52-39.51a12,12,0,0,0-17-17Z"/></svg>', Ea = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M108,60A16,16,0,1,1,92,44,16,16,0,0,1,108,60Zm56,16a16,16,0,1,0-16-16A16,16,0,0,0,164,76ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,180a16,16,0,1,0,16,16A16,16,0,0,0,92,180Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,180Z"/></svg>';
class Aa extends gn {
  constructor() {
    super(...arguments);
    k(this, "name", "fb-scrape-storage");
  }
  get headers() {
    return Ue.map((r) => r.header);
  }
  itemToRow(r) {
    return Ue.map((n) => n.value(r) ?? "");
  }
}
const ie = new Aa();
let Ia = null;
function Yr(e = 5e3) {
  return Ia ?? (Ia = (async () => {
    const t = Date.now();
    for (; ie.persistent && !ie.db && Date.now() - t < e; )
      await new Promise((r) => setTimeout(r, 50));
  })());
}
const ka = `
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
function Ta() {
  if (document.getElementById("fbs-styles")) return;
  const e = document.createElement("style");
  e.id = "fbs-styles", e.textContent = ka, document.head.appendChild(e);
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
    cleared: "All data cleared",
    lockTitle: "License required",
    lockActivate: "Enter license key",
    lockRetry: "Check again",
    lockStates: {
      checking: "Checking your license...",
      needs_activation: "Enter your license key to start collecting group members.",
      expired: "Your license key has expired. Enter a new key to continue.",
      revoked: "Your license key has been revoked. Contact the seller for a new key.",
      network_error: "Connect to the Internet so your license key can be checked again.",
      clock_behind: "Your computer's clock is behind. Fix the date and time, then check again.",
      invalid: "The saved license is not valid on this browser. Enter your key again.",
      unavailable: "The extension is not responding. Reload this page."
    },
    licenseActivated: "License activated"
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
    cleared: "Đã xóa toàn bộ dữ liệu",
    lockTitle: "Cần key bản quyền",
    lockActivate: "Nhập key bản quyền",
    lockRetry: "Kiểm tra lại",
    lockStates: {
      checking: "Đang kiểm tra bản quyền...",
      needs_activation: "Nhập key bản quyền để bắt đầu lấy danh sách thành viên nhóm.",
      expired: "Key bản quyền đã hết hạn. Nhập key mới để dùng tiếp.",
      revoked: "Key bản quyền đã bị thu hồi. Liên hệ người bán để nhận key mới.",
      network_error: "Cần kết nối Internet để xác thực lại key bản quyền.",
      clock_behind: "Ngày giờ trên máy đang bị lùi. Chỉnh lại ngày giờ rồi kiểm tra lại.",
      invalid: "Bản quyền đã lưu không hợp lệ trên trình duyệt này. Hãy nhập lại key.",
      unavailable: "Tiện ích không phản hồi. Hãy tải lại trang."
    },
    licenseActivated: "Đã kích hoạt bản quyền"
  }
};
let S = Jr.en;
const Pe = (e) => e.toLocaleString(S.locale);
function Fa() {
  return (document.documentElement.lang || navigator.language || "").toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Ba() {
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
class Oa {
  constructor() {
    k(this, "panel");
    k(this, "body");
    k(this, "counterEl");
    k(this, "groupCountEl");
    k(this, "hintEl");
    k(this, "dot");
    k(this, "badge");
    k(this, "logEntries");
    k(this, "excelBtn");
    k(this, "csvBtn");
    k(this, "scrollBtn");
    k(this, "minimizeBtn");
    k(this, "resetBtn");
    k(this, "content");
    k(this, "lockEl");
    k(this, "lockText");
    k(this, "lockBtn");
    // Without a license, members are still captured; only viewing and downloading are locked,
    // so whatever was scrolled past can be downloaded right after activating.
    k(this, "locked", !1);
    k(this, "licenseState", "");
    k(this, "lockAction", () => {
    });
    k(this, "isMinimized", !1);
    k(this, "isScrolling", !1);
    k(this, "scrollTimer", null);
    k(this, "lastNewMemberAt", 0);
    k(this, "groups", /* @__PURE__ */ new Set());
    k(this, "pulseTimer", null);
    k(this, "confirmingReset", !1);
    k(this, "confirmTimer", null);
    k(this, "isDragging", !1);
    k(this, "dragOffX", 0);
    k(this, "dragOffY", 0);
    this.build(), this.setupDrag();
  }
  // ── Build DOM ──
  build() {
    var c;
    (c = document.getElementById("fbs-panel")) == null || c.remove(), this.panel = document.createElement("div"), this.panel.id = "fbs-panel", this.panel.className = "fbs-panel", this.panel.setAttribute("role", "region"), this.panel.setAttribute("aria-label", "FB Scraper");
    const t = document.createElement("div");
    t.className = "fbs-header";
    const r = document.createElement("span");
    r.className = "fbs-title", r.textContent = "FB Scraper", this.dot = document.createElement("span"), this.dot.className = "fbs-dot", this.badge = document.createElement("span"), this.badge.className = "fbs-badge", this.badge.textContent = "0", this.minimizeBtn = document.createElement("button"), this.minimizeBtn.type = "button", this.minimizeBtn.className = "fbs-icon-btn", this.minimizeBtn.addEventListener("click", (f) => {
      f.stopPropagation(), this.toggleMinimize();
    }), t.append(
      Re(Ea, "fbs-grip"),
      Re(ba, "fbs-logo"),
      r,
      this.dot,
      this.badge,
      this.minimizeBtn
    ), this.body = document.createElement("div"), this.body.className = "fbs-body";
    const n = document.createElement("div");
    n.className = "fbs-stats", this.counterEl = document.createElement("span"), this.counterEl.className = "fbs-counter", this.counterEl.textContent = "0", this.counterEl.setAttribute("aria-live", "polite");
    const o = document.createElement("div");
    o.className = "fbs-counter-label", o.textContent = S.membersLabel, this.groupCountEl = document.createElement("span"), this.groupCountEl.className = "fbs-groups", this.groupCountEl.textContent = S.groups(0), n.append(this.counterEl, o, this.groupCountEl), this.hintEl = document.createElement("div"), this.hintEl.className = "fbs-hint", this.hintEl.textContent = S.hintStart;
    const i = document.createElement("div");
    i.className = "fbs-actions", this.excelBtn = document.createElement("button"), this.excelBtn.type = "button", this.excelBtn.className = "fbs-btn fbs-btn-primary", ee(this.excelBtn, ya, S.downloadExcel), this.excelBtn.addEventListener("click", () => this.download("xlsx")), this.csvBtn = document.createElement("button"), this.csvBtn.type = "button", this.csvBtn.className = "fbs-btn fbs-btn-secondary fbs-btn-csv", ee(this.csvBtn, xa, S.downloadCsv), this.csvBtn.addEventListener("click", () => this.download("csv")), this.scrollBtn = document.createElement("button"), this.scrollBtn.type = "button", this.scrollBtn.className = "fbs-btn fbs-btn-secondary fbs-btn-scroll", ee(this.scrollBtn, fr, S.autoScroll), this.scrollBtn.addEventListener("click", () => this.toggleAutoScroll()), this.resetBtn = document.createElement("button"), this.resetBtn.type = "button", this.resetBtn.className = "fbs-btn fbs-btn-ghost", ee(this.resetBtn, Je, S.reset), this.resetBtn.addEventListener("click", () => this.handleReset()), i.append(this.excelBtn, this.csvBtn, this.scrollBtn, this.resetBtn);
    const s = document.createElement("div");
    s.className = "fbs-log";
    const l = document.createElement("div");
    l.className = "fbs-log-title", l.textContent = S.activity, this.logEntries = document.createElement("div"), this.logEntries.className = "fbs-log-entries", s.append(l, this.logEntries), this.content = document.createElement("div"), this.content.className = "fbs-content", this.content.append(n, this.hintEl, i, s), this.lockEl = document.createElement("div"), this.lockEl.className = "fbs-lock", this.lockEl.hidden = !0;
    const a = document.createElement("div");
    a.className = "fbs-lock-title", a.textContent = S.lockTitle, this.lockText = document.createElement("p"), this.lockText.className = "fbs-lock-text", this.lockText.setAttribute("aria-live", "polite"), this.lockBtn = document.createElement("button"), this.lockBtn.type = "button", this.lockBtn.className = "fbs-btn fbs-btn-primary", this.lockBtn.addEventListener("click", () => this.lockAction()), this.lockEl.append(a, this.lockText, this.lockBtn), this.body.append(this.content, this.lockEl), this.panel.append(t, this.body), this.applyMinimized(), this.setEmpty(!0);
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
      this.addLog(t > 0 ? S.loadedFromCache(Pe(t)) : S.ready);
    });
  }
  setTheme(t) {
    this.panel.dataset.theme !== t && (this.panel.dataset.theme = t);
  }
  setVisible(t) {
    this.panel.style.display = t ? "" : "none", !t && this.isScrolling && this.stopAutoScroll(!1);
  }
  setLicense(t, r) {
    const n = this.locked;
    if (this.locked = !t.active, this.panel.classList.toggle("fbs-locked", this.locked), this.content.hidden = this.locked, this.lockEl.hidden = !this.locked, this.locked) {
      this.isScrolling && this.stopAutoScroll(!1), this.lockText.textContent = S.lockStates[t.state] ?? S.lockStates.needs_activation;
      const o = ["checking", "network_error", "clock_behind", "unavailable"].includes(t.state);
      this.lockBtn.textContent = o ? S.lockRetry : S.lockActivate, this.lockBtn.disabled = t.state === "checking", this.lockAction = o ? r.retry : r.activate;
    } else n && this.licenseState && this.licenseState !== "checking" && this.addLog(S.licenseActivated);
    this.licenseState = t.state;
  }
  async onCapture(t, r) {
    this.lastNewMemberAt = Date.now(), r && this.groups.add(r), this.groupCountEl.textContent = S.groups(this.groups.size), await this.refreshCounter(), this.addLog(S.added(Pe(t))), this.dot.classList.add("fbs-dot-on"), this.hintEl.textContent = S.hintCapturing, this.panel.classList.remove("fbs-pulse"), this.panel.offsetWidth, this.panel.classList.add("fbs-pulse"), this.pulseTimer && clearTimeout(this.pulseTimer), this.pulseTimer = setTimeout(() => {
      this.panel.classList.remove("fbs-pulse"), this.dot.classList.remove("fbs-dot-on"), this.hintEl.textContent = S.hintIdle;
    }, 2500);
  }
  // ── Private ──
  async refreshCounter() {
    const t = await ie.getCount(), r = Pe(t);
    return this.counterEl.textContent = r, this.badge.textContent = r, this.setEmpty(t === 0), t;
  }
  setEmpty(t) {
    this.excelBtn.disabled = t, this.csvBtn.disabled = t, this.confirmingReset || (this.resetBtn.disabled = t);
  }
  addLog(t) {
    var i;
    const r = document.createElement("div");
    r.className = "fbs-log-entry";
    const n = (/* @__PURE__ */ new Date()).toLocaleTimeString(S.locale, {
      hour12: !1,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }), o = document.createElement("span");
    for (o.className = "fbs-log-time", o.textContent = n, r.append(o, document.createTextNode(t)), this.logEntries.prepend(r); this.logEntries.children.length > 50; )
      (i = this.logEntries.lastChild) == null || i.remove();
  }
  toggleMinimize() {
    this.isMinimized = !this.isMinimized, this.applyMinimized();
  }
  applyMinimized() {
    this.body.style.display = this.isMinimized ? "none" : "", this.panel.classList.toggle("fbs-min", this.isMinimized), this.minimizeBtn.replaceChildren(Re(this.isMinimized ? Ca : Sa));
    const t = this.isMinimized ? S.expand : S.minimize;
    this.minimizeBtn.title = t, this.minimizeBtn.setAttribute("aria-label", t), this.minimizeBtn.setAttribute("aria-expanded", String(!this.isMinimized));
  }
  toggleAutoScroll() {
    if (!this.locked) {
      if (this.isScrolling) {
        this.stopAutoScroll(!1);
        return;
      }
      this.isScrolling = !0, this.lastNewMemberAt = Date.now(), ee(this.scrollBtn, wa, S.stopScroll), this.scrollBtn.classList.add("fbs-on"), this.scrollBtn.setAttribute("aria-pressed", "true"), this.scrollTimer = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight), Date.now() - this.lastNewMemberAt > ur && this.stopAutoScroll(!0);
      }, 150), this.addLog(S.scrollStarted);
    }
  }
  stopAutoScroll(t) {
    this.isScrolling = !1, ee(this.scrollBtn, fr, S.autoScroll), this.scrollBtn.classList.remove("fbs-on"), this.scrollBtn.setAttribute("aria-pressed", "false"), this.scrollTimer && (clearInterval(this.scrollTimer), this.scrollTimer = null), t ? (this.addLog(S.autoStopped(ur / 1e3)), this.hintEl.textContent = S.hintDone) : this.addLog(S.scrollStopped);
  }
  async download(t) {
    if (this.locked) return;
    const r = await ie.getCount();
    if (r === 0) return;
    const n = await ie.toCsvData(), o = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    try {
      const i = t === "xlsx" ? await va(n, S.sheetName) : pa(n);
      ha(i, `fb-members-${o}.${t}`), this.addLog(S.downloaded(Pe(r), t === "xlsx" ? "Excel" : "CSV"));
    } catch (i) {
      this.addLog(S.downloadFailed), console.error(i);
    }
  }
  handleReset() {
    if (!this.confirmingReset) {
      this.confirmingReset = !0, ee(this.resetBtn, Je, S.confirmReset), this.resetBtn.classList.add("fbs-confirm"), this.confirmTimer = setTimeout(() => this.cancelReset(), 3e3);
      return;
    }
    this.confirmTimer && clearTimeout(this.confirmTimer), this.cancelReset(), ie.clear().then(() => {
      this.groups.clear(), this.groupCountEl.textContent = S.groups(0), this.refreshCounter(), this.addLog(S.cleared), this.hintEl.textContent = S.hintStart;
    });
  }
  cancelReset() {
    this.confirmingReset = !1, ee(this.resetBtn, Je, S.reset), this.resetBtn.classList.remove("fbs-confirm");
  }
}
let $e;
function Da(e) {
  var i, s, l, a, c, f;
  let t;
  if ((i = e == null ? void 0 : e.data) != null && i.group)
    t = e.data.group;
  else if (((l = (s = e == null ? void 0 : e.data) == null ? void 0 : s.node) == null ? void 0 : l.__typename) === "Group")
    t = e.data.node;
  else
    return;
  let r;
  if ((a = t == null ? void 0 : t.new_members) != null && a.edges)
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
    var w, I, x, v, g;
    const d = u.node.__isEntity === "GroupUserInvite" ? u.node.invitee_profile : u.node;
    if (!d) return;
    const { id: m, name: b, bio_text: p, url: h, profile_picture: C, __isProfile: E } = d, A = ((w = u == null ? void 0 : u.join_status_text) == null ? void 0 : w.text) || ((x = (I = u == null ? void 0 : u.membership) == null ? void 0 : I.join_status_text) == null ? void 0 : x.text), y = (g = (v = d.group_membership) == null ? void 0 : v.associated_group) == null ? void 0 : g.id;
    y && (o = y), n.push([m, {
      profileId: m,
      fullName: b,
      profileLink: h,
      bio: (p == null ? void 0 : p.text) || "",
      imageSrc: (C == null ? void 0 : C.uri) || "",
      groupId: y || "",
      groupJoiningText: A || "",
      profileType: E || ""
    }]);
  }), n.length > 0 && Yr().then(() => ie.addElems(n)).then((u) => {
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
    Da(r);
}
function Pa() {
  const e = "/api/graphql/", t = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener("readystatechange", function() {
      this.responseURL.includes(e) && this.readyState === 4 && dr(this.responseText);
    }, !1), t.apply(this, arguments);
  };
  const r = window.fetch;
  window.fetch = async function(...n) {
    const o = await r.apply(this, n), i = n[0];
    return (i instanceof Request ? i.url : String(i)).includes(e) && o.clone().text().then(dr).catch(() => {
    }), o;
  };
}
const ja = 30 * 60 * 1e3;
function La({ groupPagesOnly: e, license: t }) {
  Pa();
  const r = () => {
    S = Jr[Fa()], Ta();
    const n = new Oa();
    if ($e = n, n.render(), t) {
      let i = !1;
      const s = { activate: () => t.openActivation(), retry: () => void l() };
      async function l() {
        if (!i) {
          i = !0;
          try {
            n.setLicense(await t.check(), s);
          } finally {
            i = !1;
          }
        }
      }
      n.setLicense({ active: !1, state: "checking" }, s), l(), t.onChange(() => void l()), setInterval(() => void l(), ja);
    }
    const o = () => {
      n.setTheme(Ba());
    };
    o(), setInterval(o, 1e3);
  };
  document.body ? r() : document.addEventListener("DOMContentLoaded", r, { once: !0 });
}
La({ groupPagesOnly: !1 });
