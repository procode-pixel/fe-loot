const { load, ready, publicListing } = require("../../../../../lib/store");

export async function GET(_req, { params }) {
  await ready();
  const db = load();
  const seller = db.users.find((u) => u.id === params.id && !u.banned);
  if (!seller) return Response.json({ error: "البائع غير موجود" }, { status: 404 });
  const listings = db.listings.filter((l) => l.sellerId === seller.id && l.status === "active").map(publicListing);
  const sold = db.orders.filter((o) => o.sellerId === seller.id && ["released", "delivered"].includes(o.status)).length;
  return Response.json({
    seller: { id: seller.id, name: seller.name, rating: seller.rating || 5, memberSince: seller.createdAt, totp: !!seller.totpEnabled },
    sold,
    listings
  });
}
