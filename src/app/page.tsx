import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import SectionLazyLoader from '@/components/SectionLazyLoader';

const About = dynamic(() => import('@/components/About'), { loading: () => null, ssr: false });
const Work = dynamic(() => import('@/components/Work'), { loading: () => null, ssr: false });
const Awards = dynamic(() => import('@/components/Awards'), { loading: () => null, ssr: false });
const Stats = dynamic(() => import('@/components/Stats'), { loading: () => null, ssr: false });
const VibeBubble = dynamic(() => import('@/components/VibeBubble'), { loading: () => null, ssr: false });

export default function Home() {
  return (
    <>
      {/* 首屏优先加载 - 立即显示 */}
      <Hero />

      {/* 只有 About 区域进入视口才加载组件 */}
      <SectionLazyLoader id="about" rootMargin="600px 0px" minHeight="820px" className="hidden md:block">
        <About />
      </SectionLazyLoader>

      {/* 作品区域按需加载，避免页面首屏加载全部内容 */}
      <SectionLazyLoader id="work" rootMargin="400px 0px" minHeight="1000px">
        <Work />
      </SectionLazyLoader>

      {/* Awards 区域按需加载 */}
      <SectionLazyLoader id="awards" rootMargin="400px 0px" minHeight="680px" className="hidden md:block">
        <Awards />
      </SectionLazyLoader>

      {/* 其他非首屏组件按需加载 */}
      <SectionLazyLoader id="stats" rootMargin="400px 0px" minHeight="680px">
        <Stats />
      </SectionLazyLoader>
      <SectionLazyLoader rootMargin="400px 0px" minHeight="1px" className="hidden md:block">
        <VibeBubble />
      </SectionLazyLoader>
    </>
  );
}
