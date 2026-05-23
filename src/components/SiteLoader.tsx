'use client';

import React, { useEffect, useState } from 'react';

export default function SiteLoader() {
  const [progress, setProgress] = useState(8);
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let current = 8;

    const progressTimer = window.setInterval(() => {
      current = Math.min(current + (current < 70 ? 7 : current < 88 ? 3 : 1), 92);
      setProgress(current);
    }, 120);

    const finish = () => {
      window.clearInterval(progressTimer);
      setProgress(100);

      window.setTimeout(() => {
        setIsLeaving(true);
      }, 180);

      window.setTimeout(() => {
        setIsVisible(false);
      }, 480);
    };

    if (document.readyState === 'complete') {
      finish();
      return () => {
        window.clearInterval(progressTimer);
      };
    }

    window.addEventListener('load', finish, { once: true });

    return () => {
      window.clearInterval(progressTimer);
      window.removeEventListener('load', finish);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`site-loader ${isLeaving ? 'site-loader--leaving' : ''}`} aria-hidden="true">
      <div className="site-loader__inner">
        <div className="site-loader__track">
          <div className="site-loader__bar" style={{ ['--loader-progress' as string]: `${Math.max(progress, 2) / 100}` }} />
        </div>
        <p className="site-loader__text">页面加载中，请耐心等待...</p>
      </div>
    </div>
  );
}
