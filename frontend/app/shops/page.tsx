import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ShopsPage() {
  const shops = [
    {
      id: 1,
      name: 'Uflix Mumbai Central',
      address: '123 MG Road, Mumbai, Maharashtra 400001',
      phone: '+91 22 1234 5678',
      hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    },
    {
      id: 2,
      name: 'Uflix Delhi NCR',
      address: '456 Connaught Place, New Delhi 110001',
      phone: '+91 11 2345 6789',
      hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    },
    {
      id: 3,
      name: 'Uflix Bangalore',
      address: '789 Brigade Road, Bangalore, Karnataka 560001',
      phone: '+91 80 3456 7890',
      hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
      image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
    },
    {
      id: 4,
      name: 'Uflix Hyderabad',
      address: '321 Banjara Hills, Hyderabad, Telangana 500034',
      phone: '+91 40 4567 8901',
      hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
      image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-96 bg-gradient-to-r from-accent to-secondary">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-5xl font-bold mb-4">Visit Our Stores</h1>
              <p className="text-xl">Experience Uflix furniture in person at our showrooms</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {shops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow">
                  <div className="relative h-64">
                    <Image
                      src={shop.image}
                      alt={shop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{shop.name}</h2>
                    
                    <div className="space-y-3 text-neutral-dark">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{shop.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{shop.phone}</span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{shop.hours}</span>
                      </div>
                    </div>
                    
                    <button className="mt-6 w-full btn-primary py-2.5 rounded-md font-semibold transition-colors">
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Can't Visit a Store?</h2>
            <p className="text-lg text-neutral-dark mb-8">Shop online and get free delivery on orders above Rs. 15,000</p>
            <a href="/shop" className="inline-block btn-primary px-8 py-3 rounded-md font-semibold transition-colors">
              Shop Online
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
