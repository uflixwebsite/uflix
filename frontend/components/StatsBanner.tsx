'use client';

interface Stat {
  value: string;
  label: string;
}

interface StatsBannerProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  stats?: Stat[];
}

const defaultStats: Stat[] = [];

export default function StatsBanner({ title, subtitle, bgColor, stats: propStats }: StatsBannerProps) {
  const stats = propStats && propStats.length > 0 ? propStats : defaultStats;
  const bg = bgColor || '#f05a54';
  const displayTitle = title || 'Our Numbers';
  const displaySubtitle = subtitle || '';

  return (
    <section className="py-16 text-white" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {displayTitle && (
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            {displayTitle}
          </h2>
        )}
        {displaySubtitle && (
          <p className="text-base text-white/85 mb-12">
            {displaySubtitle}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
          {stats.length > 0 ? stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-bold mb-3">{stat.value}</span>
              <span className="text-sm md:text-base text-white/85 max-w-[180px] leading-snug">{stat.label}</span>
            </div>
          )) : (
            [0,1,2].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-5xl md:text-6xl font-bold mb-3 text-white/30">—</span>
                <span className="text-sm text-white/40">Add stat {i + 1}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
