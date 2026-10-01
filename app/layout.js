import "./globals.css";
export const metadata = { title: "FeLoot | فيلووت", description: "ماركت بليس لأكونتات الألعاب مع إسكرو" };
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
