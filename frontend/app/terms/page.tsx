'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-black mb-4">Terms and Conditions - UFLIX</h1>
        <p className="text-sm text-neutral-dark mb-8">Last Updated: 18-04-2026</p>
        
        <div className="max-w-none text-[16px] leading-7 text-neutral-800">
          <p className="mb-6">
            By using our website, you agree to the terms and policies below.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">1. General</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>By using our website, you agree to follow our terms and policies.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">2. Product Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We try to display accurate product details.</li>
                <li>Slight variations may occur due to lighting or screen differences.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">3. Pricing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prices are subject to change without notice.</li>
                <li>GST and shipping charges may apply.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">4. Orders</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>UFLIX reserves the right to cancel any order.</li>
                <li>Bulk (B2B) orders may have separate agreements.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">5. Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We accept secure payments via trusted payment gateways.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">6. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All content on the website (images, text, design) belongs to UFLIX.</li>
                <li>Content cannot be reused without permission.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">7. Liability</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>UFLIX is not responsible for delays caused by logistics or external factors.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">8. B2B Specific Terms</h2>
              <h3 className="text-xl font-bold text-black mt-2 mb-2">Bulk Orders</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pricing may vary based on quantity.</li>
                <li>Custom manufacturing timelines apply.</li>
              </ul>

              <h3 className="text-xl font-bold text-black mt-4 mb-2">Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Advance payment is required.</li>
                <li>Credit terms are available only for approved partners.</li>
              </ul>

              <h3 className="text-xl font-bold text-black mt-4 mb-2">Cancellation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Once production starts, the order cannot be canceled.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">9. Shipping Policy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivery time: <span className="font-bold text-black">5-10 working days</span>.</li>
                <li>Delays may occur due to location or unforeseen issues.</li>
                <li>Tracking details are shared after dispatch.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-2">
                <p><span className="font-bold text-black">UFLIX Interio Private Limited</span></p>
                <p><span className="font-bold text-black">Email:</span> ebusiness@uflix.co.in</p>
                <p><span className="font-bold text-black">Phone:</span> 8448448966</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
