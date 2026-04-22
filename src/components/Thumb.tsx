'use client';

interface ThumbProps {
  variant?: string;
}

export default function Thumb({ variant = '' }: ThumbProps) {
  const cls = `thumb${variant ? ` ${variant}` : ''}`;

  if (variant === 'v-design') {
    return (
      <div className={cls}>
        <div className="t-grid" />
        <div className="block b1" />
        <div className="block b2" />
        <div className="block b3" />
      </div>
    );
  }

  if (variant === 'v-code' || variant === 'v-note') {
    return <div className={cls} />;
  }

  return (
    <div className={cls}>
      <div className="t-grid" />
      <div className="t-a" />
      <div className="t-b" />
      <div className="t-c" />
    </div>
  );
}
