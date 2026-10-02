"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function GameListings() {
  const { id } = useParams();
  const [data, setData] = useState({ games: [], listings: [] });
  useEffect(() => {
    if (!id) return;
    fetch("/api/listings?game=" + encodeURIComponent(id) + "&sort=price_asc")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ games: [], listings: [] }));
  }, [id]);
  const game = (data.games || []).find((g) => g.id === id);
  return (
    <main>
      <p><Link href="/games">كل الألعاب</Link> · <Link href="/">الرئيسية</Link></p>
      <h1>{game ? game.emoji + " " + game.name : "اللعبة"}</h1>
      {!data.listings?.length && <div className="warn">مفيش عروض نشطة للعبة دي دلوقتي.</div>}
      <div className="grid">
        {(data.listings || []).map((l) => (
          <Link key={l.id} className="card" href={"/listing/" + l.id}>
            <div className="pill">{l.delivery === "instant" ? "تسليم فوري" : "تسليم يدوي"}</div>
            <h2>{l.title}</h2>
            <p>{Number(l.price).toLocaleString("ar-EG")} EGP · {l.sellerName} · {l.rating}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
