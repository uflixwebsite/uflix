'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PromoCard {
  category?: string;
  title: string;
  buttonText?: string;
  buttonLink?: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
  image: string;
  note?: string;
}

interface PromoCardsProps {
  cards?: PromoCard[];
}

const defaultCards: PromoCard[] = [];

export default function PromoCards({ cards: propCards }: PromoCardsProps) {
  const cards = propCards && propCards.length > 0 ? propCards : defaultCards;

  if (cards.length === 0) {
    return (
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl h-105 sm:h-125 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-300 text-sm">Add promo card {i + 1} in admin panel</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.buttonLink || '/contact'}
              className="relative group overflow-hidden rounded-xl h-105 sm:h-125 block"
            >
              {/* Background Image */}
              {card.image ? (
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-300" />
              )}

              {/* Centered frosted-glass text overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/35 backdrop-blur-sm text-white text-center px-8 py-8 max-w-xs w-full mx-6 rounded-sm">
                  {card.category && (
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3 opacity-90">
                      {card.category}
                    </p>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-5">
                    {card.title}
                  </h3>
                  {card.buttonText && (
                    <span className="inline-block border-b border-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer px-3 py-1 rounded" style={{ backgroundColor: card.primaryButtonBg || undefined, color: card.primaryButtonTextColor || undefined }}>
                      {card.buttonText}
                    </span>
                  )}
                  {card.note && (
                    <p className="text-sm mt-3 opacity-75 border-b border-white/50 inline-block">
                      {card.note}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
