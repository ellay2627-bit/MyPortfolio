import React, { lazy, Suspense } from 'react';
import Hero from '@/components/Hero';
import Work from '@/components/Work';

// 懒加载非首屏组件
const About = lazy(() => import('@/components/About'));
const Awards = lazy(() => import('@/components/Awards'));
const Stats = lazy(() => import('@/components/Stats'));
const VibeBubble = lazy(() => import('@/components/VibeBubble'));

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
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="hidden md:block">
          <About />
        </div>
      </Suspense>
      
      {/* 作品区域 - 直接导入，不使用懒加载 */}
      <Work />
      
      {/* 懒加载其他组件 */}
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="hidden md:block">
          <Awards />
        </div>
        
        <Stats />
        
        <div className="hidden md:block">
          <VibeBubble />
        </div>
      </Suspense>
    </>
  );
}