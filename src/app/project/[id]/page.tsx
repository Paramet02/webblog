'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { ProjectPage } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, loading } = useStore();
  const navigate = (r: Route) => router.push(routeToPath(r));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;

  const work = store.works.find(w => w.id === id);
  if (!work) return (
    <div className="section container-narrow">
      <p>Project not found. <button className="btn ghost" onClick={() => navigate({ page: 'works' })}>Go to works</button></p>
    </div>
  );

  return <ProjectPage work={work} navigate={navigate} works={store.works} />;
}
