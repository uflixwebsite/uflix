'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-black mb-4">Shipping Policy - UFLIX</h1>
        <p className="text-sm text-neutral-dark mb-8">Last Updated: 18-04-2026</p>

        <div className="max-w-none text-[16px] leading-7 text-neutral-800">
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <span className="font-bold text-black">Delivery time:</span> 5-10 working days.
            </li>
            <li>
              Delays may occur due to delivery location, weather conditions, transport disruptions, or other unforeseen issues.
            </li>
            <li>
              <span className="font-bold text-black">Tracking details</span> are shared after dispatch.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
