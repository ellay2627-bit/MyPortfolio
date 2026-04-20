'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import ColorBends from './ColorBends.jsx';
import RotatingText from './RotatingText.jsx';

// 类型断言，解决RotatingText组件的类型错误
const RotatingTextComponent = RotatingText as React.ComponentType<any>;
import './ColorBends.css';
import './RotatingText.css';

export default function Hero() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const rotatingTextRef = useRef(null);
  const [boxWidth, setBoxWidth] = useState(0);
  
  const textArray = ['Ellay', '李超(李一轩)', 'UX设计师', '视觉设计师'];

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // 监听绿色框体宽度变化
  useEffect(() => {
    if (!rotatingTextRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setBoxWidth(width);
    });
    
    observer.observe(rotatingTextRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden" ref={ref}>
      {/* ColorBends动态背景 */}
      <ColorBends
        className="absolute inset-0 z-0"
        style={{ width: '100%', height: '100%' }}
        rotation={90}
        speed={0.2}
        colors={["#00ECB2"]}
        transparent
        autoRotate={0}
        scale={1.3}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.8}
        noise={0.15}
        iterations={1}
        intensity={1.7}
        bandWidth={2}
      />

      {/* 主要内容 - 设置pointer-events: none让鼠标事件穿透到背景 */}
      <div className="container mx-auto px-4 z-10 relative pointer-events-none">
        {/* 独立的 slogan 容器，专门做 layout 同步动画 */}
        <motion.div
          className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <motion.span 
              className="whitespace-nowrap"
              layout
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              你好，我是
            </motion.span>
            <RotatingTextComponent
              texts={textArray}
              mainClassName="px-3 sm:px-4 md:px-3 bg-gradient-to-r from-primary to-green-400 text-[#000E0C] overflow-hidden py-1 sm:py-2 md:py-2 rounded-lg justify-center"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
              splitBy="characters"
              auto
              loop
            />
          </div>
        </motion.div>

        {/* 其他内容，用原来的 staggerChildren 动画 */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: 'easeOut',
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <motion.p 
            className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } }
            }}
          >
            深耕设计/产品12年+，从UI到视觉到产品，全赛道闭环经验！
          </motion.p>
          {/* 按钮设置pointer-events: auto使其可点击 */}
          <motion.a
            href="#work"
            className="inline-flex items-center gap-2 px-4 py-2.5 backdrop-blur-lg bg-white/10 text-white rounded-full font-light text-base transition-all border border-[1px] pointer-events-auto"
            style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)', backgroundColor: 'rgba(0, 236, 178, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.4 } }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            查看作品
          </motion.a>
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
