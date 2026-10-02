"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Recent() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    try { setRows(JSON.parse(localStorage.getItem("feloot_recent") || "[]")); } catch { setRows([]); }
  }, []);
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <Link href="/">FeLoot</Link>
      <h1>شوهد مؤخراً</h1>
      <p className="muted">القائمة دي على جهازك فقط ومش بتتبعت للسيرفر.</p>
      {rows.length === 0 && <p>لسه مفيش عروض اتفتحت من المتصفح ده.</p>}
      {rows.map((l) => (
        <p key={l.id}><Link href={"/listing/" + l.id}>{l.title}</Link> · {Number(l.price || 0).toLocaleString("ar-EG")} EGP</p>
      ))}
      {rows.length > 0 && <button className="ghost" type="button" onClick={() => { localStorage.removeItem("feloot_recent"); setRows([]); }}>مسح السجل</button>}
    </main>
  );
}
