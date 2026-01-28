'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/services/cartService';
import { useAuth } from '@clerk/nextjs';

export default function CartPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, [isSignedIn]);

  const fetchCart = async () => {
    try {
      // Always use localStorage for cart (simpler and works for both guest and logged-in users)
      const localCart = localStorage.getItem('uflix-cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ''));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    try {
      // Always update localStorage
      const localCart = JSON.parse(localStorage.getItem('uflix-cart') || '[]');
      const updatedCart = localCart.map((item: any) => 
        String(item.id) === String(productId) ? { ...item, quantity } : item
      ).filter((item: any) => item.quantity > 0);
      localStorage.setItem('uflix-cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = (productId: string | number) => {
    try {
      // Always remove from localStorage
      const localCart = JSON.parse(localStorage.getItem('uflix-cart') || '[]');
      const updatedCart = localCart.filter((item: any) => String(item.id) !== String(productId));
      localStorage.setItem('uflix-cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  const subtotal = cart && cart.length > 0 
    ? cart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0)
    : 0;
  const shipping = subtotal > 15000 ? 0 : 500;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />
        
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <svg className="w-24 h-24 mx-auto mb-4 text-neutral-dark opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-neutral-dark mb-6">Add some furniture to get started!</p>
            <Link href="/shop" className="inline-block bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-full font-medium transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold">Cart Items ({cart.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.id} className="p-6 flex gap-6">
                      <div className="relative w-32 h-32 flex-shrink-0 bg-neutral-light rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <Link href={`/product/${item.id}`} className="text-lg font-semibold hover:text-accent transition-colors">
                            {item.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-neutral-dark hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <p className="text-2xl font-bold text-accent mb-4">{item.price}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          
                          <span className="text-lg font-semibold">
                            ₹{(parsePrice(item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/shop" className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-dark">Subtotal (incl. all taxes)</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-dark">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  {subtotal < 15000 && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm">
                      <p className="text-accent">
                        Add ₹{(15000 - subtotal).toLocaleString()} more to get FREE shipping!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-accent">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-accent hover:bg-accent-dark text-white py-4 rounded-lg font-medium transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>
                
                <div className="space-y-3 text-sm text-neutral-dark">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
