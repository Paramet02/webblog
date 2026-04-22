'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import Icon from './Icon';
import Thumb from './Thumb';
import {
  Post, Work, Comment, Tag,
  type StoreData,
} from '../lib/data';
import * as db from '../lib/db';
import type { Route } from '../lib/routes';

// ─── Toast system ─────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  msg: string;
  type: ToastType;
  leaving?: boolean;
}

interface ToastCtx {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

function useToast() {
  return useContext(ToastContext);
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}${t.leaving ? ' leaving' : ''}`}>
          <span className="toast-icon">{TOAST_ICONS[t.type]}</span>
          <span>{t.msg}</span>
          <button className="toast-close" onClick={() => dismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
  }, []);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = `t${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    const leaveTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
    }, 3000);
    return () => clearTimeout(leaveTimer);
  }, []);

  return { toasts, showToast, dismiss };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-thumb">
        <Thumb variant={post.thumbVariant} />
      </div>
      <div className="post-body">
        <div className="post-meta">
          <span>{formatDate(post.date)}</span>
          <span className="sep" />
          <span>{post.readTime} min read</span>
          {post.status === 'draft' && <span className="post-tag">Draft</span>}
        </div>
        <div className="post-title">{post.title}</div>
        <div className="post-excerpt">{post.excerpt}</div>
        <div className="post-foot">
          {post.tags.slice(0, 2).map(t => (
            <span key={t} className="post-tag">{t}</span>
          ))}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="eye" size={13} />
            {post.views.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function WorkCard({ work, onClick, feature }: { work: Work; onClick: () => void; feature?: boolean }) {
  return (
    <div className={`work-card${feature ? ' feature' : ''}`} onClick={onClick}>
      <div className="work-cover">
        <Thumb variant={work.thumbVariant} />
      </div>
      <div className="work-body">
        <div className="work-year">{work.year}</div>
        <div className="work-title">{work.title}</div>
        <div className="work-sub">{work.subtitle}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {work.tags.map(t => (
            <span key={t} className="post-tag">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage({
  posts,
  tags,
  navigate,
}: {
  posts: Post[];
  tags: Tag[];
  navigate: (r: Route) => void;
}) {
  const [activeTag, setActiveTag] = useState('All');
  const published = posts.filter(p => p.status === 'published');
  const allTags = ['All', ...Array.from(new Set(published.flatMap(p => p.tags)))];
  const filtered = activeTag === 'All' ? published : published.filter(p => p.tags.includes(activeTag));
  const featured = published.find(p => p.featured);
  const popular = [...published].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <span className="eyebrow"><span className="dot" /> Personal Blog &amp; Portfolio</span>
              <h1>Code, <em>AI</em> &amp; the tech worth talking about</h1>
              <p>สวัสดีครับ — ผม Paramet Software Developer ที่หลงใหลใน AI, Design Systems และเทคโนโลยีใหม่ที่กำลังเปลี่ยนโลก มาอ่านสิ่งที่ผมค้นพบและทดลองด้วยกันครับ</p>
              <div className="hero-cta">
                <button className="btn primary" onClick={() => navigate({ page: 'article', id: featured?.id ?? '1' })}>
                  <Icon name="arrow-right" size={15} /> Read latest post
                </button>
                <button className="btn" onClick={() => navigate({ page: 'works' })}>
                  View my work
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hv-grid" />
              <div className="shape hv-1" />
              <div className="shape hv-2" />
              <div className="shape hv-3" />
              <div className="hv-tag"><span className="dot" /> Available for work</div>
              <div className="hv-chip">{'{ design: code }'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main feed */}
      <div className="section">
        <div className="container">
          {/* Tag filter */}
          <div style={{ marginBottom: 24 }}>
            <div className="chips">
              {allTags.map(t => (
                <button
                  key={t}
                  className={`chip${activeTag === t ? ' active' : ''}`}
                  onClick={() => setActiveTag(t)}
                >
                  {t}
                  <span className="count">
                    {t === 'All' ? published.length : published.filter(p => p.tags.includes(t)).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="feed">
            {/* Post list */}
            <div className="post-list">
              {filtered.map(post => (
                <PostCard key={post.id} post={post} onClick={() => navigate({ page: 'article', id: post.id })} />
              ))}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {featured && (
                <div>
                  <div className="section-head" style={{ marginBottom: 12 }}>
                    <h2 style={{ fontSize: 16, fontFamily: 'var(--font-sans)', letterSpacing: 0 }}>
                      <span className="side-title" style={{ margin: 0 }}>Featured</span>
                    </h2>
                  </div>
                  <div className="featured" onClick={() => navigate({ page: 'article', id: featured.id })} style={{ cursor: 'pointer' }}>
                    <div className="featured-cover">
                      <Thumb variant={featured.thumbVariant} />
                    </div>
                    <div className="featured-body">
                      <div className="post-meta">{formatDate(featured.date)} · {featured.readTime} min</div>
                      <div className="featured-title">{featured.title}</div>
                      <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '8px 0 0' }}>{featured.excerpt}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="side-card">
                <div className="side-title">Most Read</div>
                <div className="side-list">
                  {popular.map((p, i) => (
                    <a key={p.id} onClick={() => navigate({ page: 'article', id: p.id })} style={{ cursor: 'pointer' }}>
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{p.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="side-card">
                <div className="side-title">Popular Tags</div>
                <div className="chips" style={{ marginTop: 4 }}>
                  {tags.slice(0, 8).map(t => (
                    <button
                      key={t.name}
                      className="chip"
                      onClick={() => navigate({ page: 'tags' })}
                    >
                      <Icon name="hash" size={11} />
                      {t.name}
                      <span className="count">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ArticlePage ──────────────────────────────────────────────────────────────

export function ArticlePage({
  post,
  navigate,
  bookmarks,
  likes,
  toggleBookmark,
  toggleLike,
  comments,
  addComment,
}: {
  post: Post;
  navigate: (r: Route) => void;
  bookmarks: Set<string>;
  likes: Set<string>;
  toggleBookmark: (id: string) => void;
  toggleLike: (id: string) => void;
  comments: Comment[];
  addComment: (c: Comment) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');
  const [commentText, setCommentText] = useState('');
  const postComments = comments.filter(c => c.postId === post.id && c.status === 'approved');

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? el.scrollTop / scrollable : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment({
      id: `c${Date.now()}`,
      postId: post.id,
      author: 'Guest',
      content: commentText,
      date: new Date().toISOString().slice(0, 10),
      status: 'approved',
      likes: 0,
    });
    setCommentText('');
  };

  return (
    <>
      {/* Reading progress */}
      <div className="progress">
        <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="container-narrow">
        <div className="article-hero">
          <button
            className="btn ghost"
            onClick={() => navigate({ page: 'home' })}
            style={{ marginBottom: 16, padding: '8px 0' }}
          >
            <Icon name="arrow-left" size={15} /> Back
          </button>
          <div className="post-meta">
            <span className="post-tag">{post.tags[0]}</span>
            <span className="sep" />
            <span>{formatDate(post.date)}</span>
            <span className="sep" />
            <span>{post.readTime} min read</span>
          </div>
          <h1>{post.title}</h1>
          <div className="meta">
            <span className="avatar">P</span>
            <span>Paramet</span>
            <span className="sep" style={{ width: 3, height: 3, borderRadius: 999, background: 'currentColor', opacity: 0.6 }} />
            <span>{post.views.toLocaleString()} views</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="heart" size={14} /> {post.likes + (likes.has(post.id) ? 1 : 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="article-layout">
          {/* TOC — generated from post.content headings */}
          <div className="toc">
            <div className="toc-title">Contents</div>
            {post.content.split('\n').filter(l => l.startsWith('## ')).map((l, i) => {
              const heading = l.replace(/^##\s+/, '');
              const id = `h-${i}`;
              return (
                <a key={id} className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)} style={{ cursor: 'pointer' }}>
                  {heading}
                </a>
              );
            })}
          </div>

          {/* Prose — rendered from post.content markdown */}
          <div>
            <div className="prose">
              {post.content ? post.content.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                if (line.startsWith('## ')) return <h2 key={i} id={`h-${post.content.split('\n').filter(l => l.startsWith('## ')).indexOf(line)}`}>{line.slice(3)}</h2>;
                if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                if (line.startsWith('> ')) return <blockquote key={i}>{line.slice(2)}</blockquote>;
                if (line.startsWith('```')) return null;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i}>{line}</p>;
              }) : <p style={{ color: 'var(--ink-3)' }}>No content yet.</p>}
            </div>

            {/* Comments */}
            <div className="comments">
              <h3>Comments ({postComments.length})</h3>
              <div className="comment-box">
                <span className="avatar" style={{ flexShrink: 0 }}>G</span>
                <textarea
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={handleComment}>
                  Post
                </button>
              </div>
              {postComments.map(c => (
                <div key={c.id} className="comment">
                  <span className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{c.author[0]}</span>
                  <div>
                    <span className="who">{c.author}</span>
                    <span className="when">{formatDate(c.date)}</span>
                    <div className="body">{c.content}</div>
                    <div className="actions">
                      <span style={{ cursor: 'pointer' }}><Icon name="heart" size={12} /> {c.likes}</span>
                      <span style={{ cursor: 'pointer' }}>Reply</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action sidebar */}
          <div className="article-side">
            <div className="action-stack">
              <button
                className={`action-btn${likes.has(post.id) ? ' on' : ''}`}
                onClick={() => toggleLike(post.id)}
                title="Like"
              >
                <Icon name="heart" size={18} />
              </button>
              <button
                className={`action-btn${bookmarks.has(post.id) ? ' on' : ''}`}
                onClick={() => toggleBookmark(post.id)}
                title="Bookmark"
              >
                <Icon name="bookmark" size={18} />
              </button>
              <button className="action-btn" title="Share">
                <Icon name="share" size={18} />
              </button>
              <button className="action-btn" title="Comment" onClick={() => document.querySelector('.comments')?.scrollIntoView({ behavior: 'smooth' })}>
                <Icon name="comment" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── WorksPage ────────────────────────────────────────────────────────────────

export function WorksPage({ works, navigate }: { works: Work[]; navigate: (r: Route) => void }) {
  const [filter, setFilter] = useState('All');
  const allTags = ['All', ...Array.from(new Set(works.flatMap(w => w.tags)))];
  const filtered = filter === 'All' ? works : works.filter(w => w.tags.includes(filter));

  return (
    <div className="section">
      <div className="container">
        <div className="section-head">
          <h2>Works</h2>
          <span className="sub">{works.length} projects</span>
        </div>
        <div className="chips" style={{ marginBottom: 28 }}>
          {allTags.map(t => (
            <button key={t} className={`chip${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="works-grid">
          {filtered.map((w, i) => (
            <WorkCard
              key={w.id}
              work={w}
              onClick={() => navigate({ page: 'project', id: w.id })}
              feature={w.featured && i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ProjectPage ──────────────────────────────────────────────────────────────

export function ProjectPage({ work, navigate, works }: { work: Work; navigate: (r: Route) => void; works: Work[] }) {
  const related = works.filter(w => w.id !== work.id).slice(0, 3);
  return (
    <>
      <div className="container-narrow">
        <div className="project-hero">
          <button className="btn ghost" onClick={() => navigate({ page: 'works' })} style={{ padding: '8px 0' }}>
            <Icon name="arrow-left" size={15} /> All works
          </button>
          <div className="post-meta" style={{ marginTop: 16 }}>
            <span className="post-tag">{work.tags[0]}</span>
            <span className="sep" />
            <span>{work.year}</span>
            <span className="sep" />
            <span>{work.status}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.02em', margin: '12px 0 8px', fontWeight: 500 }}>
            {work.title}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)' }}>{work.subtitle}</p>
          <div className="project-cover">
            <Thumb variant={work.thumbVariant} />
          </div>
        </div>

        <div className="project-facts">
          <div><div className="lab">Role</div><div className="val">{work.role}</div></div>
          <div><div className="lab">Duration</div><div className="val">{work.duration}</div></div>
          <div><div className="lab">Stack</div><div className="val">{work.stack}</div></div>
          <div><div className="lab">Status</div><div className="val">{work.status}</div></div>
        </div>

        <div className="prose">
          <h2>About the project</h2>
          <p>{work.description}</p>
          <h2>Challenge &amp; Approach</h2>
          <p>The main challenge was building something scalable while keeping the developer experience smooth. We focused on clear API design and comprehensive documentation to ensure adoption across teams.</p>
          <ul>
            <li>Established shared design tokens as the single source of truth</li>
            <li>Built a component API that was both flexible and opinionated</li>
            <li>Created living documentation with interactive examples</li>
            <li>Implemented automated visual regression testing</li>
          </ul>
          <h2>Outcome</h2>
          <p>The project was delivered on time and exceeded stakeholder expectations. Post-launch metrics showed a 40% reduction in design inconsistencies and a 25% improvement in developer velocity for new feature work.</p>
          <blockquote>
            &quot;This is exactly the kind of thoughtful, scalable solution we needed.&quot; — Project Stakeholder
          </blockquote>
        </div>
      </div>

      {related.length > 0 && (
        <div className="section">
          <div className="container">
            <div className="section-head">
              <h2>More Works</h2>
            </div>
            <div className="works-grid">
              {related.map(w => (
                <WorkCard key={w.id} work={w} onClick={() => navigate({ page: 'project', id: w.id })} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AboutPage ────────────────────────────────────────────────────────────────

export function AboutPage({ navigate }: { navigate: (r: Route) => void }) {
  return (
    <div className="container">
      <div className="about-hero">
        <div className="about-photo" />
        <div>
          <span className="eyebrow"><span className="dot" /> About me</span>
          <h1>Hi, I&apos;m Paramet — <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Software Developer</em></h1>
          <p>
            ผมเป็น Software Developer ที่เพิ่งเริ่มต้นเส้นทางสายนี้จากงานจริง ทั้ง Internship และ Freelance
            ชอบสร้างสิ่งใหม่บนเว็บ และสนใจทุกอย่างที่เกี่ยวกับ AI, Design Systems และ tech ที่กำลังเปลี่ยนโลก
          </p>
          <p style={{ marginTop: 16 }}>
            ยังอยู่ในช่วงเรียนรู้และสะสมประสบการณ์ — บล็อกนี้เป็นที่บันทึกสิ่งที่ค้นพบ ทดลอง และอยากแชร์ให้คนอื่นครับ
          </p>
          <div className="stats">
            <div className="stat">
              <div className="num">5</div>
              <div className="lab">Months exp.</div>
            </div>
            <div className="stat">
              <div className="num">3</div>
              <div className="lab">Projects</div>
            </div>
            <div className="stat">
              <div className="num">2</div>
              <div className="lab">Companies</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, paddingBottom: 80 }}>
        <div>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h2>Timeline</h2>
          </div>
          <div className="timeline">
            {[
              { year: '2026', title: 'Freelance Full-Stack Developer', desc: 'Fillin Life Company Limited — พัฒนาระบบ web application แบบ full-stack' },
              { year: '2026', title: 'Software Developer Intern', desc: 'Tigersoft — ฝึกงาน 4 เดือน พัฒนาซอฟต์แวร์จริงในทีม' },
            ].map((item, i) => (
              <div key={i} className="t-item">
                <div className="year">{item.year}</div>
                <div className="t-title">{item.title}</div>
                <div className="t-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h2>Currently</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { emoji: '💻', text: 'Building paramet — บล็อกนี้' },
              { emoji: '🤖', text: 'สนใจ AI tools และ how it changes the way we build' },
              { emoji: '📚', text: 'เรียนรู้และหา project ใหม่อยู่เสมอ' },
              { emoji: '🌏', text: 'Based in Thailand' },
            ].map(item => (
              <div key={item.emoji} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ color: 'var(--ink-2)', fontSize: 15 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h2>Contact</h2>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="mailto:paramet.khing@gmail.com" className="btn">
                <Icon name="external" size={14} /> Email
              </a>
              <a href="https://github.com/Paramet02" target="_blank" rel="noopener noreferrer" className="btn">
                <Icon name="external" size={14} /> GitHub
              </a>
              <a href="https://x.com/reborn22_" target="_blank" rel="noopener noreferrer" className="btn">
                <Icon name="external" size={14} /> Twitter
              </a>
              <button className="btn primary" onClick={() => navigate({ page: 'works' })}>
                View works <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TagsPage ─────────────────────────────────────────────────────────────────

export function TagsPage({ tags, navigate }: { tags: Tag[]; navigate: (r: Route) => void }) {
  return (
    <div className="section">
      <div className="container">
        <div className="section-head">
          <h2>All Tags</h2>
          <span className="sub">{tags.length} topics</span>
        </div>
        <div className="tag-cloud">
          {tags.map(t => (
            <button
              key={t.name}
              className={`tag-pill${t.hot ? ' hot' : ''}`}
              onClick={() => navigate({ page: 'search', q: t.name })}
            >
              <Icon name="hash" size={13} />
              {t.name}
              <span className="count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SearchPage ───────────────────────────────────────────────────────────────

export function SearchPage({
  posts,
  works,
  navigate,
  initialQ = '',
}: {
  posts: Post[];
  works: Work[];
  navigate: (r: Route) => void;
  initialQ?: string;
}) {
  const [q, setQ] = useState(initialQ);

  const allItems = [
    ...posts.filter(p => p.status === 'published').map(p => ({ kind: 'article' as const, id: p.id, title: p.title, snip: p.excerpt })),
    ...works.map(w => ({ kind: 'work' as const, id: w.id, title: w.title, snip: w.description })),
  ];

  const results = q.trim()
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.snip.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  const highlight = (text: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="section">
      <div className="container-narrow">
        <div className="section-head">
          <h2>Search</h2>
        </div>
        <div className="search" style={{ width: '100%', marginBottom: 28, borderRadius: 14, padding: '12px 18px' }}>
          <Icon name="search" size={16} />
          <input
            autoFocus
            placeholder="Search posts, works..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          {q && (
            <button onClick={() => setQ('')}><Icon name="x" size={14} /></button>
          )}
        </div>

        {q && (
          <div style={{ marginBottom: 12, color: 'var(--ink-3)', fontSize: 13 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
          </div>
        )}

        <div className="results">
          {results.map(item => (
            <div
              key={item.id}
              className="result"
              onClick={() => navigate(item.kind === 'article' ? { page: 'article', id: item.id } : { page: 'project', id: item.id })}
            >
              <span className="kind">{item.kind}</span>
              <div>
                <div className="title">{highlight(item.title)}</div>
                <div className="snip">{highlight(item.snip.slice(0, 120))}...</div>
              </div>
              <Icon name="arrow-right" size={15} />
            </div>
          ))}
          {q && results.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
              No results found for &ldquo;{q}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────

type AdminSection = 'dashboard' | 'posts' | 'editor' | 'works' | 'work-editor' | 'comments' | 'media' | 'settings';

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await db.signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      onLogin();
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand-mark" style={{ width: 40, height: 40, borderRadius: 12 }} />
        <h1>paramet</h1>
        <div className="sub">Sign in to the admin panel</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div style={{ color: 'oklch(0.55 0.2 25)', fontSize: 13 }}>{error}</div>}
          <button type="submit" className="btn primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({
  store,
  navigate,
  setSection,
}: {
  store: StoreData;
  navigate: (r: Route) => void;
  setSection: (s: AdminSection) => void;
}) {
  const publishedCount = store.posts.filter(p => p.status === 'published').length;
  const draftCount = store.posts.filter(p => p.status === 'draft').length;
  const pendingComments = store.comments.filter(c => c.status === 'pending').length;
  const totalViews = store.posts.reduce((s, p) => s + p.views, 0);

  // Real month comparison from actual data dates
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;

  const publishedThisMonth = store.posts.filter(p => p.status === 'published' && p.date.startsWith(thisMonth)).length;
  const publishedLastMonth = store.posts.filter(p => p.status === 'published' && p.date.startsWith(lastMonth)).length;
  const commentsThisMonth = store.comments.filter(c => c.date.startsWith(thisMonth)).length;
  const commentsLastMonth = store.comments.filter(c => c.date.startsWith(lastMonth)).length;

  const monthDelta = (cur: number, prev: number): { label: string; cls: string } => {
    const diff = cur - prev;
    if (diff > 0) return { label: `↑ ${diff} this month`, cls: 'up' };
    if (diff < 0) return { label: `↓ ${Math.abs(diff)} vs last month`, cls: 'down' };
    if (cur === 0) return { label: 'None yet', cls: '' };
    return { label: 'Same as last month', cls: '' };
  };

  const postDelta = monthDelta(publishedThisMonth, publishedLastMonth);
  const commentDelta = monthDelta(commentsThisMonth, commentsLastMonth);

  return (
    <div className="admin-body">
      <div className="notice">
        <Icon name="sun" size={16} />
        Welcome back, Paramet! You have {pendingComments} comment{pendingComments !== 1 ? 's' : ''} awaiting moderation.
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="lab">Total Views</div>
          <div className="num">{totalViews.toLocaleString()}</div>
          <div className="delta">across {publishedCount} post{publishedCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="lab">Published Posts</div>
          <div className="num">{publishedCount}</div>
          <div className={`delta ${postDelta.cls}`}>{postDelta.label}</div>
        </div>
        <div className="stat-card">
          <div className="lab">Drafts</div>
          <div className="num">{draftCount}</div>
          <div className="delta">{draftCount === 0 ? 'No drafts' : 'in progress'}</div>
        </div>
        <div className="stat-card">
          <div className="lab">Comments</div>
          <div className="num">{store.comments.length}</div>
          <div className={`delta ${commentDelta.cls}`}>
            {pendingComments > 0 ? `${pendingComments} pending · ` : ''}{commentDelta.label}
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Page Views — Last 28 Days</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: 'var(--ink-3)' }}>
            <Icon name="eye" size={28} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No analytics data yet</div>
            <div style={{ fontSize: 12 }}>View tracking will appear here once integrated</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-head">
              <h3>Recent Activity</h3>
            </div>
            <div className="activity">
              {store.activity.map(item => (
                <div key={item.id} className={`activity-item ${item.type}`}>
                  <div className="dot">
                    <Icon name={item.type === 'publish' ? 'eye' : item.type === 'comment' ? 'comment' : item.type === 'edit' ? 'edit' : 'clock'} size={12} />
                  </div>
                  <span>{item.text}</span>
                  <span className="when">{item.when}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Popular Posts</h3>
            </div>
            <div className="side-list" style={{ padding: '0 16px' }}>
              {[...store.posts].filter(p => p.status === 'published').sort((a, b) => b.views - a.views).slice(0, 4).map((p, i) => (
                <a key={p.id} onClick={() => navigate({ page: 'article', id: p.id })} style={{ cursor: 'pointer' }}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>{p.title}</span>
                  <span style={{ color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{p.views.toLocaleString()}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsAdmin({
  store,
  setStore,
  setSection,
  setEditId,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
  setSection: (s: AdminSection) => void;
  setEditId: (id: string | null) => void;
}) {
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = store.posts.filter(p => {
    const matchQ = !q || p.title.toLowerCase().includes(q.toLowerCase());
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  const counts = {
    all: store.posts.length,
    published: store.posts.filter(p => p.status === 'published').length,
    draft: store.posts.filter(p => p.status === 'draft').length,
  };

  const deletePost = async (id: string) => {
    setDeletingId(id);
    const { error } = await db.deletePost(id);
    setDeletingId(null);
    if (error) {
      showToast('Delete failed — ' + error, 'error');
    } else {
      setStore({ ...store, posts: store.posts.filter(p => p.id !== id) });
      showToast('Post deleted', 'success');
    }
  };

  const duplicatePost = async (post: Post) => {
    const dup: Post = { ...post, id: `post_${Date.now()}`, title: `${post.title} (Copy)`, status: 'draft', views: 0, likes: 0 };
    const { error } = await db.upsertPost(dup);
    if (error) {
      showToast('Duplicate failed — ' + error, 'error');
    } else {
      setStore({ ...store, posts: [...store.posts, dup] });
      showToast('Post duplicated', 'success');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="admin-body" style={{ padding: 0, position: 'relative' }}>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} />
          <input placeholder="Search posts..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="toolbar-seg">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="count">{counts[s as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button className="btn" style={{ color: 'oklch(0.55 0.2 25)' }}>
              Delete {selected.size}
            </button>
          )}
          <button className="btn primary" onClick={() => { setEditId(null); setSection('editor'); }}>
            <Icon name="plus" size={14} /> New Post
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th>Title</th>
            <th>Status</th>
            <th>Date</th>
            <th>Views</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(post => (
            <tr key={post.id} className={selected.has(post.id) ? 'sel' : ''}>
              <td>
                <div
                  className={`checkbox${selected.has(post.id) ? ' on' : ''}`}
                  onClick={() => toggleSelect(post.id)}
                >
                  {selected.has(post.id) && <Icon name="check" size={10} stroke={3} />}
                </div>
              </td>
              <td>
                <div className="row-title">
                  <div className="row-thumb"><Thumb variant={post.thumbVariant} /></div>
                  <div>
                    <div className="t">{post.title}</div>
                    <div className="s">{post.tags.join(', ')}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status ${post.status}`}>
                  <span className="dot" />{post.status}
                </span>
              </td>
              <td style={{ color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{post.date}</td>
              <td style={{ color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{post.views.toLocaleString()}</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => { setEditId(post.id); setSection('editor'); }}>
                    <Icon name="edit" size={14} />
                  </button>
                  <button className="icon-btn" title="Duplicate" onClick={() => duplicatePost(post)}>
                    <Icon name="copy" size={14} />
                  </button>
                  <button className="icon-btn danger" title="Delete" onClick={() => deletePost(post.id)} disabled={deletingId === post.id}>
                    <Icon name={deletingId === post.id ? 'loader' : 'trash'} size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PostEditor({
  store,
  setStore,
  editId,
  setSection,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
  editId: string | null;
  setSection: (s: AdminSection) => void;
}) {
  const { showToast } = useToast();
  const existing = editId ? store.posts.find(p => p.id === editId) : null;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [status, setStatus] = useState<Post['status']>(existing?.status ?? 'draft');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const postIdRef = useRef(existing?.id ?? `post_${Date.now()}`);
  const storeRef = useRef(store);
  const setStoreRef = useRef(setStore);
  const appendedRef = useRef(!!existing);
  useEffect(() => { storeRef.current = store; }, [store]);
  useEffect(() => { setStoreRef.current = setStore; }, [setStore]);

  const save = useCallback(async (manual = false) => {
    if (!title.trim()) return;
    setSaveState('saving');
    const post: Post = {
      id: postIdRef.current,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      excerpt,
      content,
      tags,
      date: existing?.date ?? new Date().toISOString().slice(0, 10),
      readTime: Math.max(1, Math.ceil(content.split(' ').length / 200)),
      views: existing?.views ?? 0,
      likes: existing?.likes ?? 0,
      status,
      thumbVariant: existing?.thumbVariant ?? 'v-code',
    };
    const s = storeRef.current;
    const posts = appendedRef.current
      ? s.posts.map(p => p.id === post.id ? post : p)
      : [...s.posts, post];
    appendedRef.current = true;
    // update ref immediately to prevent race condition on concurrent saves
    storeRef.current = { ...s, posts };
    setStoreRef.current({ ...s, posts });
    const { error } = await db.upsertPost(post);
    if (error) {
      setSaveState('error');
      showToast('Save failed — check connection', 'error');
    } else {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
      if (manual) {
        showToast(status === 'published' ? 'Post published!' : 'Draft saved', 'success');
      }
    }
  }, [title, content, excerpt, tags, status, existing, showToast]);

  // Autosave — only restarts when content changes, not on every store update
  useEffect(() => {
    if (saveState === 'saving') return;
    const t = setTimeout(save, 4000);
    return () => clearTimeout(t);
  }, [title, content, excerpt, tags, status]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [...new Set([...prev, tagInput.trim()])]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const previewContent = content || excerpt || 'Start typing to see a preview...';

  return (
    <div className="editor-layout">
      <div className="editor-pane">
        <div className="meta">
          <div className="field">
            <label>Status</label>
            <select className="select" value={status} onChange={e => setStatus(e.target.value as Post['status'])}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="field">
            <label>Excerpt</label>
            <textarea className="textarea" rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short description..." />
          </div>
          <div className="field">
            <label>Tags</label>
            <div className="tag-input-wrap">
              {tags.map(t => (
                <span key={t} className="tag-bubble">
                  {t}
                  <button onClick={() => removeTag(t)} style={{ opacity: 0.7 }}><Icon name="x" size={10} /></button>
                </span>
              ))}
              <input
                placeholder="Add tag, press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
          </div>
        </div>

        <input
          className="title-input"
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="textarea md-input"
          placeholder="Write your post in Markdown..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div className="autosave">
            {saveState === 'saving' && <><span className="dot" style={{ animation: 'pulse 1.5s infinite' }} />Saving...</>}
            {saveState === 'saved' && <><span className="dot" style={{ background: 'oklch(0.6 0.17 145)', animation: 'none' }} />Saved</>}
            {saveState === 'error' && <span style={{ color: 'oklch(0.55 0.2 25)' }}>Save failed — check connection</span>}
            {saveState === 'idle' && <><span className="dot" style={{ animation: 'pulse 1.5s infinite' }} />Auto-saving...</>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setSection('posts')}>Cancel</button>
            <button className="btn primary" onClick={() => save(true)} disabled={saveState === 'saving'}>
              {saveState === 'saving' ? 'Saving...' : status === 'published' ? 'Publish' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      <div className="preview-pane">
        <div style={{ marginBottom: 16, color: 'var(--ink-3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Preview
        </div>
        {title && <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,3vw,40px)', letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 16px' }}>{title}</h1>}
        <div className="prose">
          {previewContent.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) return <h2 key={i}>{para.slice(3)}</h2>;
            if (para.startsWith('### ')) return <h3 key={i}>{para.slice(4)}</h3>;
            if (para.startsWith('> ')) return <blockquote key={i}>{para.slice(2)}</blockquote>;
            const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imgMatch) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', borderRadius: 8 }} />;
            return <p key={i}>{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

function WorksAdmin({
  store,
  setStore,
  setSection,
  setEditWorkId,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
  setSection: (s: AdminSection) => void;
  setEditWorkId: (id: string | null) => void;
}) {
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const filtered = store.works.filter(w => !q || w.title.toLowerCase().includes(q.toLowerCase()));

  const deleteWork = async (id: string) => {
    try {
      await db.deleteWork(id);
      setStore({ ...store, works: store.works.filter(w => w.id !== id) });
      showToast('Work deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="admin-body" style={{ padding: 0 }}>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} />
          <input placeholder="Search works..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn primary" onClick={() => { setEditWorkId(null); setSection('work-editor'); }}>
            <Icon name="plus" size={14} /> New Work
          </button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Year</th>
            <th>Tags</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(work => (
            <tr key={work.id}>
              <td>
                <div className="row-title">
                  <div className="row-thumb"><Thumb variant={work.thumbVariant} /></div>
                  <div>
                    <div className="t">{work.title}</div>
                    <div className="s">{work.subtitle}</div>
                  </div>
                </div>
              </td>
              <td style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{work.year}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {work.tags.map(t => <span key={t} className="post-tag">{t}</span>)}
                </div>
              </td>
              <td>
                <span className="status published"><span className="dot" />{work.status}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => { setEditWorkId(work.id); setSection('work-editor'); }}>
                    <Icon name="edit" size={14} />
                  </button>
                  <button className="icon-btn danger" onClick={() => deleteWork(work.id)}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkEditorPanel({
  store,
  setStore,
  editWorkId,
  setSection,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
  editWorkId: string | null;
  setSection: (s: AdminSection) => void;
}) {
  const { showToast } = useToast();
  const existing = editWorkId ? store.works.find(w => w.id === editWorkId) : null;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? '');
  const [year, setYear] = useState(existing?.year ?? String(new Date().getFullYear()));
  const [description, setDescription] = useState(existing?.description ?? '');
  const [role, setRole] = useState(existing?.role ?? '');
  const [stack, setStack] = useState(existing?.stack ?? '');
  const [duration, setDuration] = useState(existing?.duration ?? '');
  const [status, setStatus] = useState(existing?.status ?? 'Live');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) { showToast('Title is required', 'warning'); return; }
    setSaving(true);
    const work: Work = {
      id: existing?.id ?? `w${Date.now()}`,
      title,
      subtitle,
      year,
      description,
      tags: stack.split(',').map(s => s.trim()).filter(Boolean),
      thumbVariant: existing?.thumbVariant ?? 'v-design',
      role,
      stack,
      duration,
      status,
    };
    const works = existing
      ? store.works.map(w => w.id === work.id ? work : w)
      : [...store.works, work];
    setStore({ ...store, works });
    try {
      await db.upsertWork(work);
      showToast(existing ? 'Work updated' : 'Work created', 'success');
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-body">
      <div style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" />
          </div>
          <div className="field">
            <label>Subtitle</label>
            <input className="input" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Short description" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Year</label>
              <input className="input" value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div className="field">
              <label>Status</label>
              <input className="input" value={status} onChange={e => setStatus(e.target.value)} />
            </div>
            <div className="field">
              <label>Role</label>
              <input className="input" value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div className="field">
              <label>Duration</label>
              <input className="input" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Stack / Tags (comma-separated)</label>
            <input className="input" value={stack} onChange={e => setStack(e.target.value)} placeholder="React, TypeScript, ..." />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the project..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="btn" onClick={() => setSection('works')}>Cancel</button>
            <button className="btn primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Work'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsAdmin({
  store,
  setStore,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
}) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const counts = {
    all: store.comments.length,
    approved: store.comments.filter(c => c.status === 'approved').length,
    pending: store.comments.filter(c => c.status === 'pending').length,
    spam: store.comments.filter(c => c.status === 'spam').length,
  };
  const filtered = filter === 'all' ? store.comments : store.comments.filter(c => c.status === filter);

  const updateStatus = async (id: string, status: Comment['status']) => {
    setStore({ ...store, comments: store.comments.map(c => c.id === id ? { ...c, status } : c) });
    try {
      await db.updateCommentStatus(id, status);
      const labels: Record<Comment['status'], string> = { approved: 'Comment approved', pending: 'Comment set to pending', spam: 'Marked as spam' };
      const types: Record<Comment['status'], ToastType> = { approved: 'success', pending: 'info', spam: 'warning' };
      showToast(labels[status], types[status]);
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const deleteComment = async (id: string) => {
    setStore({ ...store, comments: store.comments.filter(c => c.id !== id) });
    try {
      await db.deleteComment(id);
      showToast('Comment deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="admin-body" style={{ padding: 0 }}>
      <div className="toolbar">
        <div className="toolbar-seg">
          {(['all', 'approved', 'pending', 'spam'] as const).map(s => (
            <button key={s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="count">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        {filtered.map(c => {
          const post = store.posts.find(p => p.id === c.postId);
          return (
            <div key={c.id} className="comment-admin">
              <span className="avatar">{c.author[0]}</span>
              <div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.author}</span>
                  <span style={{ color: 'var(--ink-3)', fontSize: 12.5, marginLeft: 8 }}>{formatDate(c.date)}</span>
                  {post && <span style={{ color: 'var(--ink-3)', fontSize: 12.5, marginLeft: 8 }}>on &ldquo;{post.title.slice(0, 40)}&rdquo;</span>}
                </div>
                <div style={{ color: 'var(--ink)', fontSize: 14.5 }}>{c.content}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span className={`status ${c.status}`}><span className="dot" />{c.status}</span>
                </div>
              </div>
              <div className="row-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {c.status !== 'approved' && (
                  <button className="icon-btn" title="Approve" onClick={() => updateStatus(c.id, 'approved')}>
                    <Icon name="check" size={14} />
                  </button>
                )}
                {c.status !== 'spam' && (
                  <button className="icon-btn danger" title="Mark spam" onClick={() => updateStatus(c.id, 'spam')}>
                    <Icon name="x" size={14} />
                  </button>
                )}
                <button className="icon-btn danger" title="Delete" onClick={() => deleteComment(c.id)}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MediaAdmin({
  store,
  setStore,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
}) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const deleteMedia = async (id: string, storagePath?: string) => {
    try {
      await db.deleteMedia(id, storagePath);
      setStore({ ...store, media: store.media.filter(m => m.id !== id) });
      showToast('File deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('URL copied to clipboard', 'info');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    const { item, error } = await db.uploadMedia(file);
    setUploading(false);
    if (error || !item) {
      showToast('Upload failed — ' + error, 'error');
      return;
    }
    setStore({ ...store, media: [item, ...store.media] });
    showToast('File uploaded successfully', 'success');
  };

  return (
    <div className="admin-body" style={{ position: 'relative' }}>
      <label className="upload-zone" style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
        <input type="file" accept="image/*,video/*,.pdf" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        <Icon name={uploading ? 'loader' : 'upload'} size={28} />
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 500 }}>
          {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </div>
        <div style={{ fontSize: 13, marginTop: 6 }}>PNG, JPG, SVG, GIF, PDF up to 10MB</div>
      </label>

      {store.media.length === 0 && !uploading && (
        <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '40px 0', fontSize: 14 }}>
          No media yet — upload your first file above
        </div>
      )}

      <div className="media-grid">
        {store.media.map(item => (
          <div key={item.id} className="media-item">
            <div className="media-thumb">
              {item.url
                ? <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Thumb variant={item.thumbVariant} />}
            </div>
            <div className="media-info">
              <div className="media-name" title={item.name}>{item.name}</div>
              <div className="media-meta">
                <span>{item.type.split('/')[1]?.toUpperCase() ?? item.type}</span>
                <span>{item.size}</span>
              </div>
              {item.url && (
                <button
                  onClick={() => copyUrl(item.url!, item.id)}
                  style={{ marginTop: 6, fontSize: 11, color: copiedId === item.id ? 'var(--accent)' : 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Icon name={copiedId === item.id ? 'check' : 'copy'} size={11} />
                  {copiedId === item.id ? 'Copied!' : 'Copy URL'}
                </button>
              )}
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0 }} className="media-delete">
              <button className="icon-btn" onClick={() => deleteMedia(item.id, item.storagePath)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                <Icon name="trash" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsAdmin({ store, setStore }: { store: StoreData; setStore: (s: StoreData) => void }) {
  const { showToast } = useToast();
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');

  const handleSave = () => {
    showToast('Settings saved', 'success');
  };

  return (
    <div className="admin-body">
      <div className="settings-section">
        <div className="head">
          <h3>Site Identity</h3>
          <p>Basic information about your blog</p>
        </div>
        <div className="body">
          <div className="field">
            <label>Site Name</label>
            <input className="input" value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" rows={3} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h3>Author</h3>
          <p>Your profile information</p>
        </div>
        <div className="body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label>Name</label>
              <input className="input" defaultValue="" />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" defaultValue="" />
            </div>
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea className="textarea" rows={3} defaultValue="" />
          </div>
          <button className="btn primary" onClick={handleSave}>Save Profile</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h3>Comments</h3>
          <p>Comment moderation settings</p>
        </div>
        <div className="body">
          <div className="field">
            <label>Default Status</label>
            <select className="select">
              <option value="pending">Pending (requires approval)</option>
              <option value="approved">Auto-approve</option>
            </select>
          </div>
          <button className="btn primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>

    </div>
  );
}

export function AdminShell({
  store,
  setStore,
  navigate,
  onLogout,
}: {
  store: StoreData;
  setStore: (s: StoreData) => void;
  navigate: (r: Route) => void;
  onLogout: () => void;
}) {
  const { toasts, showToast, dismiss } = useToastState();
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [editId, setEditId] = useState<string | null>(null);
  const [editWorkId, setEditWorkId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingComments = store.comments.filter(c => c.status === 'pending').length;

  const NAV_ITEMS: { label: string; section: AdminSection; icon: string; badge?: number }[] = [
    { label: 'Dashboard', section: 'dashboard', icon: 'layout' },
    { label: 'Posts', section: 'posts', icon: 'list' },
    { label: 'Editor', section: 'editor', icon: 'edit' },
    { label: 'Works', section: 'works', icon: 'grid' },
    { label: 'Comments', section: 'comments', icon: 'message-square', badge: pendingComments },
    { label: 'Media', section: 'media', icon: 'image' },
    { label: 'Settings', section: 'settings', icon: 'settings' },
  ];

  const sectionTitle: Record<AdminSection, string> = {
    dashboard: 'Dashboard',
    posts: 'Posts',
    editor: editId ? 'Edit Post' : 'New Post',
    works: 'Works',
    'work-editor': editWorkId ? 'Edit Work' : 'New Work',
    comments: 'Comments',
    media: 'Media',
    settings: 'Settings',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
    <div className="admin-root">
      {/* Mobile overlay */}
      <div
        className={`admin-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <aside className={`admin-side${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-brand">
          <div className="brand-mark" />
          <div>
            <div className="title">paramet</div>
            <div className="sub">Admin Panel</div>
          </div>
        </div>
        <nav className="admin-nav">
          <span className="group">Content</span>
          {NAV_ITEMS.map(item => (
            <a
              key={item.section}
              className={section === item.section ? 'active' : ''}
              onClick={() => { setSection(item.section); setSidebarOpen(false); }}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
              {item.badge ? <span className="badge">{item.badge}</span> : null}
            </a>
          ))}
        </nav>
        <div className="admin-side-foot">
          <span className="avatar">P</span>
          <div style={{ flex: 1, fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>Paramet</div>
            <div style={{ color: 'var(--ink-3)' }}>Admin</div>
          </div>
          <button className="icon-btn" title="Back to site" onClick={() => navigate({ page: 'home' })}>
            <Icon name="external" size={14} />
          </button>
          <button className="icon-btn" title="Logout" onClick={onLogout}>
            <Icon name="log-out" size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-top">
          <button className="icon-btn admin-menu-btn" onClick={() => setSidebarOpen(o => !o)} title="Menu">
            <Icon name="menu" size={18} />
          </button>
          <h1>{sectionTitle[section]}</h1>
          <div className="right">
            {section === 'posts' && (
              <button className="btn primary" onClick={() => { setEditId(null); setSection('editor'); }}>
                <Icon name="plus" size={14} /> New Post
              </button>
            )}
            {(section === 'editor' || section === 'work-editor') && (
              <button className="btn" onClick={() => setSection(section === 'editor' ? 'posts' : 'works')}>
                <Icon name="arrow-left" size={14} /> Back
              </button>
            )}
          </div>
        </div>

        {section === 'dashboard' && <Dashboard store={store} navigate={navigate} setSection={setSection} />}
        {section === 'posts' && <PostsAdmin store={store} setStore={setStore} setSection={setSection} setEditId={setEditId} />}
        {section === 'editor' && <PostEditor store={store} setStore={setStore} editId={editId} setSection={setSection} />}
        {section === 'works' && <WorksAdmin store={store} setStore={setStore} setSection={setSection} setEditWorkId={setEditWorkId} />}
        {section === 'work-editor' && <WorkEditorPanel store={store} setStore={setStore} editWorkId={editWorkId} setSection={setSection} />}
        {section === 'comments' && <CommentsAdmin store={store} setStore={setStore} />}
        {section === 'media' && <MediaAdmin store={store} setStore={setStore} />}
        {section === 'settings' && <SettingsAdmin store={store} setStore={setStore} />}
      </main>
    </div>
    <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}
