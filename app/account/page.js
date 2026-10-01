"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Account() {
  const [me, setMe] = useState(null);
  const [favs, setFavs] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ current: "", next: "" });
  const [name, setName] = useState("");
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { setMe(d.user); if (d.user) setName(d.user.name || ""); });
    fetch("/api/favorites").then((r) => r.json()).then((d) => setFavs(d.favorites || []));
  }, []);
  async function change(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(data.error || "تم تغيير كلمة المرور. سجل الدخول من جديد.");
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link> <Link href="/security">الحماية</Link></header>
      <h1>حسابي</h1>
      {!me && <p>سجل الدخول أولاً. <Link href="/login">دخول</Link></p>}
      {me && (
        <>
          <p>{me.name} · {me.email} · {me.role}</p>
          <form className="card" onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/auth/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
            const data = await res.json();
            setMsg(data.error || "تم حفظ الاسم.");
            if (data.ok) setMe({ ...me, name: data.name });
          }}>
            <h2>اسم العرض</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الظاهر للبائعين" />
            <button className="btn" type="submit">تحديث الاسم</button>
          </form>
          <form onSubmit={change} className="card">
            <h2>تغيير كلمة المرور</h2>
            <input type="password" placeholder="الحالية" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            <input type="password" placeholder="الجديدة (10 أحرف + رقم)" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
            <button className="btn" type="submit">حفظ</button>
            {msg && <p>{msg}</p>}
          </form>
          <section className="card">
            <h2>المفضلة</h2>
            {favs.length === 0 && <p>مفيش عروض محفوظة.</p>}
            {favs.map((l) => <p key={l.id}><Link href={"/listing/" + l.id}>{l.title}</Link> · {l.price} EGP</p>)}
          </section>
        </>
      )}
    </main>
  );
}
