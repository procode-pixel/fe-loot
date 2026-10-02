"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Deals() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch("/api/listings?sort=price_asc").then((r) => r.json()).then((d) => {
      setRows((d.listings || []).filter((l) => Number(l.dealPercent) >= 10));
    });
  }, []);
  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>صفقات تحت متوسط اللعبة</h1>
      <p className="muted">النسبة محسوبة من العروض النشطة لنفس اللعبة. مش ضمان سعر سوق خارج الموقع.</p>
      <div className="grid">
        {rows.length === 0 && <p>مفيش صفقة أوفر من المتوسط بـ 10% حالياً.</p>}
        {rows.map((l) => (
          <article className="card" key={l.id}>
            <div className="pill">أوفر {l.dealPercent}% عن متوسط {Number(l.gameMedian || 0).toLocaleString("ar-EG")}</div>
            <h3>{l.title}</h3>
            <b>{Number(l.price).toLocaleString("ar-EG")} EGP</b>
            <div style={{ marginTop: 8 }}><Link className="btn" href={"/listing/" + l.id}>التفاصيل</Link></div>
          </article>
        ))}
      </div>
    </main>
  );
}
