"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Seller({ params }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/sellers/" + params.id).then(async (r) => {
      const body = await r.json();
      if (!r.ok) setErr(body.error || "غير موجود");
      else setData(body);
    });
  }, [params.id]);
  return (
    <main>
      <header><Link className="brand" href="/">FeLoot</Link></header>
      {err && <p>{err}</p>}
      {data && (
        <>
          <h1>{data.seller.name}</h1>
          <p className="muted">تقييم {data.seller.rating} · مبيعات مكتملة {data.sold} {data.seller.totp ? "· تحقق ثنائي مفعّل" : ""}</p>
          <div className="grid">
            {data.listings.map((l) => (
              <Link key={l.id} className="card" href={"/listing/" + l.id}>
                <b>{l.title}</b>
                <div>{l.price} EGP</div>
              </Link>
            ))}
          </div>
          {data.listings.length === 0 && <p>لا توجد عروض نشطة.</p>}
        </>
      )}
    </main>
  );
}
