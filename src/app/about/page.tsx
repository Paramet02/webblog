'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { AboutPage } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';

export default function Page() {
  const router = useRouter();
  const { loading } = useStore();
  const navigate = (r: Route) => router.push(routeToPath(r));
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;
  return <AboutPage navigate={navigate} />;
}
