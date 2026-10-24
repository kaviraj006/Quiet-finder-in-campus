'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ReportForm from '@/components/readings/ReportForm';

function ReportContent() {
  const searchParams = useSearchParams();
  const initialSpotId = searchParams.get('spotId') || undefined;

  return (
    <div className="py-2">
      <ReportForm initialSpotId={initialSpotId} />
    </div>
  );
}

export default function ReportPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading reporting form...</div>}>
        <ReportContent />
      </Suspense>
    </AppLayout>
  );
}
