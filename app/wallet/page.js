"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Wallet() {
  const [info, setInfo] = useState(null);
  const [amount, setAmount] = useState("1000");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  async function load() {
    const res = await fetch("/api/wallet");
    const data = await res.json();
    if (!res.ok) setError(data.error || "سجل الدخول لعرض المحفظة.");
    else { setInfo(data); setError(""); }
  }
  useEffect(() => { load(); }, []);
  async function topup(e) {
    e.preventDefault();
    const res = await fetch("/api/wallet", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount: Number(amount) }) });
    const data = await res.json();
    setMsg(data.error || ("تم شحن تجريبي. الرصيد " + data.balance));
    load();
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link> <Link href="/offers">عروض السعر</Link></header>
      <h1>محفظة الإسكرو</h1>
      <p className="muted">الأرقام داخل الموقع وليست تحويلات بنكية. الشراء يخصم من الرصيد التجريبي ويحبسه حتى التأكيد أو رد الإدارة.</p>
      {error && <p className="warn">{error} <Link href="/login">دخول</Link></p>}
      {info && (
        <div className="stats">
          <div className="card"><b>{Number(info.balance).toLocaleString("ar-EG")} EGP</b><div className="muted">رصيد متاح</div></div>
          <div className="card"><b>{Number(info.held).toLocaleString("ar-EG")} EGP</b><div className="muted">محجوز في الخزنة</div></div>
        </div>
      )}
      <form className="card" onSubmit={topup}>
        <h2>شحن تجريبي</h2>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn" type="submit">شحن</button>
        {msg && <p>{msg}</p>}
      </form>
      <Link className="btn" href="/orders">الطلبات والشات</Link>
    </main>
  );
}
