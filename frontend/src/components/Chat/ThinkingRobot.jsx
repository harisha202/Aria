import { useRef, useState } from 'react';
import './ThinkingRobot.css';

export default function ThinkingRobot() {
  const parallaxRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!parallaxRef.current) return;
    const rect = parallaxRef.current.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
    const rx = (ny * -10).toFixed(2);
    const ry = (nx * 14).toFixed(2);
    parallaxRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0] || !parallaxRef.current) return;
    const t = e.touches[0];
    const rect = parallaxRef.current.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nx = Math.max(-1, Math.min(1, (t.clientX - centerX) / (rect.width / 2)));
    const ny = Math.max(-1, Math.min(1, (t.clientY - centerY) / (rect.height / 2)));
    const rx = (ny * -10).toFixed(2);
    const ry = (nx * 14).toFixed(2);
    parallaxRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleMouseLeave = () => {
    if (parallaxRef.current) {
      parallaxRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const [particles] = useState(() => {
    const MOTES = 12; // Scaled down for smaller UI
    const arr = [];
    for (let i = 0; i < MOTES; i++) {
      const left = Math.random() * 100;
      const dur = 4 + Math.random() * 5;
      const delay = -Math.random() * 8;
      const drift = (Math.random() * 30 - 15).toFixed(0) + 'px';
      arr.push({ id: i, left, dur, delay, drift });
    }
    return arr;
  });

  return (
    <div 
      className="robotStage" 
      aria-label="Thinking..."
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="parallax" ref={parallaxRef}>
        <div className="idle">
          <div className="robot">
            <div className="face front">
              <div className="visor">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
            <div className="face back"></div>
            <div className="face left"></div>
            <div className="face right"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
            <div className="antenna">
              <div className="tip"></div>
            </div>
            <div className="neck"></div>
            <div className="collar"></div>
          </div>
        </div>
      </div>
      <div className="ground"></div>
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="mote"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--drift': p.drift
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
