"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Sell() {
  const [form, setForm] = useState({ title:"", game:"pubg", price:1500, delivery:"instant", description:"", credentials:"" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setPreview(Boolean(d.previewMode)))
      .catch(() => setPreview(false));
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (preview) {
      setErr("البيع موقوف في وضع المعاينة. لا نرسل بيانات التسليم قبل تفعيل الخدمة.");
      return;
    }
    setErr("");
    const res = await fetch("/api/listings", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "خطأ");
    setOk(data.message || "اتبعت للمراجعة.");
  }
  return (
    <main>
      <h1>بيع أكونت</h1>
      <p className="muted">العرض مش هينزل على الماركت غير بعد مراجعة الإدارة. متحطش بيانات دخول حقيقية لأكونت مش ملكك.</p>
      {preview && <p className="warn">البيع موقوف لحد تفعيل الخدمة. التفاصيل في <Link href="/status">صفحة الحالة</Link>.</p>}
      <form className="card" onSubmit={submit} style={{ display:"grid", gap:10, maxWidth:560 }}>
        <input placeholder="عنوان العرض" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} disabled={preview} />
        <select value={form.game} onChange={e=>setForm({...form,game:e.target.value})} disabled={preview}>
          <option value="pubg">PUBG</option><option value="freefire">Free Fire</option><option value="valorant">Valorant</option>
          <option value="fortnite">Fortnite</option><option value="codm">COD Mobile</option><option value="eafc">EA FC</option>
        </select>
        <input type="number" min="50" max="500000" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} disabled={preview} />
        <select value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})} disabled={preview}><option value="instant">فوري</option><option value="manual">يدوي</option></select>
        <textarea placeholder="الوصف" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} disabled={preview} />
        <textarea placeholder="بيانات التسليم (تتشاف للمشتري بعد الإسكرو فقط)" value={form.credentials} onChange={e=>setForm({...form,credentials:e.target.value})} disabled={preview} />
        {err && <div className="warn">{err}</div>}
        {ok && <div className="card">{ok} <Link href="/account">حسابي</Link></div>}
        <button disabled={preview}>إرسال للمراجعة</button>
      </form>
    </main>
  );
}
