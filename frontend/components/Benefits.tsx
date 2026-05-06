const iconMap: Record<string, JSX.Element> = {
  check: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M5 13l4 4L19 7" /></svg>,
  gift: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  shield: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  refresh: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  truck: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  star: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  heart: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  clock: <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const defaultBenefits: Array<{ icon: string; title: string; description?: string }> = [];

interface BenefitsProps {
  data?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ icon?: string; title: string; description?: string }>;
  };
}

export default function Benefits({ data }: BenefitsProps) {
  const sectionTitle = data?.title || '';
  const sectionSubtitle = data?.subtitle || '';
  const benefits = data?.items && data.items.length > 0 ? data.items : defaultBenefits;

  if (!sectionTitle && benefits.length === 0) {
    return (
      <section className="py-16 bg-[#fcfbf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-100 rounded mx-auto mb-4" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0,1,2,3].map((i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-[#ece3d7] bg-white/70 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4" />
                <div className="h-5 w-28 bg-gray-100 rounded mx-auto mb-2" />
                <div className="h-4 w-36 bg-gray-100 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#fcfbf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">{sectionTitle}</h2>
          <p className="text-lg text-[#3f3830] max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
            {benefits.map((benefit, index) => (
              <div key={index} className="snap-center shrink-0 w-[86vw] max-w-sm text-center p-6 rounded-2xl border border-[#ece3d7] shadow-sm bg-[#fffdf9]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#fff1e8] border border-[#ffd7c2]">
                  {(iconMap[benefit.icon || 'check'] || iconMap.check)}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-black">{benefit.title}</h3>
                <p className="text-[#4a433b] line-clamp-3">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-2xl border border-[#ece3d7] bg-[#fffdf9] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#fff1e8] border border-[#ffd7c2]">
                {(iconMap[benefit.icon || 'check'] || iconMap.check)}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">{benefit.title}</h3>
              <p className="text-[#4a433b]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
