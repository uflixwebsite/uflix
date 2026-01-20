'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading when pathname changes
    setIsLoading(true);
    const timeoutId = setTimeout(() => setIsLoading(false), 800);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    // Additional detection for any navigation
    let timeoutId: NodeJS.Timeout;
    
    const handleNavigation = () => {
      setIsLoading(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsLoading(false), 800);
    };

    // Override navigation methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      handleNavigation();
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      handleNavigation();
      return originalReplaceState.apply(history, args);
    };

    // Handle all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.includes('#')) {
        handleNavigation();
      }
    };

    // Handle popstate (back/forward buttons)
    const handlePopState = () => handleNavigation();

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-gray-100">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent"></div>
            <span className="text-sm font-medium text-gray-700">Loading...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
