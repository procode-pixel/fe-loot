"use client";
import { useEffect, useState } from "react";
export default function Status() {
  const [health, setHealth] = useState(null);
  useEffect(() => { fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth({ ok: false })); }, []);
  return (
    <main>
      <h1>حالة FeLoot</h1>
      <div className={health?.ok ? "card" : "warn"}>{health ? (health.ok ? "الخدمة شغالة" : "في مشكلة") : "جار الفحص…"}</div>
      <ul>
        <li>العروض الجديدة بتنتظر موافقة الإدارة قبل النشر.</li>
        <li>بيانات التسليم مش بترجع في قائمة العروض.</li>
        <li>التخزين الحالي ملفي ومؤقت على Vercel. قبل فلوس حقيقية لازم Postgres وبوابة دفع.</li>
      </ul>
    </main>
  );
}
