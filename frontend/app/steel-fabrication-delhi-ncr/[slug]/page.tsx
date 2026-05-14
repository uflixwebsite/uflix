'use client';

import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function SteelFabricationChild() {
  const params = useParams();
  const raw = (params?.slug as string) || '';
  const normalized = raw.trim().replace(/\s+/g, '-').toLowerCase();

  const redirectMap: Record<string, string> = {
    msfabrication: '/msfabrication-delhi-ncr',
    'laser-sheet-cutting': '/laser-sheet-cutting-delhi-ncr',
    'powder-coating': '/powder-coating-delhi-ncr',
    'laser-pipe-cutting': '/laser-pipe-cutting-delhi-ncr',
  };

  redirect(redirectMap[normalized] || '/steel-fabrication-delhi-ncr');
}
