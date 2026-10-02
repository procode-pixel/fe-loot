"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Alerts() {
  const [data, setData] = useState({ watches: [], games: [] });
  const [form, setForm] = useState({ game: "", q: "", maxPrice: "" });
  const [msg, setMsg] = useState("");
  async function load() {
    const res = await fetch("/api/watches");
    const body = await res.json();
    if (res.status === 401) setMsg("سجل الدخول لإنشاء تنبيه سعر.");
    setData(body.watches ? body : { watches: [], games: body.games || [] });
  }
  useEffect(() => { load(); }, []);
  async function create(e) {
    e.preventDefault();
    const res = await fetch("/api/watches", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const body = await res.json();
    setMsg(body.error || "تم حفظ التنبيه.");
    if (body.ok) { setForm({ game: "", q: "", maxPrice: "" }); load(); }
  }
  async function remove(id) {
    await fetch("/api/watches", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link> <Link href="/account">حسابي</Link></header>
      <h1>تنبيهات السعر</h1>
      <p>احفظ لعبة أو كلمة أو سقف سعر، وهتظهر العروض المطابقة من الكتالوج الحالي.</p>
      {msg && <p className="card">{msg}</p>}
      <form className="card" onSubmit={create}>
        <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
          <option value="">كل الألعاب</option>
          {(data.games || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input placeholder="كلمة في العنوان" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} />
        <input inputMode="numeric" placeholder="أقصى سعر بالجنيه" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
        <button className="btn" type="submit">حفظ التنبيه</button>
      </form>
      {(data.watches || []).map((w) => (
        <section className="card" key={w.id}>
          <strong>{w.game || "كل الألعاب"}</strong> {w.q ? "· " + w.q : ""} {w.maxPrice ? "· حتى " + Number(w.maxPrice).toLocaleString("ar-EG") + " EGP" : ""}
          <button type="button" onClick={() => remove(w.id)}>حذف</button>
          <ul>{(w.hits || []).map((h) => <li key={h.id}><Link href={"/listing/" + h.id}>{h.title}</Link> — {Number(h.price).toLocaleString("ar-EG")} EGP</li>)}</ul>
          {!w.hits?.length && <p>لا توجد عروض مطابقة الآن.</p>}
        </section>
      ))}
    </main>
  );
}
