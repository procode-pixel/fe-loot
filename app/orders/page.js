"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState("");
  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  }
  async function openChat(order) {
    setActive(order);
    const res = await fetch("/api/messages?orderId=" + order.id);
    const data = await res.json();
    setMessages(data.messages || []);
  }
  async function send(e) {
    e.preventDefault();
    if (!active) return;
    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: active.id, text }) });
    const data = await res.json();
    setNote(data.error || "اتبعتت الرسالة.");
    if (res.ok) { setText(""); openChat(active); }
  }
  async function review(e) {
    e.preventDefault();
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: active.id, stars, text: note }) });
    const data = await res.json();
    setNote(data.error || "تم حفظ التقييم.");
  }
  useEffect(() => { load(); }, []);
  return (
    <main>
      <h1>طلباتي</h1>
      <p><Link href="/wallet">المحفظة</Link></p>
      <div className="grid">
        {orders.map((o) => (
          <article className="card" key={o.id}>
            <h3>{o.title}</h3>
            <p className="muted">{o.status} · {o.price} EGP</p>
            <button className="ghost" onClick={() => openChat(o)}>شات الصفقة</button>
          </article>
        ))}
      </div>
      {active && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>شات {active.id}</h2>
          {messages.map((m) => <p key={m.id}><b>{m.name}:</b> {m.text}</p>)}
          <form onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="رسالة للطرف الآخر" />
            <button type="submit">إرسال</button>
          </form>
          <form onSubmit={review}>
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            <button type="submit">تقييم بعد الاستلام</button>
          </form>
          {note && <p className="muted">{note}</p>}
        </section>
      )}
    </main>
  );
}
