'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { AdminLogin, AdminShell } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';
import * as db from '@/lib/db';

export default function Page() {
  const router = useRouter();
  const { store, setStore, loading, adminLoggedIn, setAdminLoggedIn } = useStore();
  const navigate = (r: Route) => router.push(routeToPath(r));

  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => document.body.classList.remove('admin-mode');
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;

  if (!adminLoggedIn) {
    return <AdminLogin onLogin={() => setAdminLoggedIn(true)} />;
  }

  return (
    <AdminShell
      store={store}
      setStore={setStore}
      navigate={navigate}
      onLogout={async () => {
        await db.signOut();
        setAdminLoggedIn(false);
        navigate({ page: 'home' });
      }}
    />
  );
}
