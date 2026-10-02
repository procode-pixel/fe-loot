"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Account() {
  const [me, setMe] = useState(null);
  const [favs, setFavs] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ current: "", next: "" });
  const [name, setName] = useState("");
  const [two, setTwo] = useState(null);
  const [code, setCode] = useState("");
  const [disablePass, setDisablePass] = useState("");
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
          <p>{me.name} · {me.email} · {me.role} · رصيد {Number(me.balance || 0).toLocaleString("ar-EG")} EGP</p>
          <p><Link href="/wallet">المحفظة</Link> · <Link href="/offers">عروض السعر</Link> · <Link href="/alerts">تنبيهات السعر</Link></p>
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
            <h2>التحقق الثنائي</h2>
            <p>{me.totpEnabled ? "مفعّل. الدخول يطلب كود تطبيق المصادقة." : "غير مفعّل. فعّله لحماية الحساب."}</p>
            {!me.totpEnabled && <button className="btn" type="button" onClick={async () => {
              const res = await fetch("/api/auth/2fa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start" }) });
              setTwo(await res.json());
            }}>بدء التفعيل</button>}
            {two?.secret && <p>أضف السر في تطبيق المصادقة: <b>{two.secret}</b></p>}
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="كود من 6 أرقام" />
            <button className="btn" type="button" onClick={async () => {
              const res = await fetch("/api/auth/2fa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "confirm", code }) });
              const data = await res.json();
              setMsg(data.error || "تم تفعيل التحقق الثنائي. سجل الدخول من جديد.");
            }}>تأكيد التفعيل</button>
            {me.totpEnabled && <>
              <input type="password" value={disablePass} onChange={(e) => setDisablePass(e.target.value)} placeholder="كلمة المرور لإيقاف 2FA" />
              <button type="button" onClick={async () => {
                const res = await fetch("/api/auth/2fa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "disable", password: disablePass, code }) });
                const data = await res.json();
                setMsg(data.error || "تم إيقاف التحقق الثنائي.");
              }}>إيقاف التحقق الثنائي</button>
            </>}
          </section>

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
