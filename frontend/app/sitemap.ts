import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const staticPaths = [
  '/',
  '/about',
  '/business',
  '/business/education',
  '/business/healthcare',
  '/business/products',
  '/business/steel-and-metal-fabrication-delhi-ncr',
  '/business/steel-fabrication-delhi-ncr',
  '/business/workspace',
  '/categories',
  '/collections',
  '/contact',
  '/industries',
  '/msfabrication-delhi-ncr',
  '/msfabrication-delhi-ncr/laser-pipe-cutting',
  '/msfabrication-delhi-ncr/laser-sheet-cutting',
  '/msfabrication-delhi-ncr/powder-coating',
  '/msfabrication-delhi-ncr/msfabrication',
  '/pages',
  '/privacy',
  '/products',
  '/projects',
  '/quality',
  '/refund',
  '/shipping',
  '/shop',
  '/shop-fittings',
  '/shop-fittings/products',
  '/shops',
  '/steel-fabrication',
  '/steel-fabrication-delhi-ncr',
  '/steel-fabrication-delhi-ncr/laser-pipe-cutting',
  '/steel-fabrication-delhi-ncr/laser-sheet-cutting',
  '/steel-fabrication-delhi-ncr/msfabrication',
  '/steel-fabrication-delhi-ncr/powder-coating',
  '/sustainability',
  '/terms',
].map((path) => `${siteUrl}${path}`);

const fetchJson = async (url: string) => {
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
};

const normalizeSlug = (value: string) => String(value || '').trim().replace(/^\/+|\/+$/g, '');

const buildCategoryPaths = (nodes: any[], prefix: string[] = []): string[] => {
  const paths: string[] = [];

  for (const node of nodes || []) {
    const slug = normalizeSlug(node.slug || node.name?.toLowerCase().replace(/\s+/g, '-'));
    if (!slug) continue;

    const currentPath = [...prefix, slug];
    const joinedPath = currentPath.join('/');

    paths.push(`${siteUrl}/category/${slug}`);
    paths.push(`${siteUrl}/categories/${joinedPath}`);

    if (currentPath.length === 1) {
      paths.push(`${siteUrl}/category/${joinedPath}`);
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      paths.push(...buildCategoryPaths(node.children, currentPath));
    }
  }

  return paths;
};

const fetchAllProducts = async () => {
  try {
    const data = await fetchJson(`${apiUrl}/products?limit=1000&page=1`);
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
};

const fetchCategoryTree = async () => {
  try {
    const data = await fetchJson(`${apiUrl}/categories/tree`);
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
};

const fetchCollections = async () => {
  try {
    const data = await fetchJson(`${apiUrl}/collections`);
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categoryTree, collections] = await Promise.all([
    fetchAllProducts(),
    fetchCategoryTree(),
    fetchCollections(),
  ]);

  const productEntries = products
    .filter((product: any) => product?._id)
    .map((product: any) => ({
      url: `${siteUrl}/products/${product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const collectionEntries = collections
    .filter((collection: any) => collection?.slug)
    .map((collection: any) => ({
      url: `${siteUrl}/collections/${encodeURIComponent(collection.slug)}`,
      lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const categoryEntries = buildCategoryPaths(categoryTree).map((url) => ({
    url,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  [...staticPaths, ...categoryEntries, ...collectionEntries, ...productEntries].forEach((entry) => {
    const normalized = typeof entry === 'string' ? { url: entry } : entry;
    uniqueEntries.set(normalized.url, normalized as MetadataRoute.Sitemap[number]);
  });

  return Array.from(uniqueEntries.values()).sort((a, b) => a.url.localeCompare(b.url));
}