import React, { Suspense } from 'react';
import { INITIAL_CAMPUS_SPOTS } from '@/lib/constants';
import SpotDetailClient from './SpotDetailClient';
import { Loader2 } from 'lucide-react';

export function generateStaticParams() {
  return INITIAL_CAMPUS_SPOTS.map((s) => ({ id: s.id }));
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          <span className="text-xs text-slate-400">Loading spot analytics...</span>
        </div>
      }
    >
      <SpotDetailClient spotId={id} />
    </Suspense>
  );
}
