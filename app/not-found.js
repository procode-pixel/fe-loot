import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16, textAlign: "center" }}>
      <h1>404 — الصفحة مش موجودة</h1>
      <p>اللينك اللي دخلت عليه غلط أو الصفحة لسه مش متاحة في النسخة الحالية من الموقع.</p>
      <p className="muted">الموقع حاليًا في وضع المعاينة لأن متغيرات البيئة (DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY) غير مضبوطة على Vercel. التصفح والعروض التجريبية شغالين. بعض الصفحات مثل /games و /fees و /deals قد تظهر 404 حتى يتم إعادة النشر بعد ضبط المتغيرات.</p>
      <p>
        <Link className="btn" href="/">الرئيسية</Link>{" "}
        <Link className="btn" href="/status">حالة الخدمة</Link>{" "}
        <Link className="btn" href="/setup">خطوات التفعيل</Link>{" "}
        <Link className="btn" href="/security">الحماية</Link>
      </p>
    </main>
  );
}
