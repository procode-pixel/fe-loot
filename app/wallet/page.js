"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Wallet() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/orders").then(async (r) => {
      const data = await r.json();
      if (!r.ok) setError(data.error || "سجل الدخول لعرض المحفظة.");
      else setOrders(data.orders || []);
    });
  }, []);
  const held = orders.filter((o) => o.status === "escrow_held" || o.status === "disputed").reduce((s, o) => s + Number(o.price || 0), 0);
  const done = orders.filter((o) => o.status === "released" || o.status === "delivered").reduce((s, o) => s + Number(o.price || 0), 0);
  return (
    <main>
      <h1>محفظة الإسكرو</h1>
      <p className="muted">الأرقام محاسبة داخل الموقع وليست تحويلات بنكية. مفيش خصم فعلي قبل ربط بوابة دفع.</p>
      {error && <p className="warn">{error} <Link href="/login">دخول</Link></p>}
      <div className="stats">
        <div className="card"><b>{held.toLocaleString("ar-EG")} EGP</b><div className="muted">محجوز في الخزنة</div></div>
        <div className="card"><b>{done.toLocaleString("ar-EG")} EGP</b><div className="muted">صفقات مكتملة</div></div>
        <div className="card"><b>{orders.length}</b><div className="muted">طلب</div></div>
      </div>
      <Link className="btn" href="/orders">الطلبات والشات</Link>
    </main>
  );
}
