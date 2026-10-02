"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "", website: "" });
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "خطأ");
    router.push("/");
  }
  return (
    <main>
      <h1>{mode === "login" ? "تسجيل الدخول" : "حساب جديد"}</h1>
      <form className="card" onSubmit={submit} style={{ display:"grid", gap:10, maxWidth:420 }}>
        <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({...form, website:e.target.value})} style={{position:"absolute",left:"-9999px"}} aria-hidden="true" />
        {mode === "register" && <input placeholder="الاسم" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />}
        <input placeholder="الإيميل" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
        <input type="password" placeholder="كلمة المرور" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
        {err && <div className="warn">{err}</div>}
        <button>{mode === "login" ? "دخول" : "تسجيل"}</button>
        <button type="button" className="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "إنشاء حساب" : "عندي حساب"}</button>
        <p className="muted">تجربة الأدمن: admin@feloot.app / Admin#FeLoot2026 — غيّرها عبر ADMIN_PASSWORD و AUTH_SECRET.</p>
      </form>
    </main>
  );
}
