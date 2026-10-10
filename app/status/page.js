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
  const checks = health?.checks || {};
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>حالة FeLoot</h1>
      <div className={health?.marketplaceReady ? "card" : "warn"}>
        {error || (health ? (health.marketplaceReady ? "الماركت جاهز للتسجيل والبيع" : "الموقع شغال في وضع المعاينة — قاعدة البيانات أو مفاتيح المصادقة غير مربوطة") : "جار الفحص…")}
      </div>
      <ul>
        <li>التصفح: {flows.browse ? "مفعّل" : "متوقف"}</li>
        <li>التسجيل والبيع: {flows.register ? "مفعّل" : "موقوف لحد ربط DATABASE_URL و AUTH_SECRET و ENCRYPTION_KEY"}</li>
        <li>الدفع الحقيقي: غير مفعّل عمداً. الإسكرو الظاهر تجريبي.</li>
        <li>قاعدة البيانات: {checks.database ? "مربوطة" : "غير مربوطة"}</li>
        <li>سر المصادقة: {checks.authSecret ? "موجود" : "ناقص"}</li>
        <li>مفتاح التشفير: {checks.encryption ? "موجود" : "ناقص"}</li>
      </ul>
      <p><Link href="/setup">خطوات التفعيل</Link> · <Link href="/security">الحماية</Link> · <Link href="/changelog">سجل التطوير</Link></p>
      <button onClick={() => window.location.reload()}>إعادة الفحص الآن</button>
    </main>
  );
}
