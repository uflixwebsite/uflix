'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useAuthState } from '@/hooks/useAuthState';
import { getProducts } from '@/services/productService';
import { getNavbarConfig } from '@/services/navbarService';
import { getMegaMenu } from '@/services/megaMenuV2Service';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [megaMenuData, setMegaMenuData] = useState<any>(null);
  const [loadingMegaMenu, setLoadingMegaMenu] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuContainerRef = useRef<HTMLElement | null>(null);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'homes' | 'business'>('homes');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [openMobileMegaLink, setOpenMobileMegaLink] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isSignedIn, user } = useUser();
  const { status, userRole, isAdmin } = useAuthState();

  // Fetch mega menu data for hovered link
  const fetchMegaMenuForLink = async (linkUrl: string) => {
    try {
      setLoadingMegaMenu(true);
      setMegaMenuData(null);
      setActiveMegaCategory(null);
      const currentPath = pathname || '/';
      // Backend handles wildcard fallback automatically
      const response = await getMegaMenu(currentPath, linkUrl);
      const data = response?.data ?? null;
      setMegaMenuData(data);
      // Auto-select first enabled category
      if (data?.categories?.length) {
        const firstCat = data.categories
          .filter((c: any) => c.enabled)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
        if (firstCat) setActiveMegaCategory(firstCat.id);
      }
    } catch (error) {
      console.error('Error fetching mega menu:', error);
      setMegaMenuData(null);
    } finally {
      setLoadingMegaMenu(false);
    }
  };

  const handleNavLinkMouseEnter = (linkUrl: string) => {
    setHoveredLink(linkUrl);
    fetchMegaMenuForLink(linkUrl);
  };

  const closeMegaMenu = () => {
    setHoveredLink(null);
    setMegaMenuData(null);
    setActiveMegaCategory(null);
  };

  const handleUserMenuMouseEnter = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuMouseLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 2500); // 2.5 seconds delay
  };

  useEffect(() => {
    return () => {
      if (companyTimeoutRef.current) {
        clearTimeout(companyTimeoutRef.current);
      }
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  // Close mega menu when clicking outside the nav/mega menu area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        megaMenuContainerRef.current &&
        !megaMenuContainerRef.current.contains(e.target as Node)
      ) {
        setHoveredLink(null);
        setMegaMenuData(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch navbar links for current page
  useEffect(() => {
    const fetchNavbarLinks = async () => {
      try {
        const pagePath = pathname || '*';
        const data = await getNavbarConfig(pagePath);
        const links = data?.data?.configs?.[0]?.links || data?.data?.links;
        if (data?.success && links) {
          setNavLinks(links);
        }
      } catch (error) {
        console.error('Error fetching navbar links:', error);
        // Fallback links
        setNavLinks([
          { label: 'All Products', url: '/shop' },
          { label: 'Categories', url: '/categories' },
          { label: 'Projects', url: '/projects' },
          { label: 'For Business', url: '/business' },
          { label: 'Contact', url: '/contact' }
        ]);
      }
    };

    fetchNavbarLinks();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside company dropdown
      const companyDropdown = target.closest('[data-company-dropdown]');
      if (!companyDropdown && isCompanyOpen) {
        if (companyTimeoutRef.current) {
          clearTimeout(companyTimeoutRef.current);
        }
        setIsCompanyOpen(false);
      }
      
      // Check if click is outside user menu
      const userMenuDropdown = target.closest('[data-user-menu-dropdown]');
      if (!userMenuDropdown && isUserMenuOpen) {
        if (userMenuTimeoutRef.current) {
          clearTimeout(userMenuTimeoutRef.current);
        }
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompanyOpen, isUserMenuOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);
  
  return (
    <header ref={megaMenuContainerRef} className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">

      {/* ═══ ROW 1: Dark Utility Top Bar ═══ */}
      <div className="hidden lg:block bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5">
            {[
              { label: 'For Homes', href: '/categories' },
              { label: 'For Businesses', href: '/business' },
              { label: 'Shop Fittings', href: '/shop-fittings' },
            ].map((tab) => (
              <Link key={tab.href} href={tab.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  pathname === tab.href
                    ? 'bg-linear-to-r from-accent to-secondary text-white shadow-lg shadow-accent/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >{tab.label}</Link>
            ))}
          </div>
          <Link href="/contact?subject=become-dealer"
            className="group flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold tracking-wide bg-linear-to-r from-accent to-secondary text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-105 transition-all duration-300"
          >
            Become a Dealer
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      {/* ═══ ROW 2: Main Navigation Bar ═══ */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="shrink-0 transition-transform duration-300 hover:scale-105">
            <img src="/Logos/Uflix_Logo.png" alt="UFLIX" className="h-14 lg:h-18 w-auto object-contain" />
          </Link>

          {/* Center: Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={`${link.label}-${link.url}`} className="relative"
                onMouseEnter={() => handleNavLinkMouseEnter(link.url)}
              >
                <Link href={link.url}
                  className={`nav-link-fancy px-3 py-2 text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200 text-gray-700 hover:text-accent ${pathname === link.url ? 'active' : ''}`}
                >{link.label}</Link>
              </div>
            ))}
          </nav>

          {/* Right: Icon group (desktop) */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Search */}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex flex-col items-center gap-0.5 transition-all duration-200 text-gray-700 hover:text-accent"
              aria-label="Search"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[10px] font-medium leading-none">Search</span>
            </button>

            {/* Profile */}
            {isSignedIn ? (
              <div className="relative" onMouseEnter={handleUserMenuMouseEnter} onMouseLeave={handleUserMenuMouseLeave} data-user-menu-dropdown>
                <button className="flex flex-col items-center gap-0.5 transition-all duration-200 text-gray-700 hover:text-accent" aria-label="Account">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-[10px] font-medium leading-none">Profile</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-200 search-overlay-enter" onMouseEnter={handleUserMenuMouseEnter} onMouseLeave={handleUserMenuMouseLeave} data-user-menu-dropdown>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.firstName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <Link href={userRole === 'admin' ? "/admin" : "/profile"} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-accent/5 hover:text-accent transition-colors">
                      {userRole === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    <Link href="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-accent/5 hover:text-accent transition-colors">My Orders</Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <SignOutButton><button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Logout</button></SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-in" className="flex flex-col items-center gap-0.5 transition-all duration-200 text-gray-700 hover:text-accent" aria-label="Sign In">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[10px] font-medium leading-none">Profile</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 transition-all duration-200 text-gray-700 hover:text-accent" aria-label="Wishlist">
              <span className="relative">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold badge-pulse">{wishlistCount}</span>
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 transition-all duration-200 text-gray-700 hover:text-accent" aria-label="Cart">
              <span className="relative">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold badge-pulse">{cartCount}</span>
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">Cart</span>
            </Link>
          </div>

          {/* Right: Mobile icons + hamburger */}
          <div className="flex items-center gap-0.5 lg:hidden">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full text-gray-900" aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <Link href="/cart" className="relative p-2 rounded-full text-gray-900" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold badge-pulse">{cartCount}</span>
              )}
            </Link>
            <button className="p-2 rounded-full text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Full-width Mega Menu ═══ */}
      {hoveredLink && (
        <div className="absolute left-0 right-0 w-full z-200 shadow-2xl search-overlay-enter" style={{ top: '100%' }}>
          {loadingMegaMenu ? (
            <div className="bg-white border-t border-gray-100 flex items-center justify-center relative" style={{ height: '420px' }}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
            </div>
          ) : megaMenuData && megaMenuData.categories && megaMenuData.categories.length > 0 ? (
            <div className="bg-white border-t border-gray-100 flex relative" style={{ minHeight: '400px', maxHeight: '70vh' }}>
              
              {/* Close Button */}
              <button onClick={closeMegaMenu} className="absolute top-4 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10" aria-label="Close mega menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="shrink-0 overflow-y-auto" style={{ width: '300px', backgroundColor: '#f8f5f1' }}>
                {megaMenuData.categories.filter((cat: any) => cat.enabled).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((category: any) => (
                  <button key={category.id} onMouseEnter={() => setActiveMegaCategory(category.id)}
                    className={`w-full text-left px-10 py-5 text-[15px] border-b border-gray-200/40 transition-all duration-200 ${
                      activeMegaCategory === category.id
                        ? 'text-accent font-semibold bg-white border-l-[3px] border-l-accent'
                        : 'text-gray-600 font-normal hover:text-accent hover:pl-12'
                    }`}
                  >{category.name}</button>
                ))}
              </div>
              <div className="flex-1 px-12 pt-8 pb-12 bg-white overflow-y-auto">
                <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                  {megaMenuData.items.filter((item: any) => item.enabled && item.categoryId === activeMegaCategory).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((item: any) => (
                    <Link key={item.id} href={item.url} onClick={closeMegaMenu} className="group block">
                      {item.image ? (
                        <div className="overflow-hidden rounded-lg bg-gray-100" style={{ height: '220px' }}>
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gray-100 flex items-center justify-center" style={{ height: '220px' }}><span className="text-gray-400 text-sm">No image</span></div>
                      )}
                      <div className="flex items-center justify-between border-b border-gray-100 py-3 mt-1">
                        <span className="text-[15px] text-gray-800 group-hover:text-accent transition-colors">{item.title}</span>
                        <span className="text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all ml-2 text-lg">&rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Mobile Sidebar Backdrop ── */}
      <div className={`fixed inset-0 bg-black/50 z-290 lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)} />

      {/* ── Mobile Sidebar ── */}
      <div
        className={`fixed inset-0 h-full w-full max-w-none bg-white z-300 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <img src="/Logos/Uflix_Logo.png" alt="UFLIX" className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navLinks.map((link) => (
            <div key={`sidebar-${link.label}-${link.url}`} className="border-b border-gray-100 last:border-b-0">
              <div className="flex items-center px-5 py-3.5 text-[15px] font-medium text-gray-800 hover:bg-gray-50 hover:text-accent transition-colors">
                <Link href={link.url} className="flex-1 text-gray-800" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
                <button
                  aria-expanded={openMobileMegaLink === link.url}
                  aria-controls={openMobileMegaLink === link.url ? `mobile-mega-${link.url}` : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (openMobileMegaLink === link.url) {
                      setOpenMobileMegaLink(null);
                      setMegaMenuData(null);
                    } else {
                      setOpenMobileMegaLink(link.url);
                      fetchMegaMenuForLink(link.url);
                    }
                  }}
                  className="p-2 rounded-md text-gray-400 hover:text-accent"
                >
                  <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Mobile expanded mega menu for this link */}
              {openMobileMegaLink === link.url && megaMenuData && (
                <div id={`mobile-mega-${link.url}`} className="bg-white px-4 pb-4">
                  <div className="py-3 border-b border-gray-100 flex items-center justify-between">
                    <button className="flex items-center gap-3 text-sm text-gray-700 font-medium w-full text-left"
                      onClick={() => { router.push(link.url); setIsMenuOpen(false); }}
                    >
                      <span>Go to {link.label}</span>
                      <svg className="w-4 h-4 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Categories accordion */}
                  <div className="mt-3">
                    {megaMenuData.categories?.filter((c: any) => c.enabled).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((category: any) => (
                      <div key={category.id} className="border-b border-gray-100">
                        <button className="w-full flex items-center justify-between px-3 py-3 text-left text-gray-700 font-medium"
                          onClick={() => setActiveMegaCategory(prev => prev === category.id ? null : category.id)}
                          aria-expanded={activeMegaCategory === category.id}
                        >
                          <span className="text-sm">{category.name}</span>
                          <svg className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${activeMegaCategory === category.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {activeMegaCategory === category.id && (
                          <div className="px-3 py-3 grid grid-cols-2 gap-3">
                            {megaMenuData.items?.filter((it: any) => it.enabled && it.categoryId === category.id).map((item: any) => (
                              <Link key={item.id} href={item.url} onClick={() => { setIsMenuOpen(false); }} className="flex flex-col items-start gap-2">
                                {item.image ? (
                                  <div className="w-full h-32 overflow-hidden rounded-md bg-gray-100">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-full h-28 bg-gray-100 rounded-md" />
                                )}
                                <span className="text-sm text-gray-700 w-full">{item.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 bg-gray-50">
          {/* Signed-in user info */}
          {isSignedIn && (
            <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          )}

          {/* Icon row */}
          <div className="flex items-center justify-around px-4 py-4">
            <button
              onClick={() => { setIsMenuOpen(false); setTimeout(() => setIsSearchOpen(true), 300); }}
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">Search</span>
            </button>
            {isSignedIn ? (
              <Link
                href={userRole === 'admin' ? '/admin' : '/profile'}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Profile</span>
              </Link>
            ) : (
              <Link href="/sign-in" className="flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Sign In</span>
              </Link>
            )}
            <Link href="/wishlist" className="relative flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>
              <span className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">{wishlistCount}</span>
                )}
              </span>
              <span className="text-xs">Wishlist</span>
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>
              <span className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">{cartCount}</span>
                )}
              </span>
              <span className="text-xs">Cart</span>
            </Link>
          </div>

          {/* CTA + logout */}
          <div className="px-4 pb-4 space-y-2">
            {isSignedIn && (
              <SignOutButton>
                <button className="w-full text-center py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                  Logout
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Search Overlay ═══ */}
      {isSearchOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 z-50 search-overlay-enter" style={{ top: '100%', marginTop: '10px' }}>
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl w-[90vw] sm:w-125">
            <div className="p-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="search" placeholder="Search for furniture, chairs, tables..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900 placeholder:text-gray-400 text-sm [&::-webkit-search-cancel-button]:hidden"
                  autoFocus
                />
                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </form>

              {searchQuery.trim().length > 0 && (
                <div className="mt-2 bg-white rounded-xl border border-gray-100 max-h-100 overflow-y-auto shadow-lg">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.slice(0, 5).map((product) => (
                        <button key={product._id} onClick={() => handleProductClick(product._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors text-left"
                        >
                          <img src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name} className="w-12 h-12 object-cover rounded-lg shrink-0 bg-gray-100"
                            onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-accent font-semibold text-sm">₹{product.discountPrice || product.price}</span>
                              {product.discountPrice && (<span className="text-xs text-gray-400 line-through">₹{product.price}</span>)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 px-4 py-3">
                        <button onClick={handleSearchSubmit} className="text-xs text-accent hover:text-secondary font-semibold">
                          View all {searchResults.length} results for &quot;{searchQuery}&quot; →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-gray-500 text-sm font-medium">No products found</p>
                      <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

