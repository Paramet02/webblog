// ─── Types ────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  date: string;
  readTime: number;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'scheduled';
  thumbVariant: string;
  featured?: boolean;
}

export interface Work {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string[];
  description: string;
  thumbVariant: string;
  featured?: boolean;
  role: string;
  stack: string;
  duration: string;
  status: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
  status: 'approved' | 'pending' | 'spam';
  likes: number;
}

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  thumbVariant: string;
  url?: string;
  storagePath?: string;
}

export interface ActivityItem {
  id: string;
  type: 'publish' | 'edit' | 'draft' | 'comment';
  text: string;
  when: string;
}

export interface Tag {
  name: string;
  count: number;
  hot?: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface StoreData {
  posts: Post[];
  works: Work[];
  comments: Comment[];
  media: MediaItem[];
  activity: ActivityItem[];
}

// ─── Static content (not stored in DB) ───────────────────────────────────────

export const TAGS: Tag[] = [
  { name: 'TypeScript', count: 14, hot: true },
  { name: 'React', count: 12, hot: true },
  { name: 'Design', count: 11, hot: true },
  { name: 'CSS', count: 9 },
  { name: 'Next.js', count: 8 },
  { name: 'Frontend', count: 7 },
  { name: 'Programming', count: 6 },
  { name: 'Career', count: 5 },
  { name: 'Animation', count: 4 },
  { name: 'Life', count: 4 },
  { name: 'Performance', count: 3 },
  { name: 'Design System', count: 3 },
  { name: 'Accessibility', count: 2 },
  { name: 'Node.js', count: 2 },
  { name: 'Testing', count: 1 },
];

export const ARTICLE_SECTIONS = [
  {
    id: 'intro',
    heading: 'Introduction',
    level: 2,
    content: `Design systems are more than just a collection of UI components. At their core, they represent a shared language — a contract between designers and engineers that reduces ambiguity and accelerates delivery.

The challenge isn't building the first version. It's building something that evolves gracefully with your product and your team.`,
  },
  {
    id: 'tokens',
    heading: 'Start with Tokens, Not Components',
    level: 2,
    content: `Before you write a single line of component code, define your design tokens. These are the primitive values that everything else inherits from: colors, spacing, typography, motion.`,
    codeBlock: `// tokens.ts
const tokens = {
  color: {
    accent: 'oklch(0.58 0.16 220)',
    bg: 'oklch(0.99 0.005 220)',
  },
  space: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  }
}`,
    callout: {
      emoji: '💡',
      text: 'Design tokens are the single source of truth for your design language. Change a token, and every component that uses it updates automatically.',
    },
  },
  {
    id: 'components',
    heading: 'Component Architecture',
    level: 2,
    content: `A well-structured component library separates concerns cleanly. Think in terms of layers: primitives, composites, and patterns.`,
    subSections: [
      {
        id: 'primitives',
        heading: 'Primitives',
        level: 3,
        content: `Primitives are the atoms of your system — Button, Input, Text, Box. They should accept tokens as props, not hardcoded values.`,
      },
      {
        id: 'composites',
        heading: 'Composites',
        level: 3,
        content: `Composites combine primitives into meaningful UI patterns — Card, Dialog, Form. They encapsulate layout and behavioral logic.`,
      },
    ],
  },
  {
    id: 'theming',
    heading: 'Theming Strategy',
    level: 2,
    content: `Modern theming goes beyond dark/light mode. Build for multi-brand, multi-theme from day one using CSS custom properties.`,
    quote: `"The best design systems I've worked with treat theming as a first-class concern, not an afterthought." — Designer at a major tech company`,
  },
  {
    id: 'docs',
    heading: 'Documentation as Product',
    level: 2,
    content: `Your documentation is as important as your components. Engineers won't use what they can't understand, and designers won't adopt what they can't see.

Use interactive examples, not static screenshots. Show the component in context. Document the why, not just the what.`,
  },
];
