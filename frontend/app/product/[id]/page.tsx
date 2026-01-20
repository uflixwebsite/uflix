'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProduct } from '@/services/productService';

const relatedProducts: any[] = [];

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(params.id as string);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: parseInt(product._id),
        name: product.name,
        price: `₹${product.discountPrice || product.price}`,
        image: product.images[0]?.url,
        originalPrice: product.discountPrice ? `₹${product.price}` : undefined,
      });
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const productId = parseInt(product._id);
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: `₹${product.discountPrice || product.price}`,
        image: product.images[0]?.url,
        originalPrice: product.discountPrice ? `₹${product.price}` : undefined,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              📦
            </div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-accent text-white px-6 py-2 rounded-md hover:bg-secondary transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Shop', href: '/shop' },
          { label: product.category, href: `/category/${product.category.toLowerCase().replace(' ', '-')}` },
          { label: product.name }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="relative h-96 md:h-[500px] bg-white rounded-2xl overflow-hidden mb-4 border border-gray-200">
              <Image
                src={product.images[selectedImage]?.url}
                alt={product.name}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-accent' : 'border-gray-200'
                  }`}
                >
                  <Image src={image.url} alt={`${product.name} ${index + 1}`} fill className="object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-neutral-dark">
                  {product.ratings?.average || 0} ({product.ratings?.count || 0} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-accent">₹{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <span className="text-xl text-neutral-dark line-through">₹{product.price}</span>
              )}
            </div>

            <p className="text-neutral-dark mb-6 leading-relaxed">{product.description}</p>

            <div className="bg-neutral-light rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.specifications?.map((spec: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{spec.key}: {spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-accent hover:bg-secondary text-white py-4 rounded-lg font-semibold transition-colors"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`px-6 py-4 border-2 rounded-lg transition-colors ${
                  isInWishlist(parseInt(product._id))
                    ? 'bg-accent border-accent text-white'
                    : 'border-accent text-accent hover:bg-accent hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill={isInWishlist(parseInt(product._id)) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Free shipping on orders above ₹15,000</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>1 Year warranty</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              {(['description', 'specifications', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-accent text-accent'
                      : 'text-neutral-dark hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-neutral-dark leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between p-4 bg-neutral-light rounded-lg">
                  <span className="font-medium">{key}</span>
                  <span className="text-neutral-dark">{value as string}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <p className="text-neutral-dark">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Related Products</h2>
          {relatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                📦
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Related Products</h3>
              <p className="text-gray-500">Check out our other products for more options!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
