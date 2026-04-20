'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import ProfileCard from './ProfileCard.jsx';

export default function About() {
  const [showTimeline, setShowTimeline] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .timeline-scrollbar::-webkit-scrollbar {
        width: 2px;
      }
      .timeline-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .timeline-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  useEffect(() => {
    if (showTimeline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showTimeline]);

  const careerData = [
    {
      period: '2022.08-今',
      company: '网龙网络科技公司',
      industry: '返聘',
      roles: ['UED | 中小学产品方向负责人 | 高级UI设计师']
    },
    {
      period: '2021.07-2022.08',
      company: '北京商越网络科技有限公司',
      industry: 'SaaS采购',
      roles: ['UED | 视觉设计师（组长）']
    },
    {
      period: '2017.06-2021.05',
      company: '网龙网络科技公司 | 华渔教育集团',
      industry: '互联网教育',
      roles: ['UED北京分处 | 创意设计师P7']
    },
    {
      period: '2012.05-2017.05',
      company: '天马传媒有限公司 | Xreal行空互动',
      industry: '4A创意广告',
      roles: ['北京分公司 | 视频设计师']
    },
    {
      period: '2010.05-2012.03',
      company: '烟台嘉禾乐天家居商场',
      industry: '商超',
      roles: ['平面设计师']
    }
  ];

  return (
    <section id="about" className="py-40 bg-dark-bg relative overflow-hidden">
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
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
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >

          <motion.div 
            className="space-y-8 relative"
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
            }}
          >
            <div className="absolute w-[500px] h-[500px] z-0 left-[-150px] top-[-150px] rounded-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent blur-3xl"></div>
            
            <motion.div
              className="absolute w-[400px] h-[400px] z-0 left-[-100px] top-[-100px]"
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 0.5, 0.3],
                scale: [0.8, 0.85, 0.8],
                rotate: [0, -1, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            >
              <img src="/images/dotgroup.png" alt="Background" className="w-full h-full object-contain" />
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-6xl font-bold space-y-6 relative z-10"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
              }}
            >
              <div className="transition-all duration-500 hover:tracking-widest">
                <span className="text-primary">Hi</span>,你好
              </div>
              <div className="transition-all duration-500 hover:tracking-widest">
                <span className="text-white/70">很开心认识你</span>
              </div>
            </motion.h2>
            
            <motion.div className="space-y-1 mt-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 } }
              }}
            >
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#00A57C] to-transparent text-white text-xl font-medium" style={{clear: 'both', display: 'block', width: 'fit-content'}}>
                几乎零差评的职场口碑
              </span>
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#00A57C] to-transparent text-white text-xl font-medium" style={{clear: 'both', display: 'block', width: 'fit-content'}}>
                每段工作均成为团队核心成员
              </span>
            </motion.div>

            <motion.div 
              className="space-y-4 text-lg text-gray-400 font-light mt-8"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.3 } }
              }}
            >
              <p>10 + 年设计行业经验，精通视觉 / UX / 动态设计，兼具团队管理能力；<br />
              秉持 "在其位，做到更好" 的理念，多次获评优秀员工 / 设计师称号；</p>
              
              <p>很荣幸，你看到了我。<br />
              让我们和设计一起变得更美好！</p>
            </motion.div>
            
            {/* 移动端查看履历按钮 - 放在最下方 */}
            <div className="md:hidden flex justify-center mt-12">
              <motion.button
                onClick={() => setShowTimeline(true)}
                className="px-4 py-2 bg-primary text-dark-bg rounded-full font-medium text-sm"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                查看个人履历
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } }
            }}
            className="hidden md:flex relative justify-center"
          >
            <motion.div
              className="absolute w-[700px] h-[700px] z-0 left-[-150px]"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [0.8, 0.85, 0.8],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            >
              <img src="/images/dotgroup.png" alt="Background" className="w-full h-full object-contain" />
            </motion.div>
            
            <ProfileCard
              name="李超"
              title="UX设计师/视觉设计师"
              showUserInfo
              enableTilt={true}
              enableMobileTilt
              onContactClick={() => setShowTimeline(true)}
              behindGlowColor="rgba(0, 236, 178, 0.4)"
              behindGlowEnabled
              behindGlowSize="50%"
              miniAvatarUrl=""
              innerGradient="linear-gradient(145deg, rgba(0, 236, 178, 0.4) 0%, rgba(31, 199, 158, 0.15) 100%)"
              籍贯="山东"
              年龄="37岁"
            />
          </motion.div>
        </motion.div>
      </div>

      {showTimeline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
          style={{ overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onMouseDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setShowTimeline(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="bg-dark-bg rounded-xl w-full max-w-2xl max-h-[80vh] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 px-8 py-4 bg-dark-bg/95 backdrop-blur-md">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">个人履历</h3>
                <motion.button
                  onClick={() => setShowTimeline(false)}
                  className="p-2 rounded-full hover:bg-gray-800 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-6 timeline-scrollbar" style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
            }}>
              <div className="relative space-y-8">
                {careerData.length > 1 && (
                  <div className="absolute left-2 top-1 bottom-0 w-0.5 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
                )}
                
                {careerData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative pl-6 pb-8 group"
                  >
                    <div className="absolute left-0 top-1 w-4 h-4 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                      <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors duration-300"></div>
                    </div>
                    
                    <div className="mb-3 flex items-center gap-3 flex-wrap">
                      <span className="text-xl font-light text-white/50 group-hover:text-primary transition-colors duration-300">{item.period}</span>
                      <span className="px-3 py-1 bg-white/5 text-white/50 rounded-lg text-sm group-hover:bg-white/10 group-hover:text-white/80 transition-colors duration-300">
                        {item.industry}
                      </span>
                    </div>
                    <h4 className="text-2xl font-semibold text-white/70 mb-4 group-hover:text-white transition-colors duration-300">
                      {item.company}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.roles.map((role, roleIndex) => (
                        <span 
                          key={roleIndex} 
                          className="px-4 py-2 bg-white/5 text-white/50 rounded-lg text-base group-hover:bg-primary/15 group-hover:text-primary transition-colors duration-300"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
