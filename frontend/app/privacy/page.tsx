'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-black mb-4">Privacy Policy - UFLIX Interio Private Limited</h1>
        <p className="text-sm text-neutral-dark mb-8">Last Updated: 18-04-2026</p>
        
        <div className="max-w-none text-[16px] leading-7 text-neutral-800">
          <p className="mb-6">
            At UFLIX, we value your privacy and are committed to protecting your personal information.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">1. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-bold text-black">Name, phone number, and email address</span></li>
                <li><span className="font-bold text-black">Shipping and billing address</span></li>
                <li><span className="font-bold text-black">Payment details</span> (secured via third-party payment gateways)</li>
                <li><span className="font-bold text-black">Business details</span> (for B2B clients)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Order processing and delivery</li>
                <li>Customer support</li>
                <li>Improving website and services</li>
                <li>Marketing and promotional communication <span className="font-bold text-black">only with consent</span></li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">3. Data Protection</h2>
              <p>
                We implement <span className="font-bold text-black">industry-standard security measures</span> to protect your data. However,
                no online transmission is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">4. Sharing of Information</h2>
              <p className="mb-3">We do not sell your data. Information may be shared with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Logistics partners</li>
                <li>Payment gateways</li>
                <li>Government authorities (if required)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">5. Cookies</h2>
              <p>Our website uses cookies to enhance user experience and analyze traffic.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">6. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You can request <span className="font-bold text-black">access</span> to your personal data</li>
                <li>You can request <span className="font-bold text-black">correction</span> of your personal data</li>
                <li>You can request <span className="font-bold text-black">deletion</span> of your personal data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">7. Contact Us</h2>
              <p className="mb-4">If you have questions about this policy, contact:</p>
              <div className="space-y-2">
                <p><span className="font-bold text-black">UFLIX Interio Private Limited</span></p>
                <p><span className="font-bold text-black">Email:</span> ebusiness@uflix.co.in</p>
                <p><span className="font-bold text-black">Phone:</span> 8448448966</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">
              For complete legal details, please review our{' '}
              <Link href="/terms" className="text-accent hover:underline">Terms and Conditions</Link> and{' '}
              <Link href="/refund" className="text-accent hover:underline">Return and Refund Policy</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
