"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Status() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setError("تعذر قراءة الحالة"));
  }, []);
  const flows = health?.userFlows || {};
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>حالة FeLoot</h1>
      <div className={health?.marketplaceReady ? "card" : "warn"}>
        {error || (health ? (health.marketplaceReady ? "الماركت جاهز" : "الموقع شغال في وضع المعاينة") : "جار الفحص…")}
      </div>
      <ul>
        <li>التصفح: {flows.browse ? "مفعّل" : "متوقف"}</li>
        <li>التسجيل والبيع: {flows.register ? "مفعّل" : "موقوف لحد ربط قاعدة البيانات والأسرار"}</li>
        <li>الدفع الحقيقي: غير مفعّل عمداً. الإسكرو الظاهر تجريبي.</li>
        <li>التخزين: {health?.checks?.storage || "غير معروف"}</li>
      </ul>
      <p><Link href="/setup">خطوات التفعيل</Link> · <Link href="/security">الحماية</Link> · <Link href="/changelog">سجل التطوير</Link></p>
    </main>
  );
}
