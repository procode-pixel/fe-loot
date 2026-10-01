"use client";
export default function ErrorPage({ reset }) {
  return (
    <main>
      <h1>حصل خطأ غير متوقع</h1>
      <p>الصفحة وقعت. جرّب تاني، ولو اتكرر ابلغ من صفحة الدعم.</p>
      <button className="btn" onClick={() => reset()}>إعادة المحاولة</button>
    </main>
  );
}
