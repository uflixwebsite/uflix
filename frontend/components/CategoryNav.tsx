import Link from "next/link";

const categories = [
  {
    name: "Living Room",
    slug: "living-room",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 9.5L12 4l9 5.5M3 9.5V20h18V9.5M3 9.5l9 5.5m0-5.5l9 5.5m-9-5.5V20m-6-4h12"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 16h14v4H5z"
        />
      </svg>
    ),
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12h18M3 12v6h18v-6M3 12V9a2 2 0 012-2h14a2 2 0 012 2v3M5 18v2m14-2v2"
        />
      </svg>
    ),
  },
  {
    name: "Dining",
    slug: "dining",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 10h18M3 10a2 2 0 012-2h14a2 2 0 012 2M3 10v8a2 2 0 002 2h14a2 2 0 002-2v-8M7 8V6m10 2V6"
        />
      </svg>
    ),
  },
  {
    name: "Office",
    slug: "office",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: "Outdoor",
    slug: "outdoor",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 21h18M5 21V10l7-7 7 7v11M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"
        />
      </svg>
    ),
  },
  {
    name: "Storage",
    slug: "storage",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
];

export default function CategoryNav() {
  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="
            flex gap-6 py-6
            overflow-x-auto scrollbar-hide
            justify-start sm:justify-center
          "
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="
                flex flex-col items-center justify-center
                min-w-[110px]
                p-4 rounded-lg
                border border-border
                transition-all
                hover:border-accent hover:shadow-md
                group
              "
            >
              <div
                className="
                  h-10 w-10 mb-2
                  flex items-center justify-center
                  text-neutral-dark
                  transition-transform transition-colors
                  group-hover:text-accent group-hover:scale-110
                "
              >
                {category.icon}
              </div>

              <span className="text-sm font-medium text-center whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
