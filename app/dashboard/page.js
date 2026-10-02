"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS = { pending: "بانتظار المراجعة", active: "منشور", reserved: "محجوز", rejected: "مرفوض", sold: "مباع" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/dashboard").then(async (r) => {
      const body = await r.json();
      if (!r.ok) setError(body.error || "تعذر تحميل اللوحة");
      else setData(body);
    }).catch(() => setError("تعذر الاتصال."));
  }, []);
  return (
    <main>
      <header>
        <Link className="brand" href="/">FeLoot</Link>
        <Link href="/sell">بيع أكونت</Link>
        <Link href="/orders">الطلبات</Link>
        <Link href="/account">الحساب</Link>
      </header>
      <h1>لوحتي</h1>
      {error && <p className="warn">{error} <Link href="/login">تسجيل الدخول</Link></p>}
      {data && (
        <>
          <div className="stats">
            <div><b>{Number(data.balance || 0).toLocaleString("ar-EG")}</b><div className="muted">رصيد المحفظة</div></div>
            <div><b>{data.openOrders}</b><div className="muted">طلبات مفتوحة</div></div>
            <div><b>{data.listings.length}</b><div className="muted">عروضي</div></div>
            <div><b>{data.unread}</b><div className="muted">تنبيهات غير مقروءة</div></div>
          </div>
          <p className="muted">مبيعات مكتملة: {data.sold} · تذاكر دعم مفتوحة: {data.tickets}</p>
          <p><Link href="/wallet">المحفظة</Link> · <Link href="/offers">عروض السعر</Link> · <Link href="/support">الدعم</Link> · <Link href="/notifications">التنبيهات</Link></p>
          <h2>عروضي</h2>
          {!data.listings.length && <p className="muted">لسه معندكش عروض. <Link href="/sell">أضف عرض</Link></p>}
          <div className="grid">
            {data.listings.map((l) => (
              <Link className="card" key={l.id} href={"/listing/" + l.id}>
                <b>{l.title}</b>
                <p>{Number(l.price).toLocaleString("ar-EG")} EGP</p>
                <p className="muted">{STATUS[l.status] || l.status} · {l.delivery === "instant" ? "فوري" : "يدوي"}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
