'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrueFocus from './TrueFocus';
import ShapeGrid from './ShapeGrid';


export default function Stats() {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <section id="stats" className="py-16 bg-dark-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* 联系部分 */}
        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="rounded-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden min-h-[400px] sm:h-[400px]"
          style={{ 
            background: 'linear-gradient(135deg, #011F1B 0%, #007D5E 30%, #011F1B 60%, #007D5E 80%, #011F1B 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 12s ease infinite'
          }}
        >
          {/* 背景装饰 - 放在最底层 */}
          <div style={{ 
            width: '100%', 
            height: '100%', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            zIndex: 1
          }}>
            <ShapeGrid 
              speed={0.25}
              squareSize={32}
              direction="down"
              borderColor="rgba(255, 255, 255, 0.02)"
              hoverFillColor="#00ECB2"
              shape="square"
              hoverTrailAmount={0}
            />
          </div>

          {/* 文案和按钮 - 放在上层，让鼠标事件穿透到背景 */}
          <div className="relative z-20 flex flex-col justify-center h-full pointer-events-none">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-5xl md:text-7xl font-bold mb-12 pointer-events-auto">
                <TrueFocus 
                  sentence="快来 联系我"
                  manualMode={false}
                  blurAmount={5}
                  borderColor="#00ECB2"
                  animationDuration={0.5}
                  pauseBetweenAnimations={1}
                />
              </h2>
              <div className="space-y-6 mb-12">
                <div className="flex items-center justify-center pointer-events-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xl text-white/70 mr-2">
                    {showPhone ? '188 1051 2527' : '188 **** 2527'}
                  </span>
                  <button 
                    onClick={() => setShowPhone(!showPhone)}
                    className="text-white/30 hover:text-primary transition-colors"
                  >
                    {showPhone ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center pointer-events-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:ellay2627@126.com" className="flex items-center hover:text-primary transition-colors">
                    <span className="text-xl text-white/70 mr-2">ellay2627@126.com</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-auto">
                <motion.a
                  href="https://my.feishu.cn/docx/BVLndWUbJowcOlxo6aictD4AnRd?from=from_copylink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 backdrop-blur-lg bg-white/10 text-white rounded-full font-light text-base transition-all border border-[1px]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)', backgroundColor: 'rgba(0, 236, 178, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  我的作品集
                </motion.a>
                <motion.a
                  href="https://my.feishu.cn/docx/Uum0dmChuoWv9LxI9racjqYenqf?from=from_copylink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 backdrop-blur-lg bg-white/10 text-white rounded-full font-light text-base transition-all border border-[1px]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)', backgroundColor: 'rgba(0, 236, 178, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  我的简历
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}