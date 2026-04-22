'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as db from '../lib/db';
import type { Comment, StoreData } from '../lib/data';

export interface Tweaks {
  accentHue: number;
  fontPair: string;
  cardVariant: string;
  heroVariant: string;
  density: string;
  dark: boolean;
}

export const DEFAULT_TWEAKS: Tweaks = {
  accentHue: 220,
  fontPair: 'plex',
  cardVariant: 'soft',
  heroVariant: 'split',
  density: 'comfy',
  dark: false,
};

interface StoreCtx {
  store: StoreData;
  setStore: (s: StoreData) => void;
  tweaks: Tweaks;
  setTweaks: (t: Tweaks) => void;
  loading: boolean;
  bookmarks: Set<string>;
  likes: Set<string>;
  toggleBookmark: (id: string) => void;
  toggleLike: (id: string) => void;
  addComment: (c: Comment) => void;
  adminLoggedIn: boolean;
  setAdminLoggedIn: (v: boolean) => void;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreData>({
    posts: [],
    works: [],
    comments: [],
    media: [],
    activity: [],
  });
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    async function init() {
      const [data, loggedIn] = await Promise.all([
        db.loadAllData(),
        db.getSession(),
      ]);
      setStore(data);
      setAdminLoggedIn(loggedIn);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--hue', String(tweaks.accentHue));
    el.dataset.font = tweaks.fontPair;
    el.dataset.card = tweaks.cardVariant;
    el.dataset.hero = tweaks.heroVariant;
    el.dataset.density = tweaks.density;
    el.dataset.theme = tweaks.dark ? 'dark' : 'light';
  }, [tweaks]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikes(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const addComment = useCallback((c: Comment) => {
    setStore(prev => ({ ...prev, comments: [...prev.comments, c] }));
    db.addComment(c);
  }, []);

  return (
    <StoreContext.Provider value={{
      store,
      setStore,
      tweaks,
      setTweaks,
      loading,
      bookmarks,
      likes,
      toggleBookmark,
      toggleLike,
      addComment,
      adminLoggedIn,
      setAdminLoggedIn,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
