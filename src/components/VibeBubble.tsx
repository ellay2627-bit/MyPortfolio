'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VibeBubble() {
  const [showBubble, setShowBubble] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const bottomCounterRef = useRef(0);
  const bottomTimeRef = useRef<number | null>(null);
  const bottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAtBottomRef = useRef(false);

  const triggerBubble = () => {
    if (hasShown) return;
    setShowBubble(true);
    setHasShown(true);
    
    setTimeout(() => {
      setShowBubble(false);
    }, 4000);
  };

  const handleScroll = () => {
    if (hasShown) return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset;
    const clientHeight = window.innerHeight;
    
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (scrolledToBottom && !isAtBottomRef.current) {
      // 首次到达底部
      isAtBottomRef.current = true;
      bottomCounterRef.current += 1;
      
      // 记录到达底部的时间
      if (!bottomTimeRef.current) {
        bottomTimeRef.current = Date.now();
      }
      
      console.log('到达底部，计数:', bottomCounterRef.current);
      
      // 清除之前的超时
      if (bottomTimeoutRef.current) {
        clearTimeout(bottomTimeoutRef.current);
      }
      
      // 1秒后检查是否仍然在底部
      bottomTimeoutRef.current = setTimeout(() => {
        const currentTime = Date.now();
        const timeSpentAtBottom = bottomTimeRef.current ? currentTime - bottomTimeRef.current : 0;
        
        console.log('检查触发条件:', {
          timeSpentAtBottom,
          bottomCounter: bottomCounterRef.current
        });
        
        // 条件：第三次到达底部
        if (bottomCounterRef.current >= 3) {
          console.log('触发气泡！');
          triggerBubble();
        }
      }, 1000);
    } else if (!scrolledToBottom && isAtBottomRef.current) {
      // 离开底部
      isAtBottomRef.current = false;
      bottomTimeRef.current = null;
      if (bottomTimeoutRef.current) {
        clearTimeout(bottomTimeoutRef.current);
        bottomTimeoutRef.current = null;
      }
      console.log('离开底部');
    }
  };

  // 添加重置机制，页面刷新时重置状态
  useEffect(() => {
    setHasShown(false);
    bottomCounterRef.current = 0;
    bottomTimeRef.current = null;
    isAtBottomRef.current = false;
    if (bottomTimeoutRef.current) {
      clearTimeout(bottomTimeoutRef.current);
      bottomTimeoutRef.current = null;
    }
    console.log('重置状态');
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (bottomTimeoutRef.current) {
        clearTimeout(bottomTimeoutRef.current);
      }
    };
  }, [hasShown]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ 
              y: 100, 
              opacity: 0, 
              scale: 0.2,
              rotate: -5
            }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: [0.8, 1, 0.95, 1],
              rotate: 0
            }}
            exit={{ 
              y: 80, 
              opacity: 0, 
              scale: 0.4,
              rotate: 5
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 350, 
              damping: 14,
              scale: {
                duration: 0.4,
                repeat: 1,
                repeatType: 'reverse'
              }
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-emerald-400/20 to-primary/30 rounded-full blur-xl animate-pulse" />
              
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-primary/50 rounded-full px-6 py-4 shadow-xl backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-emerald-400/8 animate-pulse" />
                
                <motion.div
                  animate={{ 
                    scale: [0.98, 1.02, 0.98]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 8, -8, 0],
                        scale: [0.9, 1.1, 0.9]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1.5
                      }}
                    >
                      <span className="text-2xl">✨</span>
                    </motion.div>
                    
                    <div className="flex flex-col">
                      <p className="text-white font-normal text-xs md:text-sm whitespace-nowrap">
                        本站由Vibe Coding完成，还不错吧🥰
                      </p>
                    </div>
                    
                    <motion.div
                      animate={{ 
                        rotate: [0, -8, 8, 0],
                        scale: [0.9, 1.1, 0.9]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        delay: 0.5
                      }}
                    >
                      <span className="text-2xl">🌟</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                <div className="absolute top-3 right-6 w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-3 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    rotate: 360,
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <span className="text-xl">💫</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
