"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "", website: "" });
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setPreview(Boolean(d.previewMode)))
      .catch(() => setPreview(false));
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (preview) {
      setErr("الدخول مش هيشتغل في وضع المعاينة. التفاصيل في صفحة الحالة.");
      return;
    }
    setErr("");
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "خطأ");
    router.push("/");
  }
  return (
    <main>
      <h1>{mode === "login" ? "تسجيل الدخول" : "حساب جديد"}</h1>
      {preview && <p className="warn">الدخول مش هيشتغل لحد تفعيل خدمة الموقع. التفاصيل في <a href="/status">صفحة الحالة</a>.</p>}
      <form className="card" onSubmit={submit} style={{ display:"grid", gap:10, maxWidth:420 }}>
        <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({...form, website:e.target.value})} style={{position:"absolute",left:"-9999px"}} aria-hidden="true" />
        {mode === "register" && <input placeholder="الاسم" autoComplete="name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} disabled={preview} />}
        <input type="email" placeholder="الإيميل" autoComplete="username" value={form.email} onChange={e => setForm({...form, email:e.target.value})} disabled={preview} />
        <input type="password" placeholder="كلمة المرور" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={e => setForm({...form, password:e.target.value})} disabled={preview} />
        {err && <div className="warn">{err}</div>}
        <button disabled={preview}>{mode === "login" ? "دخول" : "تسجيل"}</button>
        <button type="button" className="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")} disabled={preview}>{mode === "login" ? "إنشاء حساب" : "عندي حساب"}</button>
        <p className="muted">الدخول الإداري من متغيرات البيئة فقط. لا توجد كلمة مرور تجريبية معروضة هنا.</p>
      </form>
    </main>
  );
}
