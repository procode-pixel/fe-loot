import Link from "next/link";

export const metadata = { title: "سجل التطوير | FeLoot" };

const ENTRIES = [
  {
    date: "2026-10-02",
    items: [
      "حالة فارغة واضحة لو مفيش نتايج بعد البحث أو الفلتر.",
      "صفحة سجل التطوير علنية عشان المستخدم يشوف إيه اتغيّر.",
      "robots.txt يمنع فهرسة الإدارة والمحفظة والطلبات."
    ]
  },
  {
    date: "2026-10-01",
    items: [
      "إسكرو تجريبي، عروض سعر، تنبيهات، محفظة داخلية، ومراجعة الإدارة قبل نشر العرض.",
      "حد معدل الطلبات، قفل تسجيل الدخول، ورفض الطلبات العابرة للموقع."
    ]
  }
];

export default function Changelog() {
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>سجل التطوير</h1>
      <p>الموقع لسه بوابة دفع حقيقية. الفلوس الظاهرة تجريبية لحد ربط Postgres ومزود دفع.</p>
      {ENTRIES.map((e) => (
        <section key={e.date}>
          <h2>{e.date}</h2>
          <ul>{e.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </main>
  );
}
