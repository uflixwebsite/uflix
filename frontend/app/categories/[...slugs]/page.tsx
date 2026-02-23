'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getCategoryByPath } from '@/services/categoryService';

export default function NestedCategoryPage() {
  const params = useParams();
  const slugs = params.slugs as string[];
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryChain, setCategoryChain] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const productsPerPage = 15;

  useEffect(() => {
    if (slugs?.length) {
      fetchCategoryAndProducts();
    }
  }, [slugs, currentPage, sortBy, priceRange, selectedSubcategories, selectedMaterials, inStockOnly]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch category chain
      const categoryRes = await getCategoryByPath(slugs);
      if (categoryRes?.success && categoryRes.data) {
        setCategoryChain(categoryRes.data);
      }

      // Fetch products for the deepest category/subcategory
      const deepestSlug = slugs[slugs.length - 1];
      
      // Build base filters
      let filters: any = {
        page: currentPage,
        limit: productsPerPage,
        sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        material: selectedMaterials,
        inStockOnly,
      };

      // Determine if this is a category or subcategory and set appropriate filter
      if (categoryRes?.success && categoryRes.data && categoryRes.data.length > 0) {
        const lastItem = categoryRes.data[categoryRes.data.length - 1];

        if (lastItem._id) {
          // Use categoryId — backend will query categoryRefs + legacy fields + all descendants
          filters.categoryId = lastItem._id;
        } else {
          const base = lastItem.path || lastItem.slug || lastItem.name || deepestSlug;
          if (selectedSubcategories && selectedSubcategories.length > 0) {
            filters.subcategory = selectedSubcategories[0];
          } else if (slugs.length > 1) {
            filters.subcategory = base;
          } else {
            filters.category = deepestSlug;
          }
        }
      } else {
        // Fallback to category filter
        filters.category = deepestSlug;
        if (selectedSubcategories && selectedSubcategories.length > 0) {
          filters.subcategory = selectedSubcategories[0];
        }
      }

      const productRes = await getProducts(filters);
      if (productRes?.success) {
        setProducts(productRes.data);
      }
    } catch (error) {
      console.error('Error fetching category and products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    ...categoryChain.map((cat, index) => ({
      label: cat.name,
      href: index === categoryChain.length - 1 ? undefined : `/categories/${slugs.slice(0, index + 1).join('/')}`,
    })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentCategory = categoryChain[categoryChain.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="homepage-main">
        {/* Category Banner */}
        {currentCategory && (
          <section className="relative h-96 bg-gradient-to-r from-accent/90 to-accent/70 flex items-center justify-center text-white">
            <div className="absolute inset-0">
              <img
                src={currentCategory.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80'}
                alt={currentCategory.name}
                className="w-full h-full object-cover opacity-30"
              />
            </div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-5xl font-bold mb-4 capitalize">{currentCategory.name}</h1>
              <p className="text-xl max-w-2xl mx-auto">
                {currentCategory.description || `Explore our ${currentCategory.name} collection`}
              </p>
            </div>
          </section>
        )}

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Products Section */}
        <section className="py-16 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <div className="lg:w-1/4">
                <FilterSidebar
                  currentCategory={slugs[slugs.length - 1]}
                  onFilterChange={(filters) => {
                    setSelectedSubcategories(filters.subcategories || []);
                    setSelectedMaterials(filters.materials || []);
                    setPriceRange(filters.priceRange || [0, 500000]);
                    setInStockOnly(filters.inStockOnly || false);
                    setSortBy(filters.sortBy || 'featured');
                  }}
                />
              </div>

              {/* Products Grid */}
              <div className="lg:w-3/4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentCategory?.name || 'Products'}
                  </h2>
                  <p className="text-neutral-dark">
                    {products.length > 0 
                      ? `Showing ${products.length} products`
                      : 'No products found'}
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No products found in this category.</p>
                    <Link href="/categories" className="text-accent hover:underline">
                      Browse all categories
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard 
                        key={product._id}
                        _id={product._id}
                        name={product.name}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        images={product.images}
                        category={product.category}
                        rating={product.rating}
                        reviews={product.reviews}
                        isActive={product.isActive}
                        availableOnQuotation={product.availableOnQuotation}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {products.length === productsPerPage && (
                  <div className="flex justify-center mt-12 space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 border border-gray-300 rounded-md bg-accent text-white">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
