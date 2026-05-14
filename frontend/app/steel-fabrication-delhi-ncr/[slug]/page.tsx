'use client';

import DynamicPage from '@/components/DynamicPage';
import { useParams } from 'next/navigation';

export default function SteelFabricationChild() {
  const params = useParams();
  const raw = (params?.slug as string) || '';
  const normalized = raw.trim().replace(/\s+/g, '-').toLowerCase();
  const apiSlug = `steel-fabrication-delhi-ncr-${normalized}`;

  return <DynamicPage slug={apiSlug} fallback={<div>Loading...</div>} />;
}
