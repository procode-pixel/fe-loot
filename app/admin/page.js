"use client";
import { useEffect, useState } from "react";
export default function Admin() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  async function load() {
    const res = await fetch("/api/admin/orders");
    const json = await res.json();
    if (!res.ok) return setErr(json.error || "ممنوع");
    setData(json);
  }
  useEffect(() => { load(); }, []);
  async function act(id, action) {
    await fetch("/api/orders/" + id, { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ action }) });
    load();
  }
  if (err) return <main><div className="warn">{err}</div></main>;
  if (!data) return <main>جار التحميل…</main>;
  return (
    <main>
      <h1>لوحة الإدارة</h1>
      <p className="muted">مستخدمون {data.users.length} · طلبات {data.orders.length} · نزاعات {data.disputes.length}</p>
      {data.orders.map(o => (
        <article className="card" key={o.id} style={{ marginBottom:10 }}>
          <b>{o.title}</b> · {o.status} · {o.buyerName}
          {o.status === "disputed" && <>
            <button onClick={() => act(o.id, "resolve_buyer")}>رد للمشتري</button>
            <button className="ghost" onClick={() => act(o.id, "resolve_seller")}>لصالح البائع</button>
          </>}
        </article>
      ))}
      <h2>سجل التدقيق</h2>
      <ul>{data.audit.map((a,i) => <li key={i}>{a.at} — {a.action}</li>)}</ul>
    </main>
  );
}
