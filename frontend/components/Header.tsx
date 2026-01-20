'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { getCurrentUser } from '@/services/authService';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'homes' | 'business'>('homes');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn) {
        try {
          const userData = await getCurrentUser();
          setUserRole(userData.data?.role || 'user');
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      }
    };

    fetchUserRole();
  }, [isSignedIn]);
  
  // Text color based on page
  const textColor = isHomePage ? 'text-white' : 'text-gray-900';
  const hoverColor = 'hover:text-accent';

  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: For Homes/For Businesses Tabs - Hidden on mobile */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={() => setActiveTab('homes')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'homes'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-white/90 text-foreground hover:bg-white shadow-md'
              }`}
            >
              For Homes
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'business'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-white/90 text-foreground hover:bg-white shadow-md'
              }`}
            >
              For Businesses
            </button>
          </div>

          {/* Logo - Left on mobile, Center on desktop */}
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
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button 
                  className={`p-2 ${textColor} ${hoverColor} transition-colors`} 
                  aria-label="Account"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.firstName || 'User'}</p>
                      <p className="text-xs text-neutral-dark">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    
                    <Link 
                      href={userRole === 'admin' ? "/admin" : "/profile"} 
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      {userRole === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    
                    <Link 
                      href="/orders" 
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
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
              <Link 
                href="/sign-in" 
                className={`p-2 ${textColor} ${hoverColor} transition-colors`} 
                aria-label="Sign In"
              >
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
          <div className="absolute top-full left-0 right-0 mt-2 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search for furniture..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent shadow-xl"
                  autoFocus
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}


        <nav className={`hidden lg:flex items-center justify-center space-x-8 py-4 border-t ${isHomePage ? 'border-white/20' : 'border-gray-200'}`}>
          <Link href="/shop" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            Shop
          </Link>
          <Link href="/categories" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            Categories
          </Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsCompanyOpen(true)}
            onMouseLeave={() => setIsCompanyOpen(false)}
          >
            <button className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors flex items-center gap-1`}>
              Company
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCompanyOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-border py-4 px-6">
                <div className="space-y-4">
                  <div>
                    <Link href="/about" className="block font-semibold text-accent hover:text-secondary mb-1">
                      About UFLIX
                    </Link>
                    <p className="text-xs text-neutral-dark mb-2">Leading manufacturer of furniture and metal fabrication solutions</p>
                    <Link href="/about" className="text-xs text-accent hover:underline">Read more →</Link>
                  </div>
                  
                  <div className="border-t border-border pt-3">
                    <Link href="/quality" className="block font-semibold text-accent hover:text-secondary mb-1">
                      Quality & Certifications
                    </Link>
                    <p className="text-xs text-neutral-dark mb-2">ISO 9001:2015 certified with 1-year warranty</p>
                    <Link href="/quality" className="text-xs text-accent hover:underline">Read more →</Link>
                  </div>
                  
                  <div className="border-t border-border pt-3">
                    <Link href="/sustainability" className="block font-semibold text-accent hover:text-secondary mb-1">
                      Sustainability
                    </Link>
                    <p className="text-xs text-neutral-dark mb-2">Eco-friendly practices with 85% waste recycling</p>
                    <Link href="/sustainability" className="text-xs text-accent hover:underline">Read more →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/shop-fittings" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            Shop Fittings
          </Link>
          <Link href="/projects" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            Projects
          </Link>
          <Link href="/business" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            For Business
          </Link>
          <Link href="/contact" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>
            Contact
          </Link>
        </nav>

        {isMenuOpen && (
          <div className="lg:hidden py-4 px-4 border-t border-white/20 bg-white/10 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <Link href="/shop" className="text-sm font-medium text-white hover:text-accent transition-colors">
                Shop
              </Link>
              <Link href="/categories" className="text-sm font-medium text-white hover:text-accent transition-colors">
                Categories
              </Link>
              
              <div className="border-t border-white/20 pt-4">
                <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide">Company</p>
                <div className="flex flex-col space-y-3 pl-2">
                  <Link href="/about" className="text-sm font-medium text-white hover:text-accent transition-colors">
                    About UFLIX
                  </Link>
                  <Link href="/quality" className="text-sm font-medium text-white hover:text-accent transition-colors">
                    Quality & Certifications
                  </Link>
                  <Link href="/sustainability" className="text-sm font-medium text-white hover:text-accent transition-colors">
                    Sustainability
                  </Link>
                </div>
              </div>

              <Link href="/shop-fittings" className="text-sm font-medium text-white hover:text-accent transition-colors">
                Shop Fittings
              </Link>
              <Link href="/projects" className="text-sm font-medium text-white hover:text-accent transition-colors">
                Projects
              </Link>
              <Link href="/business" className="text-sm font-medium text-white hover:text-accent transition-colors">
                For Business
              </Link>
              <Link href="/contact" className="text-sm font-medium text-white hover:text-accent transition-colors">
                Contact
              </Link>

              {isSignedIn && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide">Account</p>
                  <div className="flex flex-col space-y-3 pl-2">
                    <Link 
                      href={userRole === 'admin' ? "/admin" : "/profile"} 
                      className="text-sm font-medium text-white hover:text-accent transition-colors"
                    >
                      {userRole === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    <Link 
                      href="/orders" 
                      className="text-sm font-medium text-white hover:text-accent transition-colors"
                    >
                      My Orders
                    </Link>
                    <SignOutButton>
                      <button className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors text-left">
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
