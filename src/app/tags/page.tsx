'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { TagsPage } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';

export default function Page() {
  const router = useRouter();
  const { store, loading } = useStore();
  const navigate = (r: Route) => router.push(routeToPath(r));
  const tags = Array.from(
    store.posts.filter(p => p.status === 'published').flatMap(p => p.tags)
      .reduce((m, t) => { m.set(t, (m.get(t) ?? 0) + 1); return m; }, new Map<string, number>())
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;
  return <TagsPage tags={tags} navigate={navigate} />;
}
