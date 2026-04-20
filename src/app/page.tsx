import React from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Awards from '@/components/Awards';
import Stats from '@/components/Stats';
import VibeBubble from '@/components/VibeBubble';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="hidden md:block">
        <About />
      </div>
      <Work />
      <div className="hidden md:block">
        <Awards />
      </div>
      <Stats />
      <div className="hidden md:block">
        <VibeBubble />
      </div>
    </>
  );
}