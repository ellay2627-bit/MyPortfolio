'use client';
import React, { useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface WorkItem {
  id: number;
  title: string;
  category: string[];
  cover: string;
  ratio: '16:9' | '4:3';
  description: string;
  images: string[];
  videos: string[];
  brief: string;
}

export default function Work() {
  const [activeCategory, setActiveCategory] = useState('全部作品');
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [detailKey, setDetailKey] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // 滚动监听 - 针对模态框内部
  React.useEffect(() => {
    if (showDetailModal) {
      const scrollContainer = document.querySelector('.work-detail-scrollbar');
      if (scrollContainer) {
        const handleScroll = () => {
          setIsScrolled(scrollContainer.scrollTop > 100);
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
  }, [showDetailModal]);

  React.useEffect(() => {
    if (showDetailModal) {
      // 隐藏背景页面的滚动条
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复默认状态
      document.body.style.overflow = '';
    }
    return () => {
      // 清理函数
      document.body.style.overflow = '';
    };
  }, [showDetailModal]);

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const categories = ['全部作品', 'UX设计', '视觉设计', '品牌设计', '动态设计', '其他'];

  const workData: WorkItem[] = [
    {
      id: 1,
      title: '电商平台UI设计',
      category: ['UX设计', '品牌设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20e-commerce%20website%20UI%20design%20dark%20theme&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个现代化的电商平台UI设计，注重用户体验和视觉美感。设计采用了深色主题，突出产品展示，同时保持界面简洁明了。主要功能包括商品浏览、搜索、购物车和结算流程，所有交互都经过精心设计，确保用户操作流畅自然。',
      brief: '现代化电商平台UI设计，深色主题，流畅交互',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20e-commerce%20website%20UI%20design%20dark%20theme%20homepage&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20e-commerce%20website%20UI%20design%20dark%20theme%20product%20page&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20e-commerce%20website%20UI%20design%20dark%20theme%20cart&image_size=landscape_16_9'
      ],
      videos: ['https://player.bilibili.com/player.html?aid=12345678&bvid=BV12Z4y127VC&cid=123456789&page=1']
    },
    {
      id: 2,
      title: '移动应用界面设计',
      category: ['UX设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20UI%20design%20dark%20theme&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一款移动应用的界面设计，采用深色主题，注重用户体验和视觉美感。应用包含多个功能模块，包括首页、消息、个人中心等，所有界面都经过精心设计，确保在移动设备上的显示效果和交互体验最佳。',
      brief: '移动应用界面设计，深色主题，多模块功能',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20UI%20design%20dark%20theme%20home%20screen&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20UI%20design%20dark%20theme%20profile%20screen&image_size=portrait_4_3'
      ],
      videos: []
    },
    {
      id: 3,
      title: '品牌标志设计',
      category: ['品牌设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20logo%20design%20minimalist&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个极简风格的品牌标志设计，注重简洁和识别度。标志采用了几何图形和简洁的线条，传达出品牌的现代感和专业性。设计过程中考虑了不同场景下的应用，确保标志在各种尺寸和媒介上都能保持清晰和识别度。',
      brief: '极简风格品牌标志设计，几何图形，现代感',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20logo%20design%20minimalist%20variations&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20logo%20design%20minimalist%20application&image_size=landscape_16_9'
      ],
      videos: []
    },
    {
      id: 4,
      title: '产品包装设计',
      category: ['平面设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20packaging%20design%20modern&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一个现代化的产品包装设计，注重视觉效果和品牌传达。包装采用了简约的设计风格，使用了大胆的色彩和图形元素，突出产品的特点和品牌信息。设计过程中考虑了包装的功能性和环保性，确保包装既美观又实用。',
      brief: '现代化产品包装设计，简约风格，品牌传达',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20packaging%20design%20modern%20multiple%20views&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20packaging%20design%20modern%20unboxing&image_size=portrait_4_3'
      ],
      videos: []
    },
    {
      id: 5,
      title: '网站首页设计',
      category: ['UX设计', '平面设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=website%20homepage%20design%20dark%20theme&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个现代化的网站首页设计，采用深色主题，注重视觉效果和用户体验。首页包含了导航栏、英雄区、功能介绍、客户案例等多个部分，所有元素都经过精心设计，确保页面的美观性和功能性。设计过程中考虑了响应式布局，确保在不同设备上都能有良好的显示效果。',
      brief: '现代化网站首页设计，深色主题，响应式布局',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=website%20homepage%20design%20dark%20theme%20full%20page&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=website%20homepage%20design%20dark%20theme%20responsive&image_size=landscape_16_9'
      ],
      videos: []
    },
    {
      id: 6,
      title: '数据可视化界面',
      category: ['UX设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20dashboard%20dark%20theme&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个数据可视化界面设计，采用深色主题，注重数据的清晰展示和用户体验。界面包含了多种图表和数据展示组件，所有元素都经过精心设计，确保数据的可读性和界面的美观性。设计过程中考虑了用户的使用场景，确保界面既美观又实用。',
      brief: '数据可视化界面设计，深色主题，清晰展示',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20dashboard%20dark%20theme%20detailed&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20dashboard%20dark%20theme%20charts&image_size=landscape_16_9'
      ],
      videos: []
    },
    {
      id: 7,
      title: '品牌视觉识别系统',
      category: ['品牌设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20system%20design&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一个品牌视觉识别系统设计，包含了标志、色彩系统、字体、应用等多个部分。设计采用了现代的风格，注重品牌的一致性和识别度。整个系统经过精心设计，确保在各种应用场景下都能保持品牌的一致性和识别度。',
      brief: '品牌视觉识别系统设计，现代风格，一致性',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20system%20design%20guidelines&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20system%20design%20applications&image_size=portrait_4_3'
      ],
      videos: []
    },
    {
      id: 8,
      title: '海报设计',
      category: ['平面设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=poster%20design%20modern%20minimalist&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一个现代极简风格的海报设计，注重视觉效果和信息传达。海报采用了简洁的布局和大胆的色彩，突出主题信息，同时保持设计的美感。设计过程中考虑了海报的应用场景，确保在不同尺寸和媒介上都能有良好的显示效果。',
      brief: '现代极简风格海报设计，简洁布局，大胆色彩',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=poster%20design%20modern%20minimalist%20variations&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=poster%20design%20modern%20minimalist%20display&image_size=portrait_4_3'
      ],
      videos: []
    },
    {
      id: 9,
      title: '动画效果设计',
      category: ['动态设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animation%20effect%20design%20modern&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个现代动画效果设计，注重视觉效果和流畅性。动画采用了现代的风格和技术，创造出引人入胜的视觉体验。设计过程中考虑了不同设备和平台的兼容性，确保动画在各种环境下都能流畅运行。',
      brief: '现代动画效果设计，流畅视觉，引人入胜',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animation%20effect%20design%20modern%20frames&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animation%20effect%20design%20modern%20storyboard&image_size=landscape_16_9'
      ],
      videos: []
    },
    {
      id: 10,
      title: '用户体验研究',
      category: ['UX设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20experience%20research%20dashboard&image_size=landscape_16_9',
      ratio: '16:9',
      description: '这是一个用户体验研究项目，包含了用户调研、数据分析、用户旅程映射等多个部分。研究采用了科学的方法和工具，深入了解用户需求和行为，为产品设计提供数据支持。研究结果以直观的方式呈现，帮助团队更好地理解用户需求。',
      brief: '用户体验研究项目，科学方法，数据支持',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20experience%20research%20dashboard%20detailed&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20experience%20research%20user%20journey&image_size=landscape_16_9'
      ],
      videos: []
    },
    {
      id: 11,
      title: '字体设计',
      category: ['其他设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=font%20design%20modern%20minimalist&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一个现代极简风格的字体设计，注重可读性和美观性。字体采用了简洁的线条和几何形状，创造出独特的视觉效果。设计过程中考虑了不同使用场景的需求，确保字体在各种尺寸和媒介上都能保持清晰和美观。',
      brief: '现代极简风格字体设计，简洁线条，独特视觉',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=font%20design%20modern%20minimalist%20characters&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=font%20design%20modern%20minimalist%20application&image_size=portrait_4_3'
      ],
      videos: []
    },
    {
      id: 12,
      title: '图标设计',
      category: ['其他设计'],
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=icon%20set%20design%20modern%20minimalist&image_size=portrait_4_3',
      ratio: '4:3',
      description: '这是一个现代极简风格的图标设计，注重简洁性和识别度。图标采用了简洁的线条和几何形状，创造出一致的视觉语言。设计过程中考虑了不同使用场景的需求，确保图标在各种尺寸和媒介上都能保持清晰和识别度。',
      brief: '现代极简风格图标设计，简洁线条，一致语言',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=icon%20set%20design%20modern%20minimalist%20complete%20set&image_size=portrait_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=icon%20set%20design%20modern%20minimalist%20application&image_size=portrait_4_3'
      ],
      videos: []
    }
  ];

  const filteredWorks = activeCategory === '全部作品' 
    ? workData 
    : workData.filter(item => item.category.includes(activeCategory));

  return (
    <section id="work" className="pt-48 pb-80 md:pt-32 md:pb-60 bg-dark-bg relative">
      
      {/* 右侧亮光装饰 */}
      <div className="absolute w-[800px] h-[800px] z-0 right-[-200px] top-[100px] rounded-full bg-gradient-to-l from-primary/30 via-primary/10 to-transparent blur-3xl"></div>
      
      {/* 右侧背景图片 - dotgroup.png */}
      <div className="absolute w-[600px] h-[600px] z-0 right-[-200px] top-[100px] opacity-30 animate-pulse">
        <img src="/images/dotgroup.png" alt="Background" className="w-full h-full object-contain" />
      </div>
      
      <div className="w-full px-4 md:container md:mx-auto md:px-4 relative z-10">
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
          className="mb-6 md:mb-12"
        >
          
          {/* 标题和Tabs */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 w-full">
            <motion.h2 
              className="text-6xl sm:text-7xl md:text-4xl lg:text-5xl font-bold text-center md:text-left w-full md:w-auto"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
              }}
            >
              我的<span className="text-primary">作品</span>
            </motion.h2>
            
            {/* 分类Tabs - 移动端支持横向滑动 */}
        <motion.div 
          className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 w-full md:w-auto md:overflow-visible md:pb-0"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.3 } }
          }}
        >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-2 backdrop-blur-lg font-light text-sm transition-all border border-[1px] ${activeCategory === category 
                    ? 'bg-primary text-dark-bg border-primary font-medium' 
                    : 'bg-white/10 text-white'}`}
                  style={{ borderRadius: '9999px', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: activeCategory === category 
                      ? '0 0 30px rgba(0, 236, 178, 0.5)' 
                      : '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* 作品网格 */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16 mt-2 sm:mt-12 md:mt-16 lg:mt-24 w-full"
        >
          {filteredWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 1.0, 
                ease: 'easeOut',
                delay: index * 0.08 
              }}
              className="group relative"
            >
              <div 
                className="relative overflow-hidden rounded-xl aspect-[4/3] bg-dark-bg cursor-pointer"
                onClick={() => {
                  setSelectedWork(work);
                  setIsScrolled(false);
                  setShowDetailModal(true);
                  setDetailKey(prev => prev + 1);
                }}
              >
                {/* 发光效果 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-0 group-hover:opacity-100 transition-all duration-1000 z-10"></div>
                <div className="absolute inset-0 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-1000 z-20"></div>
                
                <div className="overflow-hidden rounded-xl h-full w-full">
                  <img
                    src={work.cover}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 flex flex-col justify-end p-6 z-30">
                  <h3 className="text-xl font-semibold text-white mb-2">{work.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {work.category.map((cat, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 图片查看器 */}
      {selectedImage && selectedWork && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors p-2 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* 上一张 */}
          {selectedWork.images.indexOf(selectedImage) > 0 && (
            <button 
              onClick={() => {
                const currentIndex = selectedWork.images.indexOf(selectedImage);
                setSelectedImage(selectedWork.images[currentIndex - 1]);
              }}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-primary transition-colors p-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}
          
          {/* 下一张 */}
          {selectedWork.images.indexOf(selectedImage) < selectedWork.images.length - 1 && (
            <button 
              onClick={() => {
                const currentIndex = selectedWork.images.indexOf(selectedImage);
                setSelectedImage(selectedWork.images[currentIndex + 1]);
              }}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-primary transition-colors p-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
          
          <img 
            src={selectedImage} 
            alt="全屏查看" 
            className="max-w-full max-h-full object-contain"
          />
          
          {/* 图片计数器 */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            {selectedWork.images.indexOf(selectedImage) + 1} / {selectedWork.images.length}
          </div>
        </div>
      )}

      {/* 作品详情模态框 */}
      {showDetailModal && selectedWork && (
        <div
          className="fixed inset-0 bg-dark-bg z-[10000] overflow-x-hidden"
          style={{ animation: 'fadeIn 0.3s ease-in-out', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
            }
          }}
        >
          <div
            className="w-full h-full overflow-y-auto work-detail-scrollbar overflow-x-hidden"
            data-lenis-prevent
          >
            {/* 顶部标题和关闭按钮 - 吸顶 */}
            <div className={`sticky top-0 bg-dark-bg z-10 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                  <div className="text-left w-full">
                    <h2 className={`font-bold mb-2 transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-4xl'}`}>
                      {selectedWork.title}
                    </h2>
                    <p className={`text-white/50 text-lg font-light transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                      {selectedWork.brief}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-full hover:bg-gray-800 transition-all text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>

            <div key={detailKey} className="container mx-auto px-4 max-w-[1200px] relative">
              {/* 简介区域 */}
              <div className="p-0 pt-12" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.1s', animationFillMode: 'both' }}>
                <p className="text-white/70 font-light leading-loose">{selectedWork.description}</p>
              </div>

              {/* 媒体展示区域 */}
              <div className="p-0 pt-6" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.2s', animationFillMode: 'both' }}>
                {/* 图片 */}
                {selectedWork.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 mb-8">
                    {selectedWork.images.map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}>
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse" style={{ height: '400px' }} id={`skeleton-${selectedWork.id}-${index}`}></div>
                        <div className="overflow-hidden rounded-xl h-full">
                          <img 
                            src={image} 
                            alt={`${selectedWork.title} - 图片 ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                            onLoad={(e) => {
                              const imgElement = e.currentTarget;
                              imgElement.style.opacity = '1';
                              const skeletonId = `skeleton-${selectedWork.id}-${index}`;
                              const skeletonElement = document.getElementById(skeletonId);
                              if (skeletonElement) {
                                skeletonElement.remove();
                              }
                            }}
                            style={{ opacity: '0', transition: 'opacity 0.3s ease-in-out' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 视频 */}
                {selectedWork.videos.length > 0 && (
                  <div className="grid grid-cols-1 gap-6">
                    {selectedWork.videos.map((video, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}>
                        <iframe 
                          src={video} 
                          title={`${selectedWork.title} - 视频 ${index + 1}`}
                          className="w-full aspect-video border-none"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 上下页导航区域 */}
              <div className="pt-12 pb-20 relative w-full" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.5s', animationFillMode: 'both' }}>
                {/* 从下往上的渐变发光背景 */}
                <motion.div 
                  className="absolute bottom-0 left-[-100vw] right-[-100vw] pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ 
                    opacity: [1, 0.7, 1],
                    transition: { 
                      opacity: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }
                  }}
                  viewport={{ once: false, margin: "0px 0px -100px 0px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    height: '200px',
                    background: 'linear-gradient(to top, rgba(0, 236, 178, 0.25) 0%, rgba(0, 236, 178, 0.12) 30%, rgba(0, 14, 12, 0) 100%)',
                    zIndex: 0
                  }}
                />
                
                <div className="flex flex-row justify-between items-center w-full relative z-10">
                  {/* 上一条 */}
                  <div className="flex-1 flex justify-start">
                    {workData.findIndex(item => item.id === selectedWork.id) > 0 && (
                      <motion.button 
                        onClick={() => {
                          const currentIndex = workData.findIndex(item => item.id === selectedWork.id);
                          setSelectedWork(workData[currentIndex - 1]);
                          // 更新key以强制重新渲染，确保动画和骨架加载效果
                          setDetailKey(prev => prev + 1);
                          // 重置滚动状态
                          setIsScrolled(false);
                          // 滚动到顶部
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            // 找到滚动容器并滚动到顶部
                            const scrollContainer = document.querySelector('.work-detail-scrollbar');
                            if (scrollContainer) {
                              scrollContainer.scrollTop = 0;
                            }
                          }, 50);
                        }}
                        className="flex items-center justify-start opacity-80 hover:opacity-100 transition-opacity duration-300 group"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-left flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 flex-shrink-0 transition-all duration-300 group-hover:mr-4 md:group-hover:mr-6 group-hover:text-primary" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <div>
                            <p className="text-white/60 text-xs md:text-sm">上一条</p>
                            <p className="text-white text-sm md:text-2xl font-medium">{workData[workData.findIndex(item => item.id === selectedWork.id) - 1].title}</p>
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </div>

                  {/* 下一条 */}
                  <div className="flex-1 flex justify-end">
                    {workData.findIndex(item => item.id === selectedWork.id) < workData.length - 1 && (
                      <motion.button 
                        onClick={() => {
                          const currentIndex = workData.findIndex(item => item.id === selectedWork.id);
                          setSelectedWork(workData[currentIndex + 1]);
                          // 更新key以强制重新渲染，确保动画和骨架加载效果
                          setDetailKey(prev => prev + 1);
                          // 重置滚动状态
                          setIsScrolled(false);
                          // 滚动到顶部
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            // 找到滚动容器并滚动到顶部
                            const scrollContainer = document.querySelector('.work-detail-scrollbar');
                            if (scrollContainer) {
                              scrollContainer.scrollTop = 0;
                            }
                          }, 50);
                        }}
                        className="flex items-center justify-end opacity-80 hover:opacity-100 transition-opacity duration-300 group"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-right flex items-center">
                          <div>
                            <p className="text-white/60 text-xs md:text-sm">下一条</p>
                            <p className="text-white text-sm md:text-2xl font-medium">{workData[workData.findIndex(item => item.id === selectedWork.id) + 1].title}</p>
                          </div>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 md:h-6 md:w-6 ml-2 md:ml-3 flex-shrink-0 transition-all duration-300 group-hover:ml-4 md:group-hover:ml-6 group-hover:text-primary" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}