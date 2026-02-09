import Image from 'next/image';
import Link from 'next/link';

const defaultCollections = [
  {
    title: 'Modern Minimalist',
    description: 'Clean lines and contemporary design for the modern home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    itemCount: 45,
    link: '/shop',
  },
  {
    title: 'Classic Elegance',
    description: 'Timeless pieces that never go out of style',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    itemCount: 38,
    link: '/shop',
  },
  {
    title: 'Scandinavian Comfort',
    description: 'Cozy and functional Nordic-inspired furniture',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
    itemCount: 52,
    link: '/shop',
  },
];

interface FeaturedCollectionsProps {
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description?: string; image: string; itemCount?: number; link?: string }>;
}

export default function FeaturedCollections({ title, subtitle, items }: FeaturedCollectionsProps) {
  const collections = items && items.length > 0 ? items : defaultCollections;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title || 'Featured Collections'}</h2>
          <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
            {subtitle || 'Curated selections for every style and space'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-96">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {collection.itemCount ? <p className="text-sm mb-2 opacity-90">{collection.itemCount} Items</p> : null}
                <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
                <p className="text-sm mb-4 opacity-90">{collection.description}</p>
                <Link
                  href={collection.link || '/shop'}
                  className="inline-block bg-accent hover:bg-secondary text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
