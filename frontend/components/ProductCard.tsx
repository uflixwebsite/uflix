'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

export default function ProductCard({ id, name, price, originalPrice, discount, image, category }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, price, image, originalPrice, discount });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, name, price, image, originalPrice, discount });
    }
  };

  const inWishlist = isInWishlist(id);

  return (
    <Link href={`/product/${id}`} className="group bg-white rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden bg-neutral-light flex-shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-md text-sm font-bold">
            {discount} Off
          </span>
        )}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-md"
          aria-label="Add to wishlist"
        >
          <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {category && (
          <p className="text-xs text-neutral-dark uppercase tracking-wide mb-2">{category}</p>
        )}
        <h3 className="text-base font-semibold mb-2 text-foreground line-clamp-2 group-hover:text-accent transition-colors min-h-[3rem]">
          {name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-foreground">{price}</span>
          {originalPrice && (
            <span className="text-sm text-neutral-dark line-through">{originalPrice}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full bg-accent hover:bg-secondary text-white py-2 rounded-md font-medium transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
