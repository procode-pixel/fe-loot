import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16, textAlign: "center" }}>
      <h1>404 — الصفحة مش موجودة</h1>
      <p>اللينك اللي دخلت عليه غلط أو الصفحة لسه مش متاحة في النسخة الحالية.</p>
      <p className="muted">الموقع حالياً في وضع المعاينة لأن متغيرات البيئة (قاعدة البيانات والمفاتيح) غير مضبوطة على Vercel. التصفح والعروض التجريبية شغالين.</p>
      <p>
        <Link className="btn" href="/">الرئيسية</Link>{" "}
        <Link className="btn" href="/categories">التصنيفات</Link>{" "}
        <Link className="btn" href="/browse">تصفح الأكونتات</Link>{" "}
        <Link className="btn" href="/status">حالة الخدمة</Link>{" "}
        <Link className="btn" href="/setup">خطوات التفعيل</Link>
      </p>
    </main>
  );
}
