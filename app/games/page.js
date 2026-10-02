"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Games() {
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((d) => setGames(d.games || []))
      .catch(() => setErr("تعذر تحميل الألعاب."));
  }, []);
  return (
    <main>
      <p><Link href="/">FeLoot</Link></p>
      <h1>تصفح حسب اللعبة</h1>
      <p className="muted">اختار اللعبة وشوف العروض النشطة فقط. العروض المعلقة مش بتظهر هنا.</p>
      {err && <div className="warn">{err}</div>}
      <div className="grid">
        {games.map((g) => (
          <Link key={g.id} className="card" href={"/games/" + g.id}>
            <div className="pill">{g.emoji} {g.name}</div>
            <h2>{g.count} أكونت</h2>
            <p className="muted">عرض العروض والسعر من الأقل للأعلى</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
