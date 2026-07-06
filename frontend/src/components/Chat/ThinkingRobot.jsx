import React, { useEffect, useRef, useMemo } from 'react';
import './ThinkingRobot.css';

export default function ThinkingRobot() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      const rx = (ny * -10).toFixed(2);
      const ry = (nx * 14).toFixed(2);
      parallaxRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const handleTouchMove = (e) => {
      if (!e.touches[0] || !parallaxRef.current) return;
      const t = e.touches[0];
      const nx = (t.clientX / window.innerWidth) * 2 - 1;
      const ny = (t.clientY / window.innerHeight) * 2 - 1;
      const rx = (ny * -10).toFixed(2);
      const ry = (nx * 14).toFixed(2);
      parallaxRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const handleMouseLeave = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const particles = useMemo(() => {
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
  }, []);

  return (
    <div className="robotStage" aria-label="Thinking...">
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
