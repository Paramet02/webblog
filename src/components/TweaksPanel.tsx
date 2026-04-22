'use client';

import { useState } from 'react';
import { useStore, DEFAULT_TWEAKS } from '@/providers/StoreProvider';
import Icon from './Icon';

const HUE_SWATCHES = [
  { hue: 220, label: 'Blue' },
  { hue: 250, label: 'Indigo' },
  { hue: 280, label: 'Violet' },
  { hue: 170, label: 'Teal' },
  { hue: 145, label: 'Green' },
  { hue: 30, label: 'Orange' },
  { hue: 10, label: 'Red' },
  { hue: 320, label: 'Pink' },
];

export default function TweaksPanel() {
  const { tweaks, setTweaks } = useStore();
  const [open, setOpen] = useState(false);

  const set = (patch: Partial<typeof tweaks>) => setTweaks({ ...tweaks, ...patch });

  return (
    <>
      <button
        className="icon-btn"
        onClick={() => setOpen(!open)}
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 61, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
        title="Tweaks"
      >
        <Icon name="sliders" size={16} />
      </button>

      {open && (
        <div className="tweaks-panel" style={{ bottom: 68 }}>
          <div className="tweaks-head">
            <h3>Tweaks</h3>
            <button className="icon-btn" onClick={() => setOpen(false)}><Icon name="x" size={14} /></button>
          </div>
          <div className="tweaks-body">
            {/* Accent color */}
            <div className="tweak-row">
              <span className="label">Accent Color</span>
              <div className="swatches">
                {HUE_SWATCHES.map(s => (
                  <button
                    key={s.hue}
                    className={`swatch${tweaks.accentHue === s.hue ? ' on' : ''}`}
                    style={{ background: `oklch(0.58 0.16 ${s.hue})` }}
                    title={s.label}
                    onClick={() => set({ accentHue: s.hue })}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={tweaks.accentHue}
                onChange={e => set({ accentHue: Number(e.target.value) })}
                style={{ width: '100%', marginTop: 6 }}
              />
            </div>

            {/* Font */}
            <div className="tweak-row">
              <span className="label">Font</span>
              <div className="seg">
                {[['plex', 'IBM Plex'], ['manrope', 'Manrope'], ['sarabun', 'Sarabun']].map(([v, l]) => (
                  <button key={v} className={tweaks.fontPair === v ? 'on' : ''} onClick={() => set({ fontPair: v })}>{l}</button>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div className="tweak-row">
              <span className="label">Cards</span>
              <div className="seg">
                {[['soft', 'Soft'], ['minimal', 'Minimal'], ['cover', 'Cover']].map(([v, l]) => (
                  <button key={v} className={tweaks.cardVariant === v ? 'on' : ''} onClick={() => set({ cardVariant: v })}>{l}</button>
                ))}
              </div>
            </div>

            {/* Hero */}
            <div className="tweak-row">
              <span className="label">Hero</span>
              <div className="seg">
                {[['split', 'Split'], ['center', 'Center'], ['minimal', 'Minimal']].map(([v, l]) => (
                  <button key={v} className={tweaks.heroVariant === v ? 'on' : ''} onClick={() => set({ heroVariant: v })}>{l}</button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div className="tweak-row">
              <span className="label">Density</span>
              <div className="seg">
                {[['comfy', 'Comfy'], ['compact', 'Compact']].map(([v, l]) => (
                  <button key={v} className={tweaks.density === v ? 'on' : ''} onClick={() => set({ density: v })}>{l}</button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="tweak-row">
              <span className="label">Theme</span>
              <div className="seg">
                <button className={!tweaks.dark ? 'on' : ''} onClick={() => set({ dark: false })}>
                  <Icon name="sun" size={13} /> Light
                </button>
                <button className={tweaks.dark ? 'on' : ''} onClick={() => set({ dark: true })}>
                  <Icon name="moon" size={13} /> Dark
                </button>
              </div>
            </div>

            <button
              className="btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={() => setTweaks(DEFAULT_TWEAKS)}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </>
  );
}
