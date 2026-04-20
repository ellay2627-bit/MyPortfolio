'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LeafDecoration = () => (
  <img 
    src="/images/leaf.svg" 
    alt="leaf" 
    className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
  />
);

export default function Awards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    const awardsSection = document.getElementById('awards');
    if (awardsSection) {
      observer.observe(awardsSection);
    }

    return () => {
      if (awardsSection) {
        observer.unobserve(awardsSection);
      }
    };
  }, []);

  const awardsData = [
    {
      year: '年度',
      title: '最佳新人',
      subtitle: '2016年·网龙新人奖项',
      id: 1
    },
    {
      year: '年度',
      title: '项目突出贡献',
      subtitle: '2016年·网龙中小学项目',
      id: 2
    },
    {
      year: '年度',
      title: '十大新星',
      subtitle: '2021年·商越新人奖项',
      id: 3
    },
    {
      year: '教育部',
      title: '实名表扬信',
      subtitle: '2023-2025年·教育感谢信提及',
      id: 4
    },
    {
      year: '年度',
      title: '99设计大奖',
      subtitle: '2024年·网龙99奥斯卡设计大奖',
      id: 5
    },
    {
      year: '年度',
      title: 'AI设计创新奖',
      subtitle: '2025年·网龙中小学AI助手-小苗',
      id: 6
    }
  ];

  const [showDust, setShowDust] = useState(false);
  const [dustParticles, setDustParticles] = useState<Array<{ left: string; top: string; width: string; height: string; animationDuration: string; animationDelay: string; opacity: number }>>([]);

  useEffect(() => {
    // 在客户端渲染后显示粉尘效果，避免hydration错误
    setShowDust(true);
    
    // 预先生成粉尘粒子的随机值，避免每次渲染都重新计算
    const particles = Array.from({ length: 20 }).map(() => ({
      left: `${30 + Math.random() * 40}%`,
      top: `${0 + Math.random() * 30}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      animationDuration: `${Math.random() * 8 + 8}s`,
      animationDelay: `${Math.random() * 4}s`,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setDustParticles(particles);
  }, []);

  return (
    <section 
      id="awards" 
      className="pt-24 pb-12 bg-dark-bg relative overflow-hidden"
    >
      {/* 聚光灯效果 - 无边界设计，出场点亮后呼吸 */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? [0, 0, 0.3, 0.7, 1, 0.8] : 0 }}
        transition={{ 
          duration: 2.5,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          ease: "easeOut"
        }}
        style={{
          background: 'radial-gradient(ellipse 1200px 800px at 50% -20%, rgba(0, 236, 178, 0.22) 0%, rgba(0, 14, 12, 0) 70%)',
          animation: isVisible ? 'lightPulse 3s ease-in-out infinite 2.5s' : 'none'
        }}
      />
      
      {/* 聚光灯顶部描边 - 明确的线条效果，出场点亮后不呼吸 */}
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
        style={{
          height: '1px',
          width: '1200px',
          top: '0px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(96, 246, 220, 0.35) 50%, transparent 100%)'
        }}
      />
      
      {/* 粉尘效果 - 只在聚光灯区域，保持微弱扰动 */}
      {showDust && dustParticles.map((particle, index) => (
        <motion.div 
          key={index}
          className="absolute pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? particle.opacity : 0 }}
          transition={{ duration: 1, delay: 1.6 + index * 0.04, ease: "easeOut" }}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.width,
            height: particle.height,
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            borderRadius: '50%',
            animation: `dustFloat ${particle.animationDuration} ease-in-out infinite`,
            animationDelay: particle.animationDelay
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* 奖项展示部分 */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {/* web端保持grid布局，移动端改为横向滚动 */}
            <div className="hidden md:grid grid-cols-3 gap-1">
              {awardsData.map((award, index) => (
                <motion.div
                  key={award.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group p-6 min-w-[300px] flex flex-col items-center justify-center h-[200px] relative"
                >
                  <div className="text-center">
                    <p className="text-lg text-gray-400 mb-1 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                      {award.year}
                    </p>
                    <div className="flex items-center justify-center mb-1 group-hover:text-primary transition-colors duration-500">
                      <div className="transform scale-x-[-1]">
                        <LeafDecoration />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold mx-2 opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all duration-500 whitespace-nowrap">
                        {award.title}
                      </h3>
                      <LeafDecoration />
                    </div>
                    <p className="text-sm text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                      {award.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 移动端两行三列布局 - 支持左右滑动 */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <div className="grid grid-cols-3 gap-4">
                    {awardsData.slice(0, 3).map((award, index) => (
                      <motion.div
                        key={`mobile-top-${award.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className="group p-4 flex flex-col items-center justify-center h-[150px] flex-shrink-0"
                      >
                    <div className="text-center">
                      <p className="text-lg text-gray-400 mb-1 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                        {award.year}
                      </p>
                      <div className="flex items-center justify-center mb-1 group-hover:text-primary transition-colors duration-500">
                        <div className="transform scale-x-[-1]">
                          <LeafDecoration />
                        </div>
                        <h3 className="text-2xl font-bold mx-2 opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all duration-500 whitespace-nowrap">
                          {award.title}
                        </h3>
                        <LeafDecoration />
                      </div>
                      <p className="text-sm text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                        {award.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {awardsData.slice(3, 6).map((award, index) => (
                      <motion.div
                        key={`mobile-bottom-${award.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: (index + 3) * 0.1, duration: 0.6 }}
                        className="group p-4 flex flex-col items-center justify-center h-[150px] flex-shrink-0"
                      >
                        <div className="text-center">
                          <p className="text-lg text-gray-400 mb-1 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                            {award.year}
                          </p>
                          <div className="flex items-center justify-center mb-1 group-hover:text-primary transition-colors duration-500">
                            <div className="transform scale-x-[-1]">
                              <LeafDecoration />
                            </div>
                            <h3 className="text-2xl font-bold mx-2 opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all duration-500 whitespace-nowrap">
                              {award.title}
                            </h3>
                            <LeafDecoration />
                          </div>
                          <p className="text-sm text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                            {award.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
