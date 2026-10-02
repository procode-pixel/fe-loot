"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function toggleCompare(id) {
  const ids = JSON.parse(localStorage.getItem("feloot_compare") || "[]");
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-4);
  localStorage.setItem("feloot_compare", JSON.stringify(next));
}

export default function Home() {
  const [data, setData] = useState({ games: [], listings: [] });
  const [q, setQ] = useState("");
  const [me, setMe] = useState(null);
  const [game, setGame] = useState("");
  const [sort, setSort] = useState("featured");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [delivery, setDelivery] = useState("");
  async function load(query = q, gameId = game, nextSort = sort, nextMin = min, nextMax = max, nextDelivery = delivery) {
    const res = await fetch("/api/listings?q=" + encodeURIComponent(query) + "&game=" + encodeURIComponent(gameId) + "&sort=" + encodeURIComponent(nextSort) + "&min=" + encodeURIComponent(nextMin) + "&max=" + encodeURIComponent(nextMax) + "&delivery=" + encodeURIComponent(nextDelivery));
    setData(await res.json());
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("game") || "";
    setGame(initial);
    load("", initial);
    fetch("/api/auth/me").then(r => r.json()).then(d => setMe(d.user));
  }, []);
  return (
    <>
      <header>
        <Link className="brand" href="/">FeLoot</Link>
        <nav>
          <Link href="/games">الألعاب</Link>
          <Link href="/compare">مقارنة</Link>
          <Link href="/recent">شوهد مؤخراً</Link>
          <Link href="/wallet">المحفظة</Link>
          <Link href="/offers">عروض</Link>
          <Link href="/alerts">تنبيهات</Link>
          <Link href="/help">مساعدة</Link>
          <Link href="/support">الدعم</Link>
          <Link href="/status">الحالة</Link>
          <Link href="/dashboard">لوحتي</Link>
          <Link href="/account">حسابي</Link>
          <Link href="/orders">طلباتي</Link>
          {me?.role === "admin" && <Link href="/admin">الإدارة</Link>}
          <Link href="/login">{me ? me.name : "تسجيل الدخول"}</Link>
          <Link className="btn" href="/sell">بيع أكونت</Link>
        </nav>
      </header>
      <main>
        <div className="warn">المعروض حالياً معاينة. العروض الجديدة تنتظر موافقة الإدارة، ومفيش تحويل فلوس حقيقي.</div>
        <section className="hero">
          <div className="pill">معاملات محمية بنظام الإسكرو</div>
          <h1>اشتري وبيع أكونتات الألعاب بدون مخاطرة</h1>
          <p className="muted">فلوسك بتتقفل لحد ما تستلم الأكونت وتأكده. بيانات الدخول مش بتظهر غير بعد حجز الإسكرو.</p>
          <div className="stats">
            <div><b>100%</b><div className="muted">إسكرو</div></div>
            <div><b>{data.listings.length}</b><div className="muted">عرض متاح</div></div>
            <div><b>1-5 د</b><div className="muted">متوسط المراجعة</div></div>
          </div>
          <div className="grid">
            <input placeholder="ابحث عن أكونت" value={q} onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
            <select value={sort} onChange={(e) => { setSort(e.target.value); load(q, game, e.target.value, min, max, delivery); }}>
              <option value="featured">المميز</option>
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: الأقل</option>
              <option value="price_desc">السعر: الأعلى</option>
              <option value="rating">التقييم</option>
            </select>
            <input placeholder="أقل سعر" value={min} onChange={(e) => { setMin(e.target.value); load(q, game, sort, e.target.value, max, delivery); }} />
            <input placeholder="أقصى سعر" value={max} onChange={(e) => { setMax(e.target.value); load(q, game, sort, min, e.target.value, delivery); }} />
            <select value={delivery} onChange={(e) => { setDelivery(e.target.value); load(q, game, sort, min, max, e.target.value); }}>
              <option value="">كل التسليم</option>
              <option value="instant">تسليم فوري</option>
              <option value="manual">تسليم يدوي</option>
            </select>
          </div>
        </section>
        <h2>تصفح حسب اللعبة</h2>
        <div className="grid">
          <button className="card ghost" onClick={() => { setGame(""); load(q, "", sort, min, max, delivery); }}>الكل</button>
          {data.games.map((g) => <Link className="card" key={g.id} href={"/games/" + g.id}>{g.emoji} {g.name} · {g.count || 0}</Link>)}
        </div>
        <h2>العروض</h2>
        <div className="grid">
          {data.listings.length === 0 && <p className="muted">مفيش عروض مطابقة. غيّر اللعبة أو السعر أو امسح البحث.</p>}
          {data.listings.map((l) => (
            <article className="card" key={l.id}>
              <div className="pill">{l.delivery === "instant" ? "تسليم فوري" : "تسليم يدوي"} {l.featured ? "• مميز" : ""}</div>
              <h3>{l.title}</h3>
              <p className="muted">{l.sellerName} · {l.rating}</p>
              <b>{l.price.toLocaleString("ar-EG")} EGP</b>
              <div className="muted">Protected by FeLoot Escrow</div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <Link className="btn" href={"/listing/" + l.id}>التفاصيل</Link>
                <button className="ghost" onClick={() => toggleCompare(l.id)}>قارن</button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <footer>FeLoot — فلوسك في الخزنة لحد الاستلام. لا تشارك بيانات الدخول خارج الصفقة. <Link href="/help">المساعدة</Link> · <Link href="/status">الحالة</Link> · <Link href="/security">الأمان</Link> · <Link href="/changelog">سجل التطوير</Link></footer>
    </>
  );
}
