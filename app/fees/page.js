import Link from "next/link";

export const metadata = { title: "الرسوم | FeLoot" };

export default function Fees() {
  return (
    <main>
      <h1>رسوم فيلووت</h1>
      <p className="muted">الشفافية قبل أي صفقة. وضع المعاينة لا يحرّك فلوس حقيقية.</p>
      <section className="card">
        <h2>الآن (معاينة)</h2>
        <p>عمولة المنصة: 0%. شحن المحفظة تجريبي وبحد يومي، ومش بيساوي دفع حقيقي.</p>
      </section>
      <section className="card">
        <h2>لما الدفع يتفعّل</h2>
        <ul>
          <li>المشتري يدفع سعر العرض. المبلغ يتقفل في الإسكرو فوراً.</li>
          <li>عمولة المنصة 5% من سعر الصفقة، تخصم من البائع عند الإفراج فقط.</li>
          <li>النزاع يجمّد الإسكرو. لا إفراج ولا عمولة قبل قرار الإدارة.</li>
          <li>الإلغاء قبل التسليم يرجّع المبلغ للمشتري بدون عمولة.</li>
        </ul>
      </section>
      <section className="card">
        <h2>إيه اللي مش بنتقاضاه</h2>
        <p>مفيش رسوم على إنشاء الحساب، المفضلة، التنبيهات، أو فتح تذكرة دعم.</p>
        <p><Link href="/safety">قواعد الأمان</Link> · <Link href="/sell">بيع أكونت</Link></p>
      </section>
    </main>
  );
}
