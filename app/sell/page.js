"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Sell() {
  const [form, setForm] = useState({ title:"", game:"pubg", price:1500, delivery:"instant", description:"", credentials:"" });
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/listings", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "خطأ");
    router.push("/listing/" + data.listing.id);
  }
  return (
    <main>
      <h1>بيع أكونت</h1>
      <form className="card" onSubmit={submit} style={{ display:"grid", gap:10, maxWidth:560 }}>
        <input placeholder="عنوان العرض" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <select value={form.game} onChange={e=>setForm({...form,game:e.target.value})}>
          <option value="pubg">PUBG</option><option value="freefire">Free Fire</option><option value="valorant">Valorant</option>
          <option value="fortnite">Fortnite</option><option value="codm">COD Mobile</option><option value="eafc">EA FC</option>
        </select>
        <input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} />
        <select value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})}><option value="instant">فوري</option><option value="manual">يدوي</option></select>
        <textarea placeholder="الوصف" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <textarea placeholder="بيانات التسليم (تتشاف للمشتري بعد الإسكرو فقط)" value={form.credentials} onChange={e=>setForm({...form,credentials:e.target.value})} />
        {err && <div className="warn">{err}</div>}
        <button>نشر العرض</button>
      </form>
    </main>
  );
}
