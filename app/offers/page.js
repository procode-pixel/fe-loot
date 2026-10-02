"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  async function load() {
    const res = await fetch("/api/offers");
    const data = await res.json();
    if (!res.ok) setError(data.error || "سجل الدخول.");
    else setOffers(data.offers || []);
  }
  useEffect(() => { load(); }, []);
  async function act(offerId, action) {
    await fetch("/api/offers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ offerId, action }) });
    load();
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link> <Link href="/wallet">المحفظة</Link></header>
      <h1>عروض السعر</h1>
      <p className="muted">المزايدة لا تخصم الرصيد إلا عند الشراء. القبول إشعار اتفاق، والشراء يتم من صفحة العرض بعد شحن المحفظة.</p>
      {error && <p className="warn">{error} <Link href="/login">دخول</Link></p>}
      {offers.map((o) => (
        <article className="card" key={o.id} style={{ marginBottom: 10 }}>
          <b>{o.title}</b>
          <div>{Number(o.amount).toLocaleString("ar-EG")} من {Number(o.price).toLocaleString("ar-EG")} EGP · {o.status}</div>
          <div className="muted">{o.buyerName} → {o.sellerName}</div>
          {o.status === "open" && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => act(o.id, "accept")}>قبول</button>
              <button className="ghost" onClick={() => act(o.id, "reject")}>رفض</button>
              <button className="ghost" onClick={() => act(o.id, "withdraw")}>سحب</button>
            </div>
          )}
          <Link href={"/listing/" + o.listingId}>فتح العرض</Link>
        </article>
      ))}
      {!offers.length && !error && <p>لا توجد مزايدات بعد.</p>}
    </main>
  );
}
