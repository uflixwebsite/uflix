'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCart } from '@/services/cartService';
import { createOrder } from '@/services/orderService';
import { processRazorpayPayment } from '@/services/paymentService';
import { getCurrentUser } from '@/services/authService';

export default function CheckoutPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'prompt' | 'guest' | 'user'>('prompt');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    // If user is signed in, skip prompt and go to user mode
    if (isSignedIn) {
      setCheckoutMode('user');
      fetchCart();
      loadUserData();
    } else {
      // Show prompt for guest/login
      setLoading(false);
    }
  }, [isSignedIn]);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data.data);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData.data && userData.data.addresses) {
        setAddresses(userData.data.addresses);
        const defaultAddr = userData.data.addresses.find((a: any) => a.isDefault);
        setSelectedAddress(defaultAddr || userData.data.addresses[0]);
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
    }
  };

  const handleContinueAsGuest = () => {
    setCheckoutMode('guest');
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    // Validate guest info if guest checkout
    if (checkoutMode === 'guest') {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        alert('Please fill in your contact information');
        return;
      }
    }

    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    // For guest checkout, get items from localStorage cart
    // For user checkout, get from backend cart
    let orderItems = [];
    if (checkoutMode === 'guest') {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length === 0) {
        alert('Your cart is empty');
        return;
      }
      orderItems = localCart.map((item: any) => ({
        product: item.id,
        quantity: item.quantity,
      }));
    } else {
      if (!cart || cart.items.length === 0) {
        alert('Your cart is empty');
        return;
      }
      orderItems = cart.items.map((item: any) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));
    }

    setProcessing(true);

    try {
      const orderData: any = {
        items: orderItems,
        shippingAddress: selectedAddress,
        paymentMethod,
      };

      // Add guest customer info if guest checkout
      if (checkoutMode === 'guest') {
        orderData.guestCustomer = guestInfo;
      }

      const orderResponse = await createOrder(orderData);
      const order = orderResponse.data;

      if (paymentMethod === 'razorpay') {
        await processRazorpayPayment(
          {
            totalPrice: order.totalPrice,
            orderId: order._id,
            shippingAddress: selectedAddress,
            userEmail: checkoutMode === 'guest' ? guestInfo.email : '',
          },
          (successData: any) => {
            // Clear local cart for guest
            if (checkoutMode === 'guest') {
              localStorage.removeItem('cart');
            }
            router.push(`/order-confirmation/${order._id}`);
          },
          (error: any) => {
            alert('Payment failed: ' + error);
            setProcessing(false);
          }
        );
      } else {
        // Clear local cart for guest
        if (checkoutMode === 'guest') {
          localStorage.removeItem('cart');
        }
        router.push(`/order-confirmation/${order._id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  // Show login/signup/guest prompt
  if (checkoutMode === 'prompt') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-center mb-4">Checkout</h1>
          <p className="text-center text-neutral-dark mb-12">Choose how you'd like to continue</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Login/Signup Option */}
            <div className="bg-white rounded-lg border-2 border-accent p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Sign In / Sign Up</h2>
              <p className="text-neutral-dark mb-6 text-sm">
                Track your orders, save addresses, and enjoy faster checkout
              </p>
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  className="block w-full bg-accent hover:bg-secondary text-white py-3 rounded-md font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block w-full border-2 border-accent text-accent hover:bg-accent hover:text-white py-3 rounded-md font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Guest Checkout Option */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Continue as Guest</h2>
              <p className="text-neutral-dark mb-6 text-sm">
                Quick checkout without creating an account
              </p>
              <button
                onClick={handleContinueAsGuest}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-md font-semibold transition-colors"
              >
                Checkout as Guest
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link href="/products" className="text-accent hover:text-secondary">
              ← Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  let subtotal = 0;
  if (checkoutMode === 'guest') {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    subtotal = localCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  } else {
    subtotal = cart?.totalPrice || 0;
  }
  
  const tax = subtotal * 0.18;
  const shipping = subtotal > 5000 ? 0 : 200;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Guest Information (only for guest checkout) */}
            {checkoutMode === 'guest' && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold mb-4">Your Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-dark mt-2">* Required for order confirmation and updates</p>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-accent hover:text-secondary text-sm font-semibold"
                >
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-4">New Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => {
                        setAddresses([...addresses, newAddress]);
                        setSelectedAddress(newAddress);
                        setShowAddressForm(false);
                      }}
                      className="col-span-2 bg-accent text-white py-2 rounded-md hover:bg-secondary"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === addr ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{addr.name}</p>
                        <p className="text-sm text-neutral-dark">{addr.phone}</p>
                        <p className="text-sm text-neutral-dark mt-2">
                          {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      {selectedAddress === addr && (
                        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Online Payment (Razorpay)</p>
                        <p className="text-sm text-neutral-dark">Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                    </div>
                    {paymentMethod === 'razorpay' && (
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-neutral-dark">Pay when you receive</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cart.items.map((item: any) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images[0] && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product.images[0].url}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-2">{item.product.name}</p>
                      <p className="text-sm text-neutral-dark">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-accent">
                        ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-dark">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-dark">Tax (18% GST)</span>
                  <span className="font-semibold">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-dark">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="w-full bg-accent hover:bg-secondary text-white py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-neutral-dark text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
