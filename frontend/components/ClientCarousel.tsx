export default function ClientCarousel() {
  const clients = [
    { name: 'AIIMS Kalyani', image: '/Logos/aiimskalyani.png' },
    { name: 'Indian Oil', image: '/Logos/indianoil.png' },
    { name: 'CPWD', image: '/Logos/cpwd.png' },
    { name: 'L&T', image: '/Logos/lnt.png' },
    { name: 'NBCC', image: '/Logos/nbcc.png' },
    { name: 'IRCON', image: '/Logos/ircon.png' },
    { name: 'Jindal Steel', image: '/Logos/jindalsteel.png' },
    { name: 'Lifestyle', image: '/Logos/lifetsyle.png' },
    { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
    { name: 'Daikin', image: '/Logos/daikin.jpg' },
    { name: 'IGL', image: '/Logos/igl.png' },
    { name: 'HLL', image: '/Logos/hll.jpg' }
  ];

  return (
    <section className="py-12 bg-white border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral-dark mb-6 uppercase tracking-wide font-medium">
          Trusted by Leading Organizations
        </p>
        <div className="relative flex overflow-hidden">
          <div className="flex animate-marquee gap-16">
            {[...clients, ...clients, ...clients].map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[240px] h-28"
              >
                <img
                  src={client.image}
                  alt={client.name}
                  className="object-contain h-24 w-56"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
