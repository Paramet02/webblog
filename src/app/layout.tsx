import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/providers/StoreProvider';
import Nav from '@/components/Nav';
import TweaksPanel from '@/components/TweaksPanel';

export const metadata: Metadata = {
  title: 'paramet.notes',
  description: 'Code, AI & the tech worth talking about',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <StoreProvider>
          <Nav />
          <main style={{ flex: 1 }}>{children}</main>
          <footer className="footer">
            <div className="container">
              <div className="footer-inner">
                <span>© 2025 paramet.notes — Paramet Khing</span>
                <span>Made with ♥ and too much coffee</span>
              </div>
            </div>
          </footer>
          <TweaksPanel />
        </StoreProvider>
      </body>
    </html>
  );
}
