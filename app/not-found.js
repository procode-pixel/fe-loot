import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16, textAlign: "center" }}>
      <h1>404 — الصفحة مش موجودة</h1>
      <p>اللينك اللي دخلت عليه غلط أو الصفحة لسه مش متاحة في النسخة الحالية.</p>
      <p className="muted">الموقع حالياً في وضع المعاينة. بعض الصفحات هتشتغل بعد ربط قاعدة البيانات والأسرار على Vercel.</p>
      <p>
        <Link className="btn" href="/">الرئيسية</Link>{" "}
        <Link className="btn" href="/status">حالة الخدمة</Link>{" "}
        <Link className="btn" href="/setup">خطوات التفعيل</Link>{" "}
        <Link className="btn" href="/security">الحماية</Link>
      </p>
    </main>
  );
}
