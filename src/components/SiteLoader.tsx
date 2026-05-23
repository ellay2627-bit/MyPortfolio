'use client';

import React, { useEffect, useState } from 'react';

export default function SiteLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const finish = () => {
      window.setTimeout(() => {
        setIsLeaving(true);
      }, 180);

      window.setTimeout(() => {
        setIsVisible(false);
      }, 480);
    };

    if (document.readyState === 'complete') {
      finish();
      return;
    }

    window.addEventListener('load', finish, { once: true });

    return () => {
      window.removeEventListener('load', finish);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`site-loader ${isLeaving ? 'site-loader--leaving' : ''}`} aria-hidden="true">
      <div className="site-loader__inner">
        <div className="site-loader__spinner" />
      </div>
    </div>
  );
}
