'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => clearInterval(interval);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    // Simple navigation detection
    const timer = setTimeout(() => {
      handleStart();
      setTimeout(handleComplete, 500);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
          <div 
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </>
  );
}
