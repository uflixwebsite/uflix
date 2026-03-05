import Image from 'next/image';

const defaults = {
  title: '',
  image: '',
  paragraphs: [] as string[],
  stats: [] as Array<{ value: string; label: string }>,
};

interface BrandStoryProps {
  data?: {
    title?: string;
    image?: string;
    paragraphs?: string[];
    stats?: Array<{ value: string; label: string }>;
  };
}

export default function BrandStory({ data }: BrandStoryProps) {
  const title = data?.title || defaults.title;
  const image = data?.image || defaults.image;
  const paragraphs = data?.paragraphs && data.paragraphs.length > 0 ? data.paragraphs : defaults.paragraphs;
  const stats = data?.stats && data.stats.length > 0 ? data.stats : defaults.stats;

  if (!title && !image && paragraphs.length === 0) {
    return (
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-200" />
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
              {[0,1,2].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded mb-3 last:w-3/4" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
            {image ? (
              <Image src={image} alt={title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
            {paragraphs.map((p, index) => (
              <p key={index} className="text-lg text-neutral-dark mb-6 leading-relaxed">
                {p}
              </p>
            ))}

            {stats.length > 0 && (
              <div className={`grid ${({'1':'grid-cols-1','2':'grid-cols-2','3':'grid-cols-3','4':'grid-cols-4'} as Record<string,string>)[String(Math.min(stats.length, 4))] || 'grid-cols-3'} gap-6 mb-8`}>
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">{stat.value}</div>
                    <div className="text-sm text-neutral-dark">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
