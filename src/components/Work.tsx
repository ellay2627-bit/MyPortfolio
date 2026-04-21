'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import RealTimeSync from './RealTimeSync';

// 缓存管理工具
const CACHE_KEY = 'portfolio_works';
const CACHE_DETAIL_KEY = 'portfolio_works_detail';
const CACHE_VALIDITY = 24 * 60 * 60 * 1000; // 24小时缓存有效期

interface MediaItem {
  type: 'image' | 'video' | 'video-link';
  url: string;
  order: number;
}

interface WorkItem {
  id: string;
  title: string;
  category: string[];
  cover: string;
  ratio: '16:9' | '4:3';
  description: string;
  brief: string;
  order: number;
  media: MediaItem[];
  links?: {
    text: string;
    url: string;
    order: number;
  }[];
}

// 简化的作品数据结构（列表页使用）
interface WorkListItem {
  id: string;
  title: string;
  category: string[];
  cover: string;
  ratio: '16:9' | '4:3';
  brief: string;
  order: number;
}

interface WorkCardProps {
  work: WorkListItem;
  index: number;
  onClick: () => void;
  isLoaded: boolean;
}

// 骨架屏组件
const SkeletonCard = () => (
  <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-800/60">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/40 via-gray-700/60 to-gray-800/40 bg-size-200 animate-shimmer"></div>
  </div>
);

const WorkCard: React.FC<WorkCardProps> = React.memo(({ work, index, onClick, isLoaded }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <div className="group relative" ref={ref}>
      {/* 骨架屏和卡片是同一个容器 */}
      <motion.div
        key={work.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isInView ? 1 : 0, 
          y: isInView ? 0 : 20
        }}
        transition={{ 
          duration: 0.6, 
          ease: 'easeOut',
          delay: index * 0.1
        }}
        className="relative"
      >
        {/* 骨架屏 - 只在加载时显示 */}
        {!isLoaded && (
          <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-dark-bg">
            <SkeletonCard />
          </div>
        )}
        
        {/* 作品卡片 - 加载完成后显示 */}
        {isLoaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl aspect-[4/3] bg-dark-bg cursor-pointer"
            onClick={onClick}
          >
            {/* 发光效果 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <div className="absolute inset-0 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
            
            <div className="overflow-hidden rounded-xl h-full w-full">
              <img
                src={work.cover}
                alt={work.title}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  console.error('封面图片加载失败:', work.title);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-30 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-100 max-md:transition-none">
              <h3 className="text-xl font-semibold text-white mb-2 md:text-xl max-md:text-lg max-md:whitespace-normal max-md:word-wrap break-words">{work.title}</h3>
              <div className="flex flex-wrap gap-2">
                {work.category.map((cat, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">{cat}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});

interface WorkDetailModalProps {
  work: WorkItem | null;
  workData: WorkItem[];
  isScrolled: boolean;
  setIsScrolled: (value: boolean) => void;
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
  setSelectedWork: (work: WorkItem | null) => void;
  detailKey: number;
  setDetailKey: (key: number) => void;
  setSelectedImage: (image: string | null) => void;
  isLoading: boolean;
}

// 图片/视频骨架屏组件
const MediaSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-800 animate-pulse mb-8">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-size-200 animate-shimmer"></div>
  </div>
);

const WorkDetailModal: React.FC<WorkDetailModalProps> = React.memo(({ 
  work, 
  workData, 
  isScrolled, 
  setIsScrolled, 
  showDetailModal, 
  setShowDetailModal, 
  setSelectedWork, 
  detailKey, 
  setDetailKey, 
  setSelectedImage,
  isLoading
}) => {
  // 转换视频链接为嵌入链接
  const getEmbedUrl = (url: string): string => {
    // B站
    if (url.includes('bilibili.com')) {
      const bvidMatch = url.match(/BV[0-9A-Za-z]+/);
      if (bvidMatch) {
        return `https://player.bilibili.com/player.html?bvid=${bvidMatch[0]}&page=1`;
      }
    }
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([0-9A-Za-z_-]+)/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[0]}`;
      }
    }
    // 优酷
    if (url.includes('youku.com')) {
      return url;
    }
    return url;
  };

  // 文字骨架屏组件
  const TextSkeleton = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-800 rounded animate-pulse ${className}`}></div>
  );

  return (
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
                {work && !isLoading ? (
                  <>
                    <h2 className={`font-bold mb-2 transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-4xl'}`}>
                      {work.title}
                    </h2>
                    <p className={`text-white/50 text-lg font-light transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                      {work.brief}
                    </p>
                  </>
                ) : (
                  <>
                    <TextSkeleton className="h-8 mb-2 w-3/4" />
                    <TextSkeleton className="h-4 w-1/2" />
                  </>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-full hover:bg-gray-800 transition-all text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-[1200px] relative">
          {/* 链接按钮区域 */}
          {work && !isLoading && work.links && work.links.length > 0 && (
            <div className="p-0 pt-12" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="flex flex-wrap gap-3">
                {work.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark-bg rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
                  >
                    {link.text}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 简介区域 */}
          {work && !isLoading ? (
            <div className="p-0 pt-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="text-white/70 font-light leading-loose prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: work.description }} />
              </div>
            </div>
          ) : (
            <div className="p-0 pt-8">
              <TextSkeleton className="h-4 mb-3 w-full" />
              <TextSkeleton className="h-4 mb-3 w-5/6" />
              <TextSkeleton className="h-4 w-4/6" />
            </div>
          )}

          {/* 媒体展示区域 */}
          <div className="p-0 pt-6">
            {/* 图片和视频 */}
            {work && work.media && !isLoading ? (
              work.media.sort((a, b) => a.order - b.order).map((media, index) => (
                <div key={index} className="mb-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}>
                  {media.type === 'image' ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="relative overflow-hidden rounded-xl h-full">
                        <img 
                          src={media.url}
                          alt={`${work.title} - 图片 ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedImage(media.url)}
                          loading="lazy"
                          onError={(e) => {
                            console.error('媒体图片加载失败:', media.url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ) : media.type === 'video' ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <video
                        src={media.url}
                        title={`${work.title} - 视频 ${index + 1}`}
                        className="w-full aspect-video border-none"
                        controls
                        muted
                        playsInline
                      ></video>
                    </div>
                  ) : media.type === 'video-link' ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <iframe 
                        src={getEmbedUrl(media.url)}
                        title={`${work.title} - 视频 ${index + 1}`}
                        className="w-full aspect-video border-none"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        scrolling="no"
                        frameBorder="0"
                      ></iframe>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              // 加载状态时显示多个媒体骨架屏
              <>
                <MediaSkeleton />
                <MediaSkeleton />
                <MediaSkeleton />
              </>
            )}
          </div>

            {/* 上下页导航区域 */}
            <div className="pt-12 pb-20 relative w-full">
              {/* 从下往上的渐变发光背景 - 只在作品数据完全加载完成后显示 */}
              {work && !isLoading && work.media && (
                <div 
                  className="absolute bottom-0 left-[-100vw] right-[-100vw] pointer-events-none"
                  style={{
                    height: '200px',
                    background: 'linear-gradient(to top, rgba(0, 236, 178, 0.25) 0%, rgba(0, 236, 178, 0.12) 30%, rgba(0, 14, 12, 0) 100%)',
                    zIndex: 0
                  }}
                />
              )}
              
              <div className="flex flex-row justify-between items-center w-full relative z-10">
                {/* 上一条 */}
                <div className="flex-1 flex justify-start">
                  {workData.length > 0 && work && workData.findIndex(item => item.id === work.id) > 0 && (
                    <button 
                      onClick={() => {
                        const currentIndex = workData.findIndex(item => item.id === work.id);
                        setSelectedWork(workData[currentIndex - 1]);
                        setDetailKey(detailKey + 1);
                        setIsScrolled(false);
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          const scrollContainer = document.querySelector('.work-detail-scrollbar');
                          if (scrollContainer) {
                            scrollContainer.scrollTop = 0;
                          }
                        }, 50);
                      }}
                      className="flex items-center justify-start opacity-80 hover:opacity-100 transition-opacity duration-300 group"
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
                          <p className="text-white text-sm md:text-2xl font-medium">{workData[workData.findIndex(item => item.id === work.id) - 1].title}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* 下一条 */}
                <div className="flex-1 flex justify-end">
                  {workData.length > 0 && work && workData.findIndex(item => item.id === work.id) < workData.length - 1 && (
                    <button 
                      onClick={() => {
                        const currentIndex = workData.findIndex(item => item.id === work.id);
                        setSelectedWork(workData[currentIndex + 1]);
                        setDetailKey(detailKey + 1);
                        setIsScrolled(false);
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          const scrollContainer = document.querySelector('.work-detail-scrollbar');
                          if (scrollContainer) {
                            scrollContainer.scrollTop = 0;
                          }
                        }, 50);
                      }}
                      className="flex items-center justify-end opacity-80 hover:opacity-100 transition-opacity duration-300 group"
                    >
                      <div className="text-right flex items-center">
                        <div>
                          <p className="text-white/60 text-xs md:text-sm">下一条</p>
                          <p className="text-white text-sm md:text-2xl font-medium">{workData[workData.findIndex(item => item.id === work.id) + 1].title}</p>
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
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
});

interface ImageViewerProps {
  selectedImage: string;
  selectedWork: WorkItem;
  setSelectedImage: (image: string | null) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = React.memo(({ selectedImage, selectedWork, setSelectedImage }) => {
  return (
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
      {selectedWork.media.filter(m => m.type === 'image').map(m => m.url).indexOf(selectedImage) > 0 && (
        <button 
          onClick={() => {
            const currentIndex = selectedWork.media.filter(m => m.type === 'image').map(m => m.url).indexOf(selectedImage);
            const images = selectedWork.media.filter(m => m.type === 'image').map(m => m.url);
            setSelectedImage(images[currentIndex - 1]);
          }}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-primary transition-colors p-2 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}
      
      {/* 下一张 */}
      {selectedWork.media.filter(m => m.type === 'image').map(m => m.url).indexOf(selectedImage) < selectedWork.media.filter(m => m.type === 'image').map(m => m.url).length - 1 && (
        <button 
          onClick={() => {
            const currentIndex = selectedWork.media.filter(m => m.type === 'image').map(m => m.url).indexOf(selectedImage);
            const images = selectedWork.media.filter(m => m.type === 'image').map(m => m.url);
            setSelectedImage(images[currentIndex + 1]);
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
        {selectedWork.media.filter(m => m.type === 'image').map(m => m.url).indexOf(selectedImage) + 1} / {selectedWork.media.filter(m => m.type === 'image').length}
      </div>
    </div>
  );
});

export default function Work() {
  const [activeCategory, setActiveCategory] = useState('全部作品');
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [detailKey, setDetailKey] = useState(0);
  const [workList, setWorkList] = useState<WorkListItem[]>([]);
  const [workData, setWorkData] = useState<WorkItem[]>([]); // 存储完整的作品数据，用于上下页导航
  const [loading, setLoading] = useState(true);
  const [hasCache, setHasCache] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false); // 标记是否已经完成首次加载
  const [detailLoading, setDetailLoading] = useState(false); // 详情页加载状态
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // 组件加载时立即获取数据
  useEffect(() => {
    initializeData();
    
    // 检查是否有新的发布
    checkForUpdates();
    
    // 监听storage事件，实时检查更新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'publish_timestamp') {
        console.log('收到Storage事件，更新数据:', e.key);
        fetchWorks().then(() => {
          // 更新检查时间
          if (e.newValue) {
            localStorage.setItem('last_check_timestamp', e.newValue);
          }
        });
      }
    };
    
    // 监听自定义发布事件（同一标签页内）
    const handlePortfolioPublish = (event: CustomEvent) => {
      console.log('收到发布事件，更新数据:', event.detail);
      fetchWorks().then(() => {
        // 更新检查时间
        if (event.detail && event.detail.timestamp) {
          localStorage.setItem('last_check_timestamp', event.detail.timestamp.toString());
        }
      });
    };
    
    // 添加事件监听器
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
    
    // 定期检查更新（每30秒），确保即使没有事件也能同步
    const intervalId = setInterval(() => {
      checkForUpdates();
    }, 30000);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
      clearInterval(intervalId);
    };
  }, []);
  
  // 检查是否有新的发布
  const checkForUpdates = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const lastPublishTime = localStorage.getItem('publish_timestamp');
        const lastCheckTime = localStorage.getItem('last_check_timestamp');
        
        // 如果有新的发布且上次检查时间不同，则更新数据
        if (lastPublishTime && lastPublishTime !== lastCheckTime) {
          console.log('检测到新的发布，更新数据...');
          fetchWorks().then(() => {
            // 更新检查时间
            try {
              localStorage.setItem('last_check_timestamp', lastPublishTime);
            } catch (storageError) {
              console.error('更新检查时间失败:', storageError);
            }
          });
        }
      } catch (error) {
        console.error('检查更新失败:', error);
      }
    } else {
      // 如果没有localStorage，直接获取最新数据
      console.log('没有localStorage，直接获取最新数据...');
      fetchWorks();
    }
  };

  // 初始化数据
  const initializeData = async () => {
    if (typeof window !== 'undefined') {
      console.log('开始初始化数据...');
      
      // 每次都先显示骨架屏，然后获取最新数据
      setLoading(true);
      
      // 强制从服务器获取最新数据，不依赖缓存
      await fetchWorkList();
      setInitialLoaded(true);
      
      // 完成后停止加载状态
      setLoading(false);
    }
  };

  // 从缓存加载列表数据
  const loadFromCache = async (): Promise<{ list: WorkListItem[] } | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            const now = Date.now();
            
            if (parsedData.timestamp && now - parsedData.timestamp < CACHE_VALIDITY) {
              if (parsedData.list && Array.isArray(parsedData.list)) {
                return parsedData;
              }
            }
          } catch (parseError) {
            console.error('解析缓存数据失败:', parseError);
            // 解析失败时清除无效缓存
            try {
              localStorage.removeItem(CACHE_KEY);
            } catch (removeError) {
              console.error('清除无效缓存失败:', removeError);
            }
          }
        }
      } catch (error) {
        console.error('从缓存加载失败:', error);
      }
    }
    return null;
  };

  // 从服务器获取作品列表数据
  const fetchWorkList = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      console.log('开始获取作品列表数据...');
      // 添加时间戳参数，确保不使用浏览器缓存
      const worksResponse = await fetch(`/api/works?t=${Date.now()}`);
      console.log('API响应状态:', worksResponse.status);
      
      if (!worksResponse.ok) {
        throw new Error('获取作品列表数据失败');
      }
      
      const works = await worksResponse.json();
      console.log('获取到的作品数据:', works);
      
      if (works && Array.isArray(works) && works.length > 0) {
        // 转换数据格式为完整的WorkItem格式
        const formattedWorks = works.map((work: any) => {
          try {
            let media = [];
            if (work.media && Array.isArray(work.media)) {
              media = work.media;
            } else if (work.images || work.videos) {
              media = [
                ...(Array.isArray(work.images) ? work.images : []).map((url: string, i: number) => ({
                  type: 'image' as const,
                  url,
                  order: i
                })),
                ...(Array.isArray(work.videos) ? work.videos : []).map((url: string, i: number) => ({
                  type: 'video-link' as const,
                  url,
                  order: (Array.isArray(work.images) ? work.images.length : 0) + i
                }))
              ];
            }
            
            const result: WorkItem = {
              id: String(work.id || Date.now() + Math.random()),
              title: work.title || '未命名作品',
              brief: work.brief || '',
              description: work.description || '',
              category: Array.isArray(work.category) ? work.category : [],
              cover: work.cover || '',
              ratio: work.ratio || '4:3',
              order: typeof work.order === 'number' ? work.order : 0,
              media: media
            };
            
            if (work.links) {
              result.links = work.links;
            }
            
            return result;
          } catch (err) {
            console.error('处理单个作品数据失败:', err);
            return null;
          }
        }).filter((item): item is WorkItem => item !== null);
        
        // 按order排序
        formattedWorks.sort((a, b) => a.order - b.order);
        
        // 转换为列表数据格式
        const listItems = formattedWorks.map(work => ({
          id: work.id,
          title: work.title,
          category: work.category,
          cover: work.cover,
          ratio: work.ratio,
          brief: work.brief,
          order: work.order
        }));
        
        // 设置作品数据
        setWorkData(formattedWorks);
        setWorkList(listItems);
        
        // 缓存到本地 - 只缓存列表数据
        if (window.localStorage) {
          try {
            const cacheData = {
              list: listItems,
              timestamp: Date.now()
            };
            const cacheString = JSON.stringify(cacheData);
            console.log('缓存数据大小:', cacheString.length, '字符');
            localStorage.setItem(CACHE_KEY, cacheString);
            console.log('列表数据缓存成功，缓存键:', CACHE_KEY);
            
            // 验证缓存是否成功
            const verifyCache = localStorage.getItem(CACHE_KEY);
            if (verifyCache) {
              console.log('缓存验证成功');
            } else {
              console.log('缓存验证失败');
            }
          } catch (storageError) {
            console.error('缓存数据失败:', storageError);
            // 即使缓存失败，也继续显示数据
          }
        }
      }
    } catch (err) {
      console.error('获取作品列表数据出错:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 后台更新数据的函数，用于RealTimeSync组件
  const fetchWorks = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // 添加时间戳参数，确保不使用浏览器缓存
      const worksResponse = await fetch(`/api/works?t=${Date.now()}`);
      if (worksResponse.ok) {
        const works = await worksResponse.json();
        if (works && Array.isArray(works) && works.length > 0) {
          // 转换数据格式
          const formattedWorks = works.map((work: any) => {
            try {
              let media = [];
              if (work.media && Array.isArray(work.media)) {
                media = work.media;
              } else if (work.images || work.videos) {
                media = [
                  ...(Array.isArray(work.images) ? work.images : []).map((url: string, i: number) => ({
                    type: 'image' as const,
                    url,
                    order: i
                  })),
                  ...(Array.isArray(work.videos) ? work.videos : []).map((url: string, i: number) => ({
                    type: 'video-link' as const,
                    url,
                    order: (Array.isArray(work.images) ? work.images.length : 0) + i
                  }))
                ];
              }
              
              const result: WorkItem = {
                id: String(work.id || Date.now() + Math.random()),
                title: work.title || '未命名作品',
                brief: work.brief || '',
                description: work.description || '',
                category: Array.isArray(work.category) ? work.category : [],
                cover: work.cover || '',
                ratio: work.ratio || '4:3',
                order: typeof work.order === 'number' ? work.order : 0,
                media: media
              };
              
              if (work.links) {
                result.links = work.links;
              }
              
              return result;
            } catch (err) {
              console.error('处理单个作品数据失败:', err);
              return null;
            }
          }).filter((item): item is WorkItem => item !== null);
          
          // 按order排序
          formattedWorks.sort((a, b) => a.order - b.order);
          
          // 转换为列表数据格式
          const listItems = formattedWorks.map(work => ({
            id: work.id,
            title: work.title,
            category: work.category,
            cover: work.cover,
            ratio: work.ratio,
            brief: work.brief,
            order: work.order
          }));
          
          // 清除所有缓存，确保显示最新内容
          if (window.localStorage) {
            try {
              // 清除所有作品详情缓存
              for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_DETAIL_KEY)) {
                  localStorage.removeItem(key);
                  console.log('清除作品详情缓存:', key);
                }
              }
              // 清除列表缓存
              localStorage.removeItem(CACHE_KEY);
              console.log('清除列表缓存:', CACHE_KEY);
            } catch (cacheError) {
              console.error('清除缓存失败:', cacheError);
            }
          }
          
          // 更新作品数据
          setWorkData(formattedWorks);
          setWorkList(listItems);
          
          // 更新列表缓存
          if (window.localStorage) {
            try {
              const cacheData = {
                list: listItems,
                timestamp: Date.now()
              };
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
              console.log('列表数据缓存成功，缓存键:', CACHE_KEY);
            } catch (storageError) {
              console.error('缓存数据失败:', storageError);
            }
          }
        }
      }
    } catch (err) {
      console.error('后台更新数据失败:', err);
    }
  };
  
  // 从服务器获取作品详情数据（带缓存，后台更新时会清除缓存）
  const fetchWorkDetail = async (workId: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      // 首先尝试从缓存加载详情数据
      let cachedDetail = null;
      if (window.localStorage) {
        const cacheKey = `${CACHE_DETAIL_KEY}_${workId}`;
        
        try {
          cachedDetail = localStorage.getItem(cacheKey);
          
          if (cachedDetail) {
            try {
              const parsedDetail = JSON.parse(cachedDetail);
              const now = Date.now();
              
              // 检查缓存是否过期（24小时）
              if (parsedDetail.timestamp && now - parsedDetail.timestamp < CACHE_VALIDITY) {
                console.log('从缓存加载作品详情数据:', workId);
                return parsedDetail.data;
              }
            } catch (parseError) {
              console.error('解析缓存数据失败:', parseError);
              // 解析失败时清除无效缓存
              try {
                localStorage.removeItem(cacheKey);
              } catch (removeError) {
                console.error('清除无效缓存失败:', removeError);
              }
            }
          }
        } catch (cacheError) {
          console.error('读取缓存失败:', cacheError);
        }
      }
      
      // 缓存不存在或已过期，从服务器获取
      console.log('开始获取作品详情数据:', workId);
      const worksResponse = await fetch(`/api/works?t=${Date.now()}`);
      
      if (!worksResponse.ok) {
        throw new Error('获取作品详情数据失败');
      }
      
      const works = await worksResponse.json();
      
      if (works && Array.isArray(works)) {
        // 找到对应的作品
        const work = works.find((w: any) => String(w.id) === workId);
        
        if (work) {
          // 转换数据格式
          let media = [];
          if (work.media && Array.isArray(work.media)) {
            media = work.media;
          } else if (work.images || work.videos) {
            media = [
              ...(Array.isArray(work.images) ? work.images : []).map((url: string, i: number) => ({
                type: 'image' as const,
                url,
                order: i
              })),
              ...(Array.isArray(work.videos) ? work.videos : []).map((url: string, i: number) => ({
                type: 'video-link' as const,
                url,
                order: (Array.isArray(work.images) ? work.images.length : 0) + i
              }))
            ];
          }
          
          const result: WorkItem = {
            id: String(work.id || Date.now() + Math.random()),
            title: work.title || '未命名作品',
            brief: work.brief || '',
            description: work.description || '',
            category: Array.isArray(work.category) ? work.category : [],
            cover: work.cover || '',
            ratio: work.ratio || '4:3',
            order: typeof work.order === 'number' ? work.order : 0,
            media: media
          };
          
          if (work.links) {
            result.links = work.links;
          }
          
          // 缓存详情数据
          if (window.localStorage) {
            try {
              const cacheKey = `${CACHE_DETAIL_KEY}_${workId}`;
              const cacheData = {
                data: result,
                timestamp: Date.now()
              };
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              console.log('作品详情数据缓存成功:', workId);
            } catch (storageError) {
              console.error('缓存作品详情数据失败:', storageError);
            }
          }
          
          return result;
        }
      }
    } catch (err) {
      console.error('获取作品详情数据出错:', err);
    }
    
    return null;
  };

  // 处理作品点击
  const handleWorkClick = useCallback(async (work: WorkListItem) => {
    try {
      let fullWork = null;
      
      // 首先检查缓存是否存在
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheKey = `${CACHE_DETAIL_KEY}_${work.id}`;
        
        try {
          const cachedDetail = localStorage.getItem(cacheKey);
          
          if (cachedDetail) {
            try {
              const parsedDetail = JSON.parse(cachedDetail);
              const now = Date.now();
              
              if (parsedDetail.timestamp && now - parsedDetail.timestamp < CACHE_VALIDITY) {
                console.log('从缓存加载作品详情数据:', work.id);
                fullWork = parsedDetail.data;
              }
            } catch (parseError) {
              console.error('解析缓存数据失败:', parseError);
              // 解析失败时清除无效缓存
              try {
                localStorage.removeItem(cacheKey);
              } catch (removeError) {
                console.error('清除无效缓存失败:', removeError);
              }
            }
          }
        } catch (cacheError) {
          console.error('读取缓存失败:', cacheError);
        }
      }
      
      // 立即打开详情页
      setSelectedWork(fullWork || {
        id: work.id,
        title: work.title,
        brief: work.brief,
        description: '',
        category: work.category,
        cover: work.cover,
        ratio: work.ratio,
        order: work.order,
        media: []
      });
      
      setDetailLoading(!fullWork); // 只有在没有缓存时才显示加载状态
      setIsScrolled(false);
      setShowDetailModal(true);
      setDetailKey(detailKey + 1);
      
      // 如果没有缓存，从服务器获取数据
      if (!fullWork) {
        const workDetail = await fetchWorkDetail(work.id);
        if (workDetail) {
          setSelectedWork(workDetail);
        }
        
        // 确保workData不为空，用于导航
        if (workData.length === 0) {
          // 如果workData为空，从服务器获取完整列表
          await fetchWorkList();
        }
      }
    } catch (err) {
      console.error('打开作品详情失败:', err);
      setDetailLoading(false);
    } finally {
      setDetailLoading(false);
    }
  }, [detailKey, workData.length]);

  // 滚动监听 - 针对模态框内部
  useEffect(() => {
    if (typeof window !== 'undefined' && showDetailModal) {
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

  useEffect(() => {
    if (typeof window !== 'undefined' && showDetailModal) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showDetailModal]);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const categories = ['全部作品', 'UX设计', '视觉设计', '品牌设计', '动态设计', '其他'];

  const filteredWorks = activeCategory === '全部作品' 
    ? workList
    : workList.filter(item => item.category.includes(activeCategory));

  return (
    <section id="work" className="pt-48 pb-80 md:pt-32 md:pb-60 bg-dark-bg relative">
      {/* 实时数据同步组件 - 静默更新，不显示骨架屏 */}
      <RealTimeSync onDataUpdate={() => {
        // 后台静默更新数据，不改变加载状态
        fetchWorks().catch(err => console.error('后台更新数据失败:', err));
      }} />
      
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
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 w-full md:w-auto md:overflow-visible md:pb-0">
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
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 作品网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16 mt-2 sm:mt-12 md:mt-16 lg:mt-24 w-full">
          {filteredWorks.length > 0 ? (
            // 显示作品卡片，每个卡片包含自己的骨架屏
            filteredWorks.map((work, index) => (
              <WorkCard 
                key={work.id}
                work={work} 
                index={index} 
                onClick={() => handleWorkClick(work)}
                isLoaded={!loading || hasCache}
              />
            ))
          ) : loading ? (
            // 加载中时显示骨架屏占位，数量与实际作品数量一致
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="group relative">
                <SkeletonCard />
              </div>
            ))
          ) : (
            // 没有作品数据时显示空状态
            <div className="col-span-full text-center py-20">
              <p className="text-white/50 text-lg">暂无作品数据</p>
            </div>
          )}
        </div>
      </div>

      {/* 图片查看器 */}
      {selectedImage && selectedWork && (
        <ImageViewer 
          selectedImage={selectedImage} 
          selectedWork={selectedWork} 
          setSelectedImage={setSelectedImage} 
        />
      )}

      {/* 作品详情模态框 */}
      {showDetailModal && (
        <WorkDetailModal 
          key={detailKey}
          work={selectedWork || null}
          workData={workData}
          isScrolled={isScrolled}
          setIsScrolled={setIsScrolled}
          showDetailModal={showDetailModal}
          setShowDetailModal={setShowDetailModal}
          setSelectedWork={setSelectedWork}
          detailKey={detailKey}
          setDetailKey={setDetailKey}
          setSelectedImage={setSelectedImage}
          isLoading={detailLoading}
        />
      )}
      
      {/* 添加CSS动画 */}
      <style jsx global>{`
        /* 防止横向滚动 */
        html, body {
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
      `}</style>
    </section>
  );
}
