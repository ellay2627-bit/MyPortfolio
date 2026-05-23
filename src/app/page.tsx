import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import SectionLazyLoader from '@/components/SectionLazyLoader';

// 首屏以下模块不参与 SSR，避免首页 HTML 和 RSC 首包过重
const About = dynamic(() => import('@/components/About'), {
  ssr: false,
  loading: () => null,
});

const Work = dynamic(() => import('@/components/Work'), {
  ssr: false,
  loading: () => null,
});

const Awards = dynamic(() => import('@/components/Awards'), {
  ssr: false,
  loading: () => null,
});

const Stats = dynamic(() => import('@/components/Stats'), {
  ssr: false,
  loading: () => null,
});

// 作品区域的骨架屏
const WorkSkeleton = () => (
  <div className="py-48 md:py-32">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">我的<span className="text-primary">作品</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16 w-full">
          {/* 显示6个骨架屏，与实际作品数量一致 */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[4/3] bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 其他区域的骨架屏
const LoadingSkeleton = () => (
  <div className="py-20">
    <div className="container mx-auto px-4">
      <div className="h-64 bg-gray-800 rounded-xl animate-pulse"></div>
    </div>
  </div>
);

export default function Home() {
  return (
    <>
      {/* 首屏优先加载 - 立即显示 */}
      <Hero />
      
      {/* 懒加载About组件 */}
      <SectionLazyLoader rootMargin="200px 0px" minHeight="40vh">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="hidden md:block">
            <About />
          </div>
        </Suspense>
      </SectionLazyLoader>
      
      {/* 作品区域接近可视区时再加载，避免首页一打开就请求作品列表和详情逻辑 */}
      <SectionLazyLoader rootMargin="600px 0px" minHeight="60vh" id="work">
        <Suspense fallback={<WorkSkeleton />}>
          <Work />
        </Suspense>
      </SectionLazyLoader>
      
      {/* 懒加载其他组件 */}
      <SectionLazyLoader rootMargin="200px 0px" minHeight="40vh">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="hidden md:block">
            <Awards />
          </div>
          
          <Stats />
        </Suspense>
      </SectionLazyLoader>
    </>
  );
}
