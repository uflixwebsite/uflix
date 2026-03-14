'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getHomeSettings } from '@/services/homeSettingsService';

export default function SiteButtonThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.setAttribute('data-route', pathname || '/');
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const applyTheme = async () => {
      try {
        const res = await getHomeSettings();
        if (!mounted) return;
        const theme = res?.data?.siteButtonTheme;
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--site-btn-primary-bg', theme.primaryBg || '#FF6B35');
        root.style.setProperty('--site-btn-primary-text', theme.primaryText || '#FFFFFF');
        root.style.setProperty('--site-btn-primary-hover-bg', theme.primaryHoverBg || '#C73E1D');
        root.style.setProperty('--site-btn-secondary-bg', theme.secondaryBg || '#C73E1D');
        root.style.setProperty('--site-btn-secondary-text', theme.secondaryText || '#FFFFFF');
        root.style.setProperty('--site-btn-secondary-hover-bg', theme.secondaryHoverBg || '#E85A2A');
        root.style.setProperty('--site-btn-outline-bg', theme.outlineBg || 'transparent');
        root.style.setProperty('--site-btn-outline-text', theme.outlineText || '#FF6B35');
        root.style.setProperty('--site-btn-outline-border', theme.outlineBorder || '#FF6B35');
        root.style.setProperty('--site-btn-outline-hover-bg', theme.outlineHoverBg || '#FF6B35');
        root.style.setProperty('--site-btn-outline-hover-text', theme.outlineHoverText || '#FFFFFF');
      } catch {
        // Keep defaults if home settings are unavailable
      }
    };

    // Apply theme immediately on mount
    applyTheme();

    // Poll for theme updates every 3 seconds
    pollInterval = setInterval(applyTheme, 3000);

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return null;
}
