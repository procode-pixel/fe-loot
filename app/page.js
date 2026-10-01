"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({ games: [], listings: [] });
  const [q, setQ] = useState("");
  const [me, setMe] = useState(null);
  async function load(query = "") {
    const res = await fetch("/api/listings?q=" + encodeURIComponent(query));
    setData(await res.json());
  }
  useEffect(() => { load(); fetch("/api/auth/me").then(r => r.json()).then(d => setMe(d.user)); }, []);
  return (
    <>
      <header>
        <Link className="brand" href="/">FeLoot</Link>
        <nav>
          <Link href="/orders">طلباتي</Link>
          {me?.role === "admin" && <Link href="/admin">الإدارة</Link>}
          <Link href="/login">{me ? me.name : "تسجيل الدخول"}</Link>
          <Link className="btn" href="/sell">بيع أكونت</Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="pill">معاملات محمية بنظام الإسكرو</div>
          <h1>اشتري وبيع أكونتات الألعاب بدون مخاطرة</h1>
          <p className="muted">فلوسك بتتقفل لحد ما تستلم الأكونت وتأكده. بيانات الدخول مش بتظهر غير بعد حجز الإسكرو.</p>
          <div className="stats">
            <div><b>100%</b><div className="muted">إسكرو</div></div>
            <div><b>{data.listings.length}</b><div className="muted">عرض متاح</div></div>
            <div><b>1-5 د</b><div className="muted">متوسط المراجعة</div></div>
          </div>
          <input placeholder="ابحث عن أكونت" value={q} onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
        </section>
        <h2>تصفح حسب اللعبة</h2>
        <div className="grid">
          {data.games.map((g) => <Link className="card" key={g.id} href={"/?game=" + g.id}>{g.emoji} {g.name}</Link>)}
        </div>
        <h2>العروض</h2>
        <div className="grid">
          {data.listings.map((l) => (
            <Link className="card" key={l.id} href={"/listing/" + l.id}>
              <div className="pill">{l.delivery === "instant" ? "تسليم فوري" : "تسليم يدوي"} {l.featured ? "• مميز" : ""}</div>
              <h3>{l.title}</h3>
              <p className="muted">{l.sellerName} · {l.rating}</p>
              <b>{l.price.toLocaleString("ar-EG")} EGP</b>
              <div className="muted">Protected by FeLoot Escrow</div>
            </Link>
          ))}
        </div>
      </main>
      <footer>FeLoot — فلوسك في الخزنة لحد الاستلام. لا تشارك بيانات الدخول خارج الصفقة.</footer>
    </>
  );
}
