import Link from "next/link";
export const metadata = { title: "أمان الصفقة | FeLoot" };
export default function Safety() {
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>قبل ما تشتري أكونت</h1>
      <ol>
        <li>متدفعش خارج الموقع، حتى لو البائع طلب تحويل فوري.</li>
        <li>استلم البيانات من شاشة الطلب فقط بعد قفل الإسكرو.</li>
        <li>غيّر الإيميل وكلمة السر وفعّل التحقق بخطوتين في نفس الجلسة.</li>
        <li>لو البيانات غلط أو الحساب مربوط بشخص تاني، افتح شكوى قبل تأكيد الاستلام.</li>
        <li>متشاركش لقطة الشاشة اللي فيها بيانات الدخول في أي شات خارجي.</li>
      </ol>
      <p>العروض الجديدة بتفضل معلّقة لحد موافقة الإدارة، وبيانات التسليم مش بتظهر في القوائم العامة.</p>
      <p><Link href="/help">المساعدة</Link> · <Link href="/security">تفاصيل الحماية</Link></p>
    </main>
  );
}
