-- ============================================================
-- paramet.notes — Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → New query
-- ============================================================

-- ─── Tables ───────────────────────────────────────────────

create table if not exists posts (
  id           text primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text default '',
  content      text default '',
  tags         text[] default '{}',
  date         date not null,
  read_time    int default 1,
  views        int default 0,
  likes        int default 0,
  status       text default 'draft' check (status in ('published','draft','scheduled')),
  thumb_variant text default 'v-code',
  featured     boolean default false,
  created_at   timestamptz default now()
);

create table if not exists works (
  id            text primary key,
  title         text not null,
  subtitle      text default '',
  year          text not null,
  tags          text[] default '{}',
  description   text default '',
  thumb_variant text default 'v-design',
  featured      boolean default false,
  role          text default '',
  stack         text default '',
  duration      text default '',
  status        text default 'Live',
  created_at    timestamptz default now()
);

create table if not exists comments (
  id         text primary key,
  post_id    text not null references posts(id) on delete cascade,
  author     text not null,
  content    text not null,
  date       date not null,
  status     text default 'pending' check (status in ('approved','pending','spam')),
  likes      int default 0,
  created_at timestamptz default now()
);

create table if not exists media_items (
  id            text primary key,
  name          text not null,
  type          text not null,
  size          text not null,
  date          date not null,
  thumb_variant text default 'v-design',
  url           text,
  storage_path  text,
  created_at    timestamptz default now()
);

create table if not exists activity_log (
  id         text primary key,
  type       text not null check (type in ('publish','edit','draft','comment')),
  text       text not null,
  "when"     text not null,
  created_at timestamptz default now()
);

-- ─── Row Level Security ────────────────────────────────────

alter table posts         enable row level security;
alter table works         enable row level security;
alter table comments      enable row level security;
alter table media_items   enable row level security;
alter table activity_log  enable row level security;

-- posts: public read published only; authenticated full access
create policy "public read published posts"
  on posts for select using (status = 'published');

create policy "admin full access on posts"
  on posts for all using (auth.role() = 'authenticated');

-- works: public read all; authenticated full access
create policy "public read works"
  on works for select using (true);

create policy "admin full access on works"
  on works for all using (auth.role() = 'authenticated');

-- comments: public read approved only; authenticated full access
create policy "public read approved comments"
  on comments for select using (status = 'approved');

create policy "admin full access on comments"
  on comments for all using (auth.role() = 'authenticated');

-- public can insert pending comments (for the comment form)
create policy "public insert pending comments"
  on comments for insert with check (status = 'pending');

-- media: authenticated only
create policy "admin full access on media"
  on media_items for all using (auth.role() = 'authenticated');

-- activity: authenticated only
create policy "admin full access on activity"
  on activity_log for all using (auth.role() = 'authenticated');

-- ─── Seed Data ────────────────────────────────────────────

insert into posts (id, title, slug, excerpt, content, tags, date, read_time, views, likes, status, thumb_variant, featured) values
  ('1','Building Design Systems That Scale','building-design-systems-that-scale','การสร้าง Design System ที่ดีไม่ใช่แค่การรวบรวม Components — มันคือการสร้างภาษาร่วมกันระหว่าง Designer และ Developer','',array['Design','Frontend'],'2026-04-15',8,2840,142,'published','v-design',true),
  ('2','Type Safety in TypeScript: Beyond the Basics','type-safety-typescript-beyond-basics','Exploring advanced TypeScript patterns — conditional types, mapped types, and template literal types that will change how you write code.','',array['TypeScript','Programming'],'2026-04-08',12,1920,98,'published','v-code',false),
  ('3','CSS oklch() และอนาคตของสี','css-oklch-future-of-color','oklch() เปลี่ยนวิธีที่เราคิดเรื่องสีในเว็บไซต์ — ทำความเข้าใจ Perceptually Uniform Color Space และทำไมมันถึงสำคัญ','',array['CSS','Design'],'2026-03-28',6,3100,187,'published','v-design',false),
  ('4','Next.js App Router: A Deep Dive','nextjs-app-router-deep-dive','Server Components, streaming, and the new mental model for building React apps with the Next.js App Router.','',array['Next.js','React'],'2026-03-18',15,4200,231,'published','v-code',false),
  ('5','สิ่งที่ผมเรียนรู้จากการทำ Freelance 3 ปี','freelance-lessons-3-years','จาก Side Project เล็กๆ สู่ Client ระดับ Enterprise — บทเรียนที่ได้จากการทำงานคนเดียว ทั้งด้านเทคนิคและชีวิต','',array['Career','Life'],'2026-03-05',10,5600,304,'published','v-note',false),
  ('6','Animating with CSS View Transitions','css-view-transitions','The View Transitions API brings native page transitions to the web. Here''s how to use them effectively in your projects.','',array['CSS','Animation'],'2026-02-20',7,1680,89,'published','v-stack',false),
  ('7','React Server Components: Draft Notes','react-server-components-draft','Work in progress notes on RSC patterns...','',array['React'],'2026-04-18',5,0,0,'draft','v-code',false)
on conflict (id) do nothing;

insert into works (id, title, subtitle, year, tags, description, thumb_variant, featured, role, stack, duration, status) values
  ('w1','Kaidee Analytics Dashboard','Data visualization platform','2025',array['React','D3.js','TypeScript'],'A comprehensive analytics dashboard for Thailand''s leading marketplace. Built with React and D3.js, featuring real-time data visualization and customizable report generation.','v-design',true,'Lead Frontend Engineer','React, TypeScript, D3.js, TailwindCSS','6 months','Shipped'),
  ('w2','ThaiBev Design System','Component library & tokens','2025',array['Design System','Storybook'],'A scalable design system built for ThaiBev''s digital properties. Includes 80+ components, design tokens, and comprehensive documentation.','v-code',false,'Design Systems Lead','React, Storybook, Figma Tokens','4 months','Active'),
  ('w3','paramet.notes','Personal blog & portfolio','2026',array['Next.js','TypeScript'],'This very site! A personal blog and portfolio built with Next.js, featuring a custom CMS, dark mode, and a tweakable design system.','v-note',false,'Solo Developer','Next.js, TypeScript, CSS','2 weeks','Live'),
  ('w4','Wongnai Food Discovery','Mobile-first web app','2024',array['React','Performance'],'Redesigned the restaurant discovery experience for Wongnai, improving Core Web Vitals scores and increasing user engagement by 34%.','v-stack',false,'Frontend Engineer','React, Next.js, Emotion','3 months','Shipped'),
  ('w5','Line MAN Order Tracker','Real-time tracking UI','2024',array['React Native','Maps'],'Real-time order tracking interface for Line MAN delivery service, built with React Native and Mapbox.','v-design',false,'Mobile Developer','React Native, Mapbox','5 months','Shipped')
on conflict (id) do nothing;

insert into comments (id, post_id, author, content, date, status, likes) values
  ('c1','1','Khun Somchai','บทความนี้ดีมากครับ ช่วยให้เข้าใจ Design Token ได้ชัดขึ้นมาก','2026-04-16','approved',5),
  ('c2','1','Nattawut K.','Great post! The section on theming was particularly helpful. Do you have an example repo?','2026-04-16','approved',3),
  ('c3','2','TypeScript Dev','The conditional types section blew my mind. Never thought about using infer that way.','2026-04-09','approved',8),
  ('c4','3','Anon User','Buy crypto now!! Amazing profits guaranteed!!','2026-04-01','spam',0),
  ('c5','4','React Dev TH','ขอบคุณมากครับ รอบทความนี้นานมากแล้ว','2026-03-20','pending',2)
on conflict (id) do nothing;

insert into media_items (id, name, type, size, date, thumb_variant) values
  ('m1','hero-cover.jpg','image/jpeg','284 KB','2026-04-10','v-design'),
  ('m2','design-system-overview.png','image/png','512 KB','2026-04-08','v-code'),
  ('m3','typescript-types.png','image/png','198 KB','2026-04-01','v-stack'),
  ('m4','color-theory.jpg','image/jpeg','320 KB','2026-03-25','v-design'),
  ('m5','nextjs-arch.svg','image/svg+xml','42 KB','2026-03-15','v-note'),
  ('m6','freelance-life.jpg','image/jpeg','445 KB','2026-03-01','v-stack')
on conflict (id) do nothing;

insert into activity_log (id, type, text, "when") values
  ('a1','publish','Published "Building Design Systems That Scale"','2h ago'),
  ('a2','comment','New comment on "Type Safety in TypeScript"','4h ago'),
  ('a3','edit','Edited "Next.js App Router: A Deep Dive"','1d ago'),
  ('a4','draft','Saved draft "React Server Components"','2d ago'),
  ('a5','publish','Published "CSS oklch() และอนาคตของสี"','3d ago')
on conflict (id) do nothing;

-- ─── Done ─────────────────────────────────────────────────
-- Next step: go to Authentication → Users → Invite user
-- and create your admin account with email + password.
