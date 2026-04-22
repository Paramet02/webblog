'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/providers/StoreProvider';
import Icon from './Icon';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Works', href: '/works' },
  { label: 'Tags', href: '/tags' },
  { label: 'About', href: '/about' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { tweaks, setTweaks } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQ(val);
    if (val) {
      router.push(`/search?q=${encodeURIComponent(val)}`);
    } else {
      router.push('/search');
    }
  };

  const handleSearchFocus = () => {
    if (!pathname.startsWith('/search')) {
      router.push('/search');
    }
  };

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <div className="brand-mark" />
            <span>paramet</span>
          </Link>

          <div className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive(link.href) ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="nav-link nav-link-admin-mobile"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          </div>

          <div className="nav-right">
            <div className="search">
              <Icon name="search" size={14} />
              <input
                placeholder="Search..."
                value={searchQ}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
              />
              <kbd>/</kbd>
            </div>

            <button
              className="icon-btn nav-search-icon"
              onClick={() => { router.push('/search'); setMobileOpen(false); }}
              title="Search"
            >
              <Icon name="search" size={16} />
            </button>

            <button
              className="icon-btn"
              onClick={() => setTweaks({ ...tweaks, dark: !tweaks.dark })}
              title={tweaks.dark ? 'Light mode' : 'Dark mode'}
            >
              <Icon name={tweaks.dark ? 'sun' : 'moon'} size={16} />
            </button>

            <Link href="/admin" className="icon-btn primary" title="Admin">
              <Icon name="settings" size={15} />
            </Link>

            <button
              className="icon-btn nav-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
