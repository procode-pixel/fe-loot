"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Compare() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("feloot_compare") || "[]");
    fetch("/api/listings").then((r) => r.json()).then((d) => {
      setRows((d.listings || []).filter((l) => ids.includes(l.id)));
    });
  }, []);
  function clearAll() {
    localStorage.removeItem("feloot_compare");
    setRows([]);
  }
  return (
    <main>
      <h1>مقارنة العروض</h1>
      <p className="muted">المقارنة متخزنة في المتصفح فقط، مافيش بيانات تسليم.</p>
      <button className="ghost" onClick={clearAll}>مسح المقارنة</button>
      <div className="grid" style={{ marginTop: 16 }}>
        {rows.map((l) => (
          <article className="card" key={l.id}>
            <div className="pill">{l.game}</div>
            <h3>{l.title}</h3>
            <p>{l.price.toLocaleString("ar-EG")} EGP</p>
            <p className="muted">{l.delivery === "instant" ? "فوري" : "يدوي"} · {l.sellerName} · {l.rating}</p>
            <Link href={"/listing/" + l.id}>فتح العرض</Link>
          </article>
        ))}
        {!rows.length && <p>مفيش عروض في المقارنة.</p>}
      </div>
    </main>
  );
}
