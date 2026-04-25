import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/";

async function getListing(slug: string) {
  const res = await fetch(`${API_BASE}listings/${slug}/`, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Impossible de récupérer l’annonce");
  }
  return res.json();
}

interface ListingPageProps {
  params: Readonly<{ slug: string }>;
}

export default async function ListingDetailPage({ params }: Readonly<ListingPageProps>) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <article className="max-w-5xl mx-auto py-16 px-4">
      <p className="text-sm text-gray-500 uppercase tracking-wide">{listing.category}</p>
      <h1 className="text-4xl font-bold mt-2">{listing.title}</h1>
      <p className="text-xl text-[#ff6e14] font-semibold mt-4">
        {listing.price} {listing.currency}
      </p>

      {listing.cover_image && (
        <img
          src={listing.cover_image}
          alt={listing.title}
          className="mt-8 w-full rounded-2xl border object-cover max-h-[420px]"
        />
      )}

      <section className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p>{listing.description}</p>
          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-4 rounded-2xl border p-6 bg-white shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Localisation</h3>
            <p className="text-gray-600">
              {listing.city} · {listing.region}, {listing.country}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <p className="text-gray-600">{listing.contact_email}</p>
            {listing.contact_phone && <p className="text-gray-600">{listing.contact_phone}</p>}
            {listing.whatsapp && <p className="text-gray-600">WhatsApp&nbsp;: {listing.whatsapp}</p>}
          </div>
        </aside>
      </section>
    </article>
  );
}
