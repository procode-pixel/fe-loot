"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
export default function Listing() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [missing, setMissing] = useState(false);
  const [msg, setMsg] = useState("");
  const [bid, setBid] = useState("");
  const [reason, setReason] = useState("");
  const [similar, setSimilar] = useState([]);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/listings/" + encodeURIComponent(id))
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setMissing(true); return; }
        setItem(d.listing);
        setSeller(d.seller);
        setSimilar(Array.isArray(d.similar) ? d.similar : []);
        try {
          const prev = JSON.parse(localStorage.getItem("feloot_recent") || "[]");
          const row = { id: d.listing.id, title: d.listing.title, price: d.listing.price, game: d.listing.game, at: Date.now() };
          const next = [row, ...prev.filter((x) => x.id !== row.id)].slice(0, 12);
          localStorage.setItem("feloot_recent", JSON.stringify(next));
        } catch {}
      })
      .catch(() => setMissing(true));
  }, [id]);
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
  async function fav() {
    const res = await fetch("/api/favorites", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ listingId: id }) });
    const data = await res.json();
    setMsg(data.error || "تم تحديث المفضلة.");
  }
  async function report(e) {
    e.preventDefault();
    const res = await fetch("/api/reports", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ listingId: id, reason }) });
    const data = await res.json();
    setMsg(data.error || data.message || "تم إرسال البلاغ.");
    if (res.ok) setReason("");
  }
  if (missing) return <main><p>العرض غير موجود أو اتحجز.</p><Link href="/">رجوع</Link></main>;
  if (!item) return <main><p>جارٍ التحميل…</p></main>;
  return (
    <main>
      <div className="card">
        <div className="pill">{item.delivery === "instant" ? "تسليم فوري" : "تسليم يدوي"}</div>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <p className="muted">
          <Link href={"/seller/" + item.sellerId}>{seller?.name || item.sellerName}</Link>
          {" · تقييم "}{seller?.rating || item.rating}
          {seller ? ` · مباع ${seller.sold} · تقييمات ${seller.reviews}` : ""}
        </p>
        <h2>{Number(item.price).toLocaleString("ar-EG")} EGP</h2>
        <p>الشراء يخصم من محفظة التجربة ويقفل المبلغ في الإسكرو. بيانات الدخول لا تظهر في الصفحة العامة.</p>
        <ul>
          <li>متشاركش بيانات الدخول خارج الإسكرو.</li>
          <li>غيّر الإيميل وكلمة السر بعد الاستلام وقبل ما تأكد.</li>
          <li>لو الحساب مش مطابق للوصف، اعمل شكوى من الطلب قبل التأكيد.</li>
        </ul>
        {msg && <div className="warn">{msg}</div>}
        <div className="grid">
          <button onClick={buy}>ادفع وقفّل الإسكرو</button>
          <button className="ghost" onClick={fav}>أضف للمفضلة</button>
          <button className="ghost" type="button" onClick={async () => {
            const url = window.location.href;
            try {
              if (navigator.share) await navigator.share({ title: item.title, url });
              else { await navigator.clipboard.writeText(url); setMsg("تم نسخ رابط العرض."); }
            } catch { setMsg("انسخ الرابط من شريط المتصفح."); }
          }}>مشاركة الرابط</button>
        </div>
        <form onSubmit={offer} style={{ marginTop: 12 }}>
          <input value={bid} onChange={(e) => setBid(e.target.value)} placeholder="مزايدة أقل من السعر" />
          <button className="ghost" type="submit">أرسل عرض سعر</button>
        </form>
        <form onSubmit={report} style={{ marginTop: 12 }}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب البلاغ (8 أحرف على الأقل)" />
          <button className="ghost" type="submit">بلّغ عن العرض</button>
        </form>
        {similar.length > 0 && (
          <section>
            <h2>عروض مشابهة</h2>
            <ul>
              {similar.map((s) => (
                <li key={s.id}><Link href={"/listing/" + s.id}>{s.title} — {Number(s.price).toLocaleString("ar-EG")} EGP</Link></li>
              ))}
            </ul>
          </section>
        )}
        <p><Link href="/wallet">شحن المحفظة</Link> · <Link href="/offers">عروضي</Link> · <Link href="/recent">شوهد مؤخراً</Link> · <Link href="/">العروض</Link></p>
      </div>
    </main>
  );
}
