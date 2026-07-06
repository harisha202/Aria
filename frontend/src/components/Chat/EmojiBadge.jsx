import React, { useState, useCallback } from 'react';
import './EmojiBadge.css';

export default function EmojiBadge({ emoji }) {
  const [bursts, setBursts] = useState([]);

  const handleClick = useCallback(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const newBursts = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      bx: `${(Math.random() * 60 - 30).toFixed(0)}px`,
      by: `${(Math.random() * -40 - 20).toFixed(0)}px`,
      br: `${(Math.random() * 90 - 45).toFixed(0)}deg`,
    }));

    setBursts(prev => [...prev, ...newBursts]);

    // Clean up bursts after animation
    setTimeout(() => {
      setBursts(prev => prev.filter(b => !newBursts.find(nb => nb.id === b.id)));
    }, 600);
  }, []);

  return (
    <div className="emoji-badge-container" onClick={handleClick}>
      <div className="emoji-badge" title="Reaction">
        {emoji}
      </div>
      {bursts.map(b => (
        <div
          key={b.id}
          className="burst-emoji"
          style={{
            '--bx': b.bx,
            '--by': b.by,
            '--br': b.br
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}
