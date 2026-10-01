"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Account() {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ current: "", next: "" });
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user)); }, []);
  async function change(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(data.error || "تم تغيير كلمة المرور.");
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link></header>
      <h1>حسابي</h1>
      {!me && <p>سجل الدخول أولاً. <Link href="/login">دخول</Link></p>}
      {me && (
        <>
          <p>{me.name} · {me.email} · {me.role}</p>
          <form onSubmit={change} className="card">
            <h2>تغيير كلمة المرور</h2>
            <input type="password" placeholder="الحالية" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            <input type="password" placeholder="الجديدة (10 أحرف + رقم)" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
            <button className="btn" type="submit">حفظ</button>
            {msg && <p>{msg}</p>}
          </form>
        </>
      )}
    </main>
  );
}
