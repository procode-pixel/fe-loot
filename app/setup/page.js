import Link from "next/link";
export default function Setup() {
  return (
    <main>
      <h1>تفعيل الإنتاج</h1>
      <p>الكود جاهز للمستخدمين والإسكرو والأدمن والتشفير. الموقع يفضل في المعاينة لحد ما تربط قاعدة بيانات ومفاتيح المصادقة.</p>
      <ol>
        <li>أنشئ Postgres على Neon أو Supabase وانسخ DATABASE_URL.</li>
        <li>على Vercel في فريق dosers-projects للمشروع fe-loot-v0 أضف في Production و Preview: DATABASE_URL و AUTH_SECRET (24+ حرف) و ENCRYPTION_KEY (32+ حرف) و NEXT_PUBLIC_APP_URL.</li>
        <li>التخزين الحالي ملف مؤقت على /tmp داخل الدالة. بدون قاعدة، الحسابات بتتمسح مع إعادة التشغيل.</li>
        <li>بعد الربط اعمل Redeploy ثم افحص /api/health و /status. يجب أن يظهر previewMode: false.</li>
      </ol>
      <p><Link href="/status">الحالة</Link> · <Link href="/security">الحماية</Link></p>
    </main>
  );
}
