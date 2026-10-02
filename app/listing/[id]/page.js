"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
export default function Listing() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [bid, setBid] = useState("");
  const router = useRouter();
  useEffect(() => { fetch("/api/listings").then(r=>r.json()).then(d => setItem((d.listings||[]).find(x => x.id === id) || null)); }, [id]);
  async function buy() {
    const res = await fetch("/api/orders", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ listingId: id }) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "خطأ");
    router.push("/orders");
  }
  async function offer(e) {
    e.preventDefault();
    const res = await fetch("/api/offers", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ listingId: id, amount: Number(bid) }) });
    const data = await res.json();
    setMsg(data.error || "تم إرسال المزايدة للبائع.");
  }
  if (!item) return <main><p>العرض غير موجود أو اتحجز.</p></main>;
  return (
    <main>
      <div className="card">
        <div className="pill">{item.delivery === "instant" ? "تسليم فوري" : "تسليم يدوي"}</div>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <p className="muted">{item.sellerName} · {item.rating}</p>
        <h2>{item.price.toLocaleString("ar-EG")} EGP</h2>
        <p>الشراء يخصم من محفظة التجربة ويقفل المبلغ في الإسكرو. بيانات الدخول لا تظهر في الصفحة.</p>
        {msg && <div className="warn">{msg}</div>}
        <button onClick={buy}>ادفع وقفّل الإسكرو</button>
        <form onSubmit={offer} style={{ marginTop: 12 }}>
          <input value={bid} onChange={(e) => setBid(e.target.value)} placeholder="مزايدة أقل من السعر" />
          <button className="ghost" type="submit">أرسل عرض سعر</button>
        </form>
        <p><Link href="/wallet">شحن المحفظة</Link> · <Link href="/offers">عروضي</Link></p>
      </div>
    </main>
  );
}
