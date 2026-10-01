import Link from "next/link";
export default function NotFound() {
  return (
    <main>
      <h1>الصفحة مش موجودة</h1>
      <p>الرابط غلط أو العرض اتشال.</p>
      <Link className="btn" href="/">رجوع للرئيسية</Link>
    </main>
  );
}
