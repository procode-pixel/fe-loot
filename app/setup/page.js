import Link from "next/link";
export default function Setup() {
  return (
    <main>
      <h1>تفعيل الإنتاج</h1>
      <p>الكود جاهز للمستخدمين والإسكرو والأدمن والتشفير. الموقع يفضل في المعاينة لحد ما تربط قاعدة بيانات.</p>
      <ol>
        <li>أنشئ Postgres على Neon أو Supabase وانسخ DATABASE_URL.</li>
        <li>على Vercel للمشروع fe-loot-v0 أضف: AUTH_SECRET و ENCRYPTION_KEY (32+ حرف) و ADMIN_PASSWORD و NEXT_PUBLIC_APP_URL.</li>
        <li>التخزين الحالي ملف مؤقت على /tmp داخل الدالة. بدون قاعدة، الحسابات بتتمسح مع إعادة التشغيل.</li>
        <li>بعد الربط اعمل Redeploy ثم افحص /api/health و /status.</li>
      </ol>
      <p><Link href="/status">الحالة</Link> · <Link href="/security">الحماية</Link></p>
    </main>
  );
}
