import Link from "next/link";
export default function NotFound() {
  return (
    <main>
      <h1>الصفحة مش موجودة</h1>
      <p>اللينك اللي دخلت عليه غلط أو الصفحة اتشالت.</p>
      <p>
        <Link className="btn" href="/">الرئيسية</Link>{" "}
        <Link className="btn" href="/categories">التصنيفات</Link>{" "}
        <Link className="btn" href="/fees">الرسوم</Link>{" "}
        <Link className="btn" href="/status">حالة الخدمة</Link>
      </p>
    </main>
  );
}
