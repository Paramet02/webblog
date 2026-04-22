'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import { ArticlePage } from '@/components/ClientApp';
import { routeToPath, type Route } from '@/lib/routes';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, loading, bookmarks, likes, toggleBookmark, toggleLike, addComment } = useStore();
  const navigate = (r: Route) => router.push(routeToPath(r));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-3)', fontSize: 14 }}>Loading...</div>;

  const post = store.posts.find(p => p.id === id);
  if (!post) return (
    <div className="section container-narrow">
      <p>Post not found. <button className="btn ghost" onClick={() => navigate({ page: 'home' })}>Go home</button></p>
    </div>
  );

  return (
    <ArticlePage
      post={post}
      navigate={navigate}
      bookmarks={bookmarks}
      likes={likes}
      toggleBookmark={toggleBookmark}
      toggleLike={toggleLike}
      comments={store.comments}
      addComment={addComment}
    />
  );
}
