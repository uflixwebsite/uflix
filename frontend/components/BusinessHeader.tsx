'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useAuthState } from '@/hooks/useAuthState';
import { getProducts } from '@/services/productService';
import { getSubcategories } from '@/services/subcategoryService';

export default function BusinessHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isSignedIn, user } = useUser();
  const { userRole } = useAuthState();

  // Subcategory nav state
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch subcategories for "for-businesses" category
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const data = await getSubcategories({ category: 'for-businesses' });
        setSubcategories(data.data || []);
      } catch (error) {
        console.error('Error fetching business subcategories:', error);
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch products when hovering on a subcategory
  useEffect(() => {
    if (!hoveredSubcategory) {
      setSubcategoryProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await getProducts({
          category: 'for-businesses',
          subcategory: hoveredSubcategory,
          limit: 4,
        });
        setSubcategoryProducts(data.data || []);
      } catch (error) {
        console.error('Error fetching subcategory products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [hoveredSubcategory]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const searchProducts = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await getProducts({ search: query, limit: 10 });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserMenuMouseEnter = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setIsUserMenuOpen(true);
  };

  const handleUserMenuMouseLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 2500);
  };

  const handleSubcategoryMouseEnter = (subcategoryName: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(subcategoryName);
    }, 150);
  };

  const handleSubcategoryMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(null);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(null);
    }, 300);
  };

  const textColor = 'text-gray-900';
  const hoverColor = 'hover:text-accent';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: For Homes / For Businesses Tabs */}
          <div className="hidden lg:flex gap-2">
            <Link
              href="/categories"
              className="px-6 py-2 rounded-lg font-semibold transition-all text-sm bg-white/90 text-foreground hover:bg-gray-100 shadow-md border border-gray-200"
            >
              For Homes
            </Link>
            <Link
              href="/business"
              className="px-6 py-2 rounded-lg font-semibold transition-all text-sm bg-accent text-white shadow-lg"
            >
              For Businesses
            </Link>
            <Link
              href="/shop-fittings"
              className="px-6 py-2 rounded-lg font-semibold transition-all text-sm bg-white/90 text-foreground hover:bg-gray-100 shadow-md border border-gray-200"
            >
              Shop Fittings
            </Link>
          </div>

          {/* Logo - Center */}
          <Link href="/" className="flex items-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <img src="/Logos/Uflix_Logo.png" alt="UFLIX" className="h-12 lg:h-16 w-auto object-contain" />
          </Link>

          {/* Right: Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 ${textColor} ${hoverColor} transition-colors`}
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isSignedIn ? (
              <div
                className="relative"
                onMouseEnter={handleUserMenuMouseEnter}
                onMouseLeave={handleUserMenuMouseLeave}
                data-user-menu-dropdown
              >
                <button className={`p-2 ${textColor} ${hoverColor} transition-colors`} aria-label="Account">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border py-2"
                    onMouseEnter={handleUserMenuMouseEnter}
                    onMouseLeave={handleUserMenuMouseLeave}
                    data-user-menu-dropdown
                  >
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.firstName || 'User'}</p>
                      <p className="text-xs text-neutral-dark">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <Link
                      href={userRole === 'admin' ? '/admin' : '/profile'}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      {userRole === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors">
                      My Orders
                    </Link>
                    <div className="border-t border-border mt-2 pt-2">
                      <SignOutButton>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          Logout
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-in" className={`p-2 ${textColor} ${hoverColor} transition-colors`} aria-label="Sign In">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            <Link href="/wishlist" className={`p-2 ${textColor} ${hoverColor} transition-colors relative`} aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className={`p-2 ${textColor} ${hoverColor} transition-colors relative`} aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 ${textColor}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 flex justify-center">
            <div className="max-w-2xl w-full mx-4">
              <div className="rounded-lg overflow-hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="search"
                    placeholder="Search for business furniture..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-black placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>

                {searchQuery.trim().length > 0 && (
                  <div className="bg-white border-t border-gray-200 max-h-[400px] overflow-y-auto rounded-b-lg shadow-lg">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-1">
                        {searchResults.slice(0, 5).map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product._id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                          >
                            <img
                              src={product.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-100"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-accent font-semibold text-sm">₹{product.discountPrice || product.price}</span>
                                {product.discountPrice && (
                                  <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-200 px-3 py-2">
                          <button
                            onClick={handleSearchSubmit}
                            className="text-xs text-accent hover:text-secondary font-medium"
                          >
                            View all {searchResults.length} results for &quot;{searchQuery}&quot; →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 px-4 text-center">
                        <p className="text-gray-500 text-sm">No products found</p>
                        <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Subcategory Navigation Bar */}
        <nav className="hidden lg:block border-t border-gray-200 relative">
          <div className="flex items-center justify-center space-x-8 py-3">
            <Link
              href="/business"
              className={`text-sm font-medium transition-colors ${
                pathname === '/business' ? 'text-accent' : 'text-gray-700 hover:text-accent'
              }`}
            >
              All Products
            </Link>
            {subcategories.map((sub) => (
              <div
                key={sub._id}
                className="relative"
                onMouseEnter={() => handleSubcategoryMouseEnter(sub.name)}
                onMouseLeave={handleSubcategoryMouseLeave}
              >
                <Link
                  href={`/business/products?subcategory=${encodeURIComponent(sub.name)}`}
                  className={`text-sm font-medium capitalize transition-colors ${
                    hoveredSubcategory === sub.name ? 'text-accent' : 'text-gray-700 hover:text-accent'
                  }`}
                >
                  {sub.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Hover Dropdown: Products from hovered subcategory */}
          {hoveredSubcategory && (
            <div
              className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50"
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{hoveredSubcategory}</h3>
                  <Link
                    href={`/business/products?subcategory=${encodeURIComponent(hoveredSubcategory)}`}
                    className="text-sm text-accent hover:text-secondary font-medium"
                  >
                    View All →
                  </Link>
                </div>

                {loadingProducts ? (
                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : subcategoryProducts.length > 0 ? (
                  <div className="grid grid-cols-4 gap-6">
                    {subcategoryProducts.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product._id}`}
                        className="group"
                      >
                        <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/300?text=No+Image';
                            }}
                          />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-accent">
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No products found in this subcategory</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 px-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-4">
              <div className="flex gap-2 mb-4">
                <Link
                  href="/categories"
                  className="flex-1 text-center px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-foreground hover:bg-gray-200 transition-colors"
                >
                  For Homes
                </Link>
                <Link
                  href="/business"
                  className="flex-1 text-center px-4 py-2 rounded-lg font-semibold text-sm bg-accent text-white"
                >
                  For Businesses
                </Link>
                <Link
                  href="/shop-fittings"
                  className="flex-1 text-center px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-foreground hover:bg-gray-200 transition-colors"
                >
                  Shop Fittings
                </Link>
              </div>

              <Link href="/business" className="text-sm font-medium text-gray-900 hover:text-accent transition-colors">
                All Products
              </Link>

              {subcategories.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Categories</p>
                  <div className="flex flex-col space-y-3 pl-2">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub._id}
                        href={`/business/products?subcategory=${encodeURIComponent(sub.name)}`}
                        className="text-sm font-medium text-gray-900 hover:text-accent transition-colors capitalize"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col space-y-3">
                  <Link href="/shop" className="text-sm font-medium text-gray-900 hover:text-accent transition-colors">
                    Shop
                  </Link>
                  <Link href="/contact" className="text-sm font-medium text-gray-900 hover:text-accent transition-colors">
                    Contact
                  </Link>
                </div>
              </div>

              {isSignedIn && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Account</p>
                  <div className="flex flex-col space-y-3 pl-2">
                    <Link
                      href={userRole === 'admin' ? '/admin' : '/profile'}
                      className="text-sm font-medium text-gray-900 hover:text-accent transition-colors"
                    >
                      {userRole === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    <Link href="/orders" className="text-sm font-medium text-gray-900 hover:text-accent transition-colors">
                      My Orders
                    </Link>
                    <SignOutButton>
                      <button className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors text-left">
                        Logout
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
