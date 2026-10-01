"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Account() {
  const [me, setMe] = useState(null);
  const [favs, setFavs] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ current: "", next: "" });
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
    fetch("/api/favorites").then((r) => r.json()).then((d) => setFavs(d.favorites || []));
  }, []);
  async function change(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(data.error || "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0646 \u062c\u062f\u064a\u062f.");
  }
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link> <Link href="/security">\u0627\u0644\u062d\u0645\u0627\u064a\u0629</Link></header>
      <h1>\u062d\u0633\u0627\u0628\u064a</h1>
      {!me && <p>\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b. <Link href="/login">\u062f\u062e\u0648\u0644</Link></p>}
      {me && (
        <>
          <p>{me.name} \u00b7 {me.email} \u00b7 {me.role}</p>
          <form onSubmit={change} className="card">
            <h2>\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</h2>
            <input type="password" placeholder="\u0627\u0644\u062d\u0627\u0644\u064a\u0629" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            <input type="password" placeholder="\u0627\u0644\u062c\u062f\u064a\u062f\u0629 (10 \u0623\u062d\u0631\u0641 + \u0631\u0642\u0645)" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
            <button className="btn" type="submit">\u062d\u0641\u0638</button>
            {msg && <p>{msg}</p>}
          </form>
          <section className="card">
            <h2>\u0627\u0644\u0645\u0641\u0636\u0644\u0629</h2>
            {favs.length === 0 && <p>\u0645\u0641\u064a\u0634 \u0639\u0631\u0648\u0636 \u0645\u062d\u0641\u0648\u0638\u0629.</p>}
            {favs.map((l) => <p key={l.id}><Link href={"/listing/" + l.id}>{l.title}</Link> \u00b7 {l.price} EGP</p>)}
          </section>
        </>
      )}
    </main>
  );
}
