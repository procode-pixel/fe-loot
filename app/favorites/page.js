"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setItems(d.listings || d.favorites || []);
      })
      .catch(() => setError("تعذر تحميل المفضلة."));
  }, []);
  return (
    <main>
      <h1>المفضلة</h1>
      {error && <p className="warn">{error}</p>}
      {!error && !items.length && <p className="muted">لا توجد عروض محفوظة. سجّل الدخول ثم احفظ عرضاً من صفحته.</p>}
      <div className="grid">
        {items.map((l) => (
          <Link className="card" key={l.id} href={"/listing/" + l.id}>
            <b>{l.title}</b>
            <div>{l.price} EGP</div>
          </Link>
        ))}
      </div>
      <p><Link href="/">العودة</Link></p>
    </main>
  );
}
