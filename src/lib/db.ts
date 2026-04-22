import { supabase } from './supabase';
import type { Post, Work, Comment, MediaItem, ActivityItem, StoreData } from './data';

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToPost(r: Record<string, unknown>): Post {
  return {
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    excerpt: (r.excerpt as string) ?? '',
    content: (r.content as string) ?? '',
    tags: (r.tags as string[]) ?? [],
    date: r.date as string,
    readTime: (r.read_time as number) ?? 1,
    views: (r.views as number) ?? 0,
    likes: (r.likes as number) ?? 0,
    status: r.status as Post['status'],
    thumbVariant: (r.thumb_variant as string) ?? 'v-code',
    featured: (r.featured as boolean) ?? false,
  };
}

function postToRow(p: Post) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    tags: p.tags,
    date: p.date,
    read_time: p.readTime,
    views: p.views,
    likes: p.likes,
    status: p.status,
    thumb_variant: p.thumbVariant,
    featured: p.featured ?? false,
  };
}

function rowToWork(r: Record<string, unknown>): Work {
  return {
    id: r.id as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? '',
    year: r.year as string,
    tags: (r.tags as string[]) ?? [],
    description: (r.description as string) ?? '',
    thumbVariant: (r.thumb_variant as string) ?? 'v-design',
    featured: (r.featured as boolean) ?? false,
    role: (r.role as string) ?? '',
    stack: (r.stack as string) ?? '',
    duration: (r.duration as string) ?? '',
    status: (r.status as string) ?? 'Live',
  };
}

function workToRow(w: Work) {
  return {
    id: w.id,
    title: w.title,
    subtitle: w.subtitle,
    year: w.year,
    tags: w.tags,
    description: w.description,
    thumb_variant: w.thumbVariant,
    featured: w.featured ?? false,
    role: w.role,
    stack: w.stack,
    duration: w.duration,
    status: w.status,
  };
}

function rowToComment(r: Record<string, unknown>): Comment {
  return {
    id: r.id as string,
    postId: r.post_id as string,
    author: r.author as string,
    content: r.content as string,
    date: r.date as string,
    status: r.status as Comment['status'],
    likes: (r.likes as number) ?? 0,
  };
}

function commentToRow(c: Comment) {
  return {
    id: c.id,
    post_id: c.postId,
    author: c.author,
    content: c.content,
    date: c.date,
    status: c.status,
    likes: c.likes,
  };
}

function rowToMedia(r: Record<string, unknown>): MediaItem {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as string,
    size: r.size as string,
    date: r.date as string,
    thumbVariant: (r.thumb_variant as string) ?? 'v-design',
    url: r.url as string | undefined,
    storagePath: r.storage_path as string | undefined,
  };
}

function rowToActivity(r: Record<string, unknown>): ActivityItem {
  return {
    id: r.id as string,
    type: r.type as ActivityItem['type'],
    text: r.text as string,
    when: r.when as string,
  };
}

// ─── Load all data ────────────────────────────────────────────────────────────

export async function loadAllData(): Promise<StoreData> {
  const [postsRes, worksRes, commentsRes, mediaRes, activityRes] = await Promise.all([
    supabase.from('posts').select('*').order('date', { ascending: false }),
    supabase.from('works').select('*').order('created_at', { ascending: false }),
    supabase.from('comments').select('*').order('created_at', { ascending: false }),
    supabase.from('media_items').select('*').order('created_at', { ascending: false }),
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }),
  ]);

  return {
    posts: (postsRes.data ?? []).map(rowToPost),
    works: (worksRes.data ?? []).map(rowToWork),
    comments: (commentsRes.data ?? []).map(rowToComment),
    media: (mediaRes.data ?? []).map(rowToMedia),
    activity: (activityRes.data ?? []).map(rowToActivity),
  };
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function upsertPost(post: Post): Promise<{ error: string | null }> {
  const { error } = await supabase.from('posts').upsert(postToRow(post), { onConflict: 'id' });
  return { error: error ? error.message : null };
}

export async function deletePost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return { error: error ? error.message : null };
}

// ─── Works ────────────────────────────────────────────────────────────────────

export async function upsertWork(work: Work): Promise<void> {
  await supabase.from('works').upsert(workToRow(work));
}

export async function deleteWork(id: string): Promise<void> {
  await supabase.from('works').delete().eq('id', id);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(comment: Comment): Promise<void> {
  await supabase.from('comments').insert(commentToRow(comment));
}

export async function updateCommentStatus(id: string, status: Comment['status']): Promise<void> {
  await supabase.from('comments').update({ status }).eq('id', id);
}

export async function deleteComment(id: string): Promise<void> {
  await supabase.from('comments').delete().eq('id', id);
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function uploadMedia(file: File): Promise<{ item: MediaItem | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(path, file);
  if (uploadError) return { item: null, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);

  const item: MediaItem = {
    id: `m${Date.now()}`,
    name: file.name,
    type: file.type,
    size: `${Math.round(file.size / 1024)} KB`,
    date: new Date().toISOString().slice(0, 10),
    thumbVariant: 'v-design',
    url: publicUrl,
    storagePath: path,
  };

  const { error: dbError } = await supabase.from('media_items').insert({
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    date: item.date,
    thumb_variant: item.thumbVariant,
    url: item.url,
    storage_path: item.storagePath,
  });

  if (dbError) return { item: null, error: dbError.message };
  return { item, error: null };
}

export async function addMedia(item: MediaItem): Promise<void> {
  await supabase.from('media_items').insert({
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    date: item.date,
    thumb_variant: item.thumbVariant,
    url: item.url ?? null,
    storage_path: item.storagePath ?? null,
  });
}

export async function deleteMedia(id: string, storagePath?: string): Promise<void> {
  if (storagePath) {
    await supabase.storage.from('media').remove([storagePath]);
  }
  await supabase.from('media_items').delete().eq('id', id);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function addActivity(item: ActivityItem): Promise<void> {
  await supabase.from('activity_log').insert({
    id: item.id,
    type: item.type,
    text: item.text,
    when: item.when,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? error.message : null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
