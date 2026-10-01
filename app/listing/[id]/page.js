"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
export default function Listing() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  useEffect(() => { fetch("/api/listings").then(r=>r.json()).then(d => setItem((d.listings||[]).find(x => x.id === id) || null)); }, [id]);
  async function buy() {
    const res = await fetch("/api/orders", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ listingId: id }) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "خطأ");
    router.push("/orders");
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
        <p>الدفع هنا محاكاة إسكرو: الفلوس بتتقفل، وبيانات الدخول مش موجودة في صفحة العرض.</p>
        {msg && <div className="warn">{msg}</div>}
        <button onClick={buy}>ادفع وقفّل الإسكرو</button>
      </div>
    </main>
  );
}
