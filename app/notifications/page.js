"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تحميل الإشعارات");
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => { load(); }, []);

  async function markRead() {
    await fetch("/api/notifications", { method: "POST" });
    load();
  }

  return (
    <main className="wrap">
      <h1>الإشعارات</h1>
      <p>تحديثات الطلبات والشكاوى بعد تسجيل الدخول. لا تحرك هذه الصفحة أموالاً حقيقية.</p>
      <button onClick={markRead}>تعليم الكل كمقروء</button>
      {error && <p>{error} <Link href="/login">دخول</Link></p>}
      <ul>
        {items.map((n) => (
          <li key={n.id}>{n.read ? "" : "• "}{n.text} <small>{n.at}</small></li>
        ))}
        {!items.length && !error && <li>لا توجد إشعارات.</li>}
      </ul>
    </main>
  );
}
