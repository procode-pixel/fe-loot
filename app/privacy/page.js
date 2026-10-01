import Link from "next/link";
export const metadata = { title: "سياسة الخصوصية | FeLoot" };
export default function Privacy() {
  return (
    <main>
      <h1>سياسة الخصوصية</h1>
      <p>نجمع البريد واسم المستخدم وكلمة المرور المشفرة وسجل العمليات اللازم لتشغيل الإسكرو ومنع الإساءة.</p>
      <p>بيانات دخول الأكونت المباع تُخزّن مشفرة بـ AES-256-GCM ولا تظهر في واجهة العروض العامة. لا نبيع البيانات لطرف ثالث.</p>
      <p>جلسة الدخول كوكي موقّع بتوقيع HMAC. غيّر كلمة المرور يلغي الجلسات السابقة عبر tokenVersion.</p>
      <p><Link href="/security">الحماية</Link> · <Link href="/">الرئيسية</Link></p>
    </main>
  );
}
