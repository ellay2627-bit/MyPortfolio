'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // 初始检查一次，确保刷新时状态正确
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const showDropdownHandler = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowDropdown(true);
  };

  const hideDropdownHandler = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999]">
      <motion.div
        className="flex items-center w-full"
        initial={{ 
          padding: '1.25rem 1rem',
          height: 64,
          backgroundColor: 'transparent',
          border: 'none'
        }}
        animate={{ 
          padding: isScrolled ? '1rem 1rem' : '1.25rem 1rem',
          height: isScrolled ? 56 : 64,
          backgroundColor: isScrolled ? 'rgba(0, 14, 12, 0.4)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          border: isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
      >
        <div className="w-full flex items-center justify-between md:px-16 md:max-w-[1920px] md:mx-auto">
          {/* LOGO和导航链接居左 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-12">
              <motion.img 
                src="/images/logo.svg" 
                alt="Logo" 
                className="w-auto" 
                initial={{ height: 24 }}
                animate={{ height: isScrolled ? 20 : 24 }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeInOut"
                }}
              />
            </Link>

            {/* 桌面端导航链接 */}
            <div className="hidden md:flex space-x-12">
              <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
                首页
              </a>
              <a href="#about" className="text-white/80 hover:text-white text-sm transition-colors">
                关于我
              </a>
              <a href="#work" className="text-white/80 hover:text-white text-sm transition-colors">
                我的作品
              </a>
            </div>
          </div>

          {/* 桌面端右侧按钮组 */}
          <div className="hidden md:flex items-center gap-4">
            {/* 联系我按钮 - 次按钮 */}
            <motion.a 
              href="#contact" 
              className="px-4 py-2 font-light text-sm border border-[1px] bg-white/10 text-white transition-colors"
              style={{ 
                borderRadius: '9999px',
                borderColor: 'rgba(255, 255, 255, 0.12)'
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              联系我
            </motion.a>

            {/* 主按钮 - 作品集与简历 */}
            <div 
              className="relative"
              onMouseEnter={showDropdownHandler}
              onMouseLeave={hideDropdownHandler}
            >
              <motion.button
                onClick={toggleDropdown}
                className="px-4 py-2 rounded-full font-light text-sm border border-[1px] transition-colors relative overflow-hidden"
                style={{
                  background: '#00ECB2',
                  borderColor: '#00ECB2'
                }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* 扫光效果 */}
                <div className="scan-light"></div>
                <span className="relative z-10 text-dark-bg font-medium flex items-center gap-1.5">
                  作品集与简历
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-3.5 w-3.5 text-dark-bg transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </motion.button>
              
              {/* 下拉菜单 - 放在按钮容器内，确保与按钮对齐 */}
              {showDropdown && (
                <div 
                  className="absolute right-0 mt-0.25 w-48 bg-black/90 backdrop-blur-xl p-2 rounded-xl shadow-2xl border border-white/10 z-50"
                  style={{ 
                    top: isScrolled ? '48px' : '56px',
                    transform: 'translateX(0)'
                  }}
                  onMouseEnter={showDropdownHandler}
                  onMouseLeave={hideDropdownHandler}
                >
                  <a 
                    href="https://my.feishu.cn/docx/BVLndWUbJowcOlxo6aictD4AnRd?from=from_copylink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span>查看作品集</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a 
                    href="https://my.feishu.cn/docx/Uum0dmChuoWv9LxI9racjqYenqf?from=from_copylink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span>查看简历</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="text-white"
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">

            <div className="pt-4">
              <a 
                href="https://my.feishu.cn/docx/BVLndWUbJowcOlxo6aictD4AnRd?from=from_copylink"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm"
              >
                <span>查看作品集</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a 
                href="https://my.feishu.cn/docx/Uum0dmChuoWv9LxI9racjqYenqf?from=from_copylink"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm mt-2"
              >
                <span>查看简历</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <div className="pt-4 border-t border-white/10 mt-4">
                <div 
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText('188 1051 2527');
                    alert('电话号码已复制');
                  }}
                >
                  <span>我的电话</span>
                  <span className="text-primary">188 1051 2527</span>
                </div>
                <div 
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText('ellay2627@126.com');
                    alert('邮箱已复制');
                  }}
                >
                  <span>我的邮箱</span>
                  <span className="text-primary">ellay2627@126.com</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </nav>
  );
}
