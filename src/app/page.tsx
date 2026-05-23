import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';

const SkeletonLine = ({ width, className = '' }: { width: string; className?: string }) => (
  <div
    className={`h-3 rounded-full bg-white/[0.05] ${className}`}
    style={{ width }}
  />
);

const SectionHeading = ({ title, accent }: { title: string; accent?: string }) => (
  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
    {title}
    {accent ? <span className="text-primary">{accent}</span> : null}
  </h2>
);

const SectionEyebrow = ({ text }: { text: string }) => (
  <p className="skeleton-glow-text text-primary/70 text-xs md:text-sm tracking-[0.28em] uppercase mb-4">{text}</p>
);

const SkeletonHint = ({ text, className = '' }: { text: string; className?: string }) => (
  <p className={`skeleton-glow-text text-white/30 text-sm md:text-base ${className}`}>{text}</p>
);

const AboutSkeleton = () => (
  <section className="hidden md:block py-24 bg-dark-bg">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-[220px_1fr] gap-10 items-start">
        <div className="space-y-4">
          {['关于我', '16年+设计积淀', '复合技能扎实', '大体量实战经验', '职业素养过硬'].map((label) => (
            <div key={label} className="rounded-full bg-white/[0.03] px-5 py-3 text-sm text-white/35">
              {label}
            </div>
          ))}
        </div>

        <div className="rounded-[32px] bg-white/[0.02] p-10">
          <SectionEyebrow text="About" />
          <SkeletonHint text="Hi, 我是李超" className="mb-4" />
          <SectionHeading title="用设计驱动" accent="业务增长的实战派" />
          <div className="space-y-3 mt-8">
            <SkeletonLine width="82%" />
            <SkeletonLine width="74%" />
            <SkeletonLine width="68%" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// 作品区域的骨架屏
const WorkSkeleton = () => (
  <section id="work" className="py-48 md:py-32 bg-dark-bg">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center">
        <SectionEyebrow text="Works" />
        <SectionHeading title="我的" accent="作品" />
        <SkeletonHint text="作品内容正在准备中，卡片会稍后替换为正式内容" className="mb-10" />
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['全部', 'UI/UX', '品牌视觉', 'AI探索'].map((item, index) => (
            <div
              key={item}
              className={`px-4 py-2 rounded-full text-sm ${
                index === 0
                  ? 'bg-primary/10 text-primary/80'
                  : 'bg-white/[0.03] text-white/30'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16 w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-white/[0.02] p-3">
              <div className="aspect-[4/3] bg-white/[0.05] rounded-xl" />
              <div className="mt-4 space-y-3">
                <SkeletonLine width="58%" />
                <SkeletonLine width="42%" className="h-2.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const AwardsSkeleton = () => (
  <section className="hidden md:block py-24 bg-dark-bg">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <SectionEyebrow text="Awards" />
        <SectionHeading title="奖项与" accent="经历" />
        <SkeletonHint text="正在载入奖项与阶段性成果" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[180px] rounded-2xl bg-white/[0.02] p-6 flex flex-col items-center justify-center">
            <SkeletonLine width="26%" className="mb-4" />
            <SkeletonLine width="62%" className="mb-3 h-4" />
            <SkeletonLine width="54%" className="h-2.5" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StatsSkeleton = () => (
  <section className="py-16 bg-dark-bg">
    <div className="container mx-auto px-4">
      <div className="rounded-2xl p-6 sm:p-8 md:p-12 min-h-[400px] bg-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <SectionEyebrow text="Contact" />
          <SectionHeading title="快来" accent="联系我" />
          <div className="space-y-4 mt-10 flex flex-col items-center">
            <SkeletonLine width="220px" />
            <SkeletonLine width="280px" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10">
            <div className="w-full sm:w-[180px] h-12 rounded-full bg-white/[0.05]" />
            <div className="w-full sm:w-[180px] h-12 rounded-full bg-white/[0.05]" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const About = dynamic(() => import('@/components/About'), {
  ssr: false,
  loading: () => <AboutSkeleton />,
});

const Work = dynamic(() => import('@/components/Work'), {
  ssr: false,
  loading: () => <WorkSkeleton />,
});

const Awards = dynamic(() => import('@/components/Awards'), {
  ssr: false,
  loading: () => <AwardsSkeleton />,
});

const Stats = dynamic(() => import('@/components/Stats'), {
  ssr: false,
  loading: () => <StatsSkeleton />,
});

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
    </>
  );
}
