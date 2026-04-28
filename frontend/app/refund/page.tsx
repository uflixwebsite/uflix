'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-black mb-4">Return and Refund Policy - UFLIX</h1>
        <p className="text-sm text-neutral-dark mb-8">Last Updated: 18-04-2026</p>
        
        <div className="max-w-none text-[16px] leading-7 text-neutral-800">

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">1. Eligibility for Return</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product damaged or defective</li>
                <li>Wrong product delivered</li>
                <li>Missing parts</li>
              </ul>
              <p className="mt-3">Return request must be raised within 48 hours of delivery.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">2. Non-Returnable Items</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized furniture</li>
                <li>Used or customer-damaged products</li>
                <li>Products without original packaging</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">3. Return Process</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Email us with order ID and product images</li>
                <li>Our team will verify the request</li>
                <li>Pickup will be arranged after approval</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">4. Refund Policy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refunds are processed within 5-7 working days after approval</li>
                <li>Refund is credited to the original payment method</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">5. Replacement</h2>
              <p>Replacement is available based on stock availability.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Contact for Return and Refund Support</h2>
              <div className="space-y-2">
                <p>Email: ebusiness@uflix.co.in</p>
                <p>Phone: 8448448966</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">
              For full website terms, please review our{' '}
              <Link href="/terms" className="text-accent hover:underline">Terms and Conditions</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
