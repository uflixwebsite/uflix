const defaultClients: Array<{ name: string; image: string }> = [];

interface ClientCarouselProps {
  title?: string;
  logos?: Array<{ name: string; image: string }>;
}

export default function ClientCarousel({ title, logos }: ClientCarouselProps) {
  const clients = logos && logos.length > 0 ? logos : defaultClients;

  if (clients.length === 0) {
    return (
      <section className="py-12 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-dark mb-6 uppercase tracking-wide font-medium">
            {title || 'Trusted by Leading Organizations'}
          </p>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-300 text-sm">Add client logos in the admin panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral-dark mb-6 uppercase tracking-wide font-medium">
          {title || 'Trusted by Leading Organizations'}
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
