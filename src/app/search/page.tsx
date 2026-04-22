'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { SearchPage } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';

function SearchPageWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { store, loading } = useStore();
  const q = searchParams.get('q') ?? '';
  const navigate = (r: Route) => router.push(routeToPath(r));
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;
  return <SearchPage posts={store.posts} works={store.works} navigate={navigate} initialQ={q} />;
}

export default function Page() {
  return (
    <Suspense>
      <SearchPageWrapper />
    </Suspense>
  );
}
