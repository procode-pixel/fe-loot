"use client";
import { useEffect, useState } from "react";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "سجل الدخول");
    setOrders(data.orders || []);
  }
  useEffect(() => { load(); }, []);
  async function act(id, action) {
    await fetch("/api/orders/" + id, { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ action, note: "مشكلة في التسليم" }) });
    load();
  }
  return (
    <main>
      <h1>طلباتي</h1>
      {err && <div className="warn">{err}</div>}
      <div className="grid">
        {orders.map(o => (
          <article className="card" key={o.id}>
            <b>{o.title}</b>
            <p>{o.price} EGP · {o.status}</p>
            {o.credentials && <p>بيانات التسليم: {o.credentials}</p>}
            {o.status === "escrow_held" && <button onClick={() => act(o.id, "confirm")}>استلمت، افرج عن الفلوس</button>}
            {["escrow_held","released"].includes(o.status) && <button className="ghost" onClick={() => act(o.id, "dispute")}>شكوى وتجميد</button>}
          </article>
        ))}
      </div>
    </main>
  );
}
