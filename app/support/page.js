"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [me, setMe] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [orderId, setOrderId] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const auth = await fetch("/api/auth/me").then((r) => r.json());
    setMe(auth.user || null);
    if (!auth.user) return;
    const data = await fetch("/api/support").then((r) => r.json());
    setTickets(data.tickets || []);
  }
  useEffect(() => { load(); }, []);

  async function send(e) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, orderId })
    });
    const data = await res.json();
    setMsg(data.error || "اتسجلت التذكرة. هتتراجع من الإدارة.");
    if (data.ok) {
      setSubject("");
      setBody("");
      setOrderId("");
      load();
    }
  }

  async function close(ticketId) {
    await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", ticketId })
    });
    load();
  }

  return (
    <main>
      <Link href="/">FeLoot</Link>
      <h1>الدعم</h1>
      <p className="muted">لو الصفقة وقفت أو بيانات التسليم غلط، افتح تذكرة. الفلوس التجريبية بتفضل مجمدة لحد قرار الإدارة.</p>
      {!me && <p>لازم <Link href="/login">تسجّل الدخول</Link> عشان تفتح تذكرة.</p>}
      {me && (
        <form onSubmit={send}>
          <input placeholder="عنوان المشكلة" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <input placeholder="رقم الطلب (اختياري)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <textarea placeholder="اشرح المشكلة من غير ما تبعت كلمة السر هنا" value={body} onChange={(e) => setBody(e.target.value)} required />
          <button className="btn" type="submit">إرسال التذكرة</button>
        </form>
      )}
      {msg && <p>{msg}</p>}
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            <strong>{t.subject}</strong> — {t.status === "open" ? "مفتوحة" : "مقفولة"}
            <p>{t.body}</p>
            {t.orderId && <small>طلب: {t.orderId}</small>}
            {t.status === "open" && <button type="button" onClick={() => close(t.id)}>إغلاق</button>}
          </li>
        ))}
      </ul>
    </main>
  );
}
