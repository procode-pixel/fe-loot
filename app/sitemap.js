export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://fe-loot-v0.vercel.app";
  const paths = ["", "/games", "/help", "/security", "/terms", "/privacy", "/changelog", "/status", "/compare", "/safety", "/recent"];
  return paths.map((path) => ({ url: base + path, changeFrequency: "daily", priority: path === "" ? 1 : 0.6 }));
}
