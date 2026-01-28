'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string; alt?: string }>;
  category?: string;
  rating?: number;
  reviews?: number;
  isActive?: boolean;
}

export default function ProductCard({ _id, name, price, discountPrice, images, category }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get the current image or use a placeholder
  const image = images?.[currentImageIndex]?.url || '/placeholder-image.jpg';
  
  // Calculate discount if discountPrice exists
  const discount = discountPrice ? 
    Math.round(((price - discountPrice) / price) * 100) + '%' : null;
  
  const originalPrice = discountPrice ? `₹${price}` : null;
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // Handle manual image navigation
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id: _id, // Use original MongoDB _id string
      name, 
      price: `₹${discountPrice || price}`, 
      image, 
      originalPrice: discountPrice ? `₹${price}` : undefined, 
      discount: discount || undefined 
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(_id)) {
      removeFromWishlist(_id);
    } else {
      addToWishlist({ 
        id: _id, // Use original MongoDB _id string
        name, 
        price: `₹${discountPrice || price}`, 
        image, 
        originalPrice: discountPrice ? `₹${price}` : undefined, 
        discount: discount || undefined 
      });
    }
  };

  const inWishlist = isInWishlist(_id);

  return (
    <Link href={`/product/${_id}`} className="group bg-white rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden bg-neutral-light flex-shrink-0">
        <div 
          onClick={handleImageClick}
          className="relative w-full h-full cursor-pointer"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
          
          {/* Image indicators */}
          {images && images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
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
          <span className="text-lg font-bold text-foreground">₹{discountPrice || price}</span>
          {discountPrice && (
            <span className="text-sm text-neutral-dark line-through">₹{price}</span>
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
