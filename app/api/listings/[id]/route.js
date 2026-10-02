const { load, ready, publicListing } = require("../../../../lib/store");
const { clean } = require("../../../../lib/guard");

export async function GET(_req, { params }) {
  await ready();
  const id = clean(params.id, 40);
  const db = load();
  const listing = db.listings.find((l) => l.id === id);
  if (!listing || listing.status !== "active") {
    return Response.json({ error: "العرض غير متاح." }, { status: 404 });
  }
  const seller = db.users.find((u) => u.id === listing.sellerId);
  const sold = db.listings.filter((l) => l.sellerId === listing.sellerId && l.status === "sold").length;
  const reviews = (db.reviews || []).filter((r) => r.sellerId === listing.sellerId);
  const similar = db.listings
    .filter((l) => l.status === "active" && l.id !== listing.id && l.game === listing.game)
    .slice(0, 3)
    .map((l) => publicListing(l));
  return Response.json({
    listing: publicListing(listing),
    seller: {
      id: listing.sellerId,
      name: listing.sellerName,
      rating: seller?.rating || listing.rating || 5,
      sold,
      reviews: reviews.length
    },
    similar
  });
}
