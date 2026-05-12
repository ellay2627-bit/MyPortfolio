'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';

// 静态数据缓存
let listData: any[] = [];
let listDataLoaded = false;
let loadListPromise: Promise<any[]> | null = null;

// 加载作品列表数据 - 优先从静态文件加载
const loadListData = async () => {
  if (!listDataLoaded) {
    if (!loadListPromise) {
      loadListPromise = new Promise(async (resolve) => {
        try {
          // 1. 优先从 public/static 加载（发布后的静态文件）
          try {
            const response = await fetch('/static/works-list.json');
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                listData = data;
                listDataLoaded = true;
                console.log('✅ 从静态文件加载列表，共', listData.length, '个作品');
                resolve(listData);
                return;
              }
            }
          } catch (staticError) {
            console.log('静态文件不存在，尝试其他来源...');
          }
          
          console.error('❌ 静态列表文件加载失败');
          listData = [];
          resolve(listData);
        } catch (error) {
          console.error('❌ 加载列表数据失败:', error);
          listData = [];
          resolve(listData);
        }
      });
    }
    return loadListPromise;
  }
  return listData;
};

// 加载作品详情数据 - 只从静态文件加载，快速高效
const loadWorkDetail = async (workId: string): Promise<any | null> => {
  try {
    const response = await fetch(`/static/work-${workId}.json`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 从静态文件加载详情:', workId);
      // 统一为字符串 id，便于列表和详情之间匹配
      return {
        ...data,
        id: String(data.id)
      };
    } else {
      console.error('❌ 静态详情文件不存在:', workId);
      return null;
    }
  } catch (error) {
    console.error('❌ 加载作品详情失败:', error);
    return null;
  }
};

// 缓存管理工具
const CACHE_KEY = 'portfolio_works';
const CACHE_DETAIL_KEY = 'portfolio_works_detail';
const CACHE_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7天缓存有效期 - 延长缓存时间

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

const toFallbackWork = (work: WorkListItem): WorkItem => ({
  id: work.id,
  title: work.title,
  brief: work.brief,
  description: '',
  category: work.category,
  cover: work.cover,
  ratio: work.ratio,
  order: work.order,
  media: [],
});

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
        initial={{ opacity: 0, y: 60 }}
        animate={{ 
          opacity: isInView ? 1 : 0, 
          y: isInView ? 0 : 60
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.21, 0.6, 0.35, 1],
          delay: index * 0.05 // 减少延迟，从0.15秒降到0.05秒
        }}
        className="relative"
      >
        {/* 作品卡片 - 直接显示，不再单独处理加载状态 */}
        <div 
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
        </div>
      </motion.div>
    </div>
  );
});

interface WorkDetailModalProps {
  work: WorkItem | null;
  workList: WorkListItem[];
  isScrolled: boolean;
  setIsScrolled: (value: boolean) => void;
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
  setSelectedWork: (work: WorkItem | null) => void;
  detailKey: number;
  setDetailKey: (key: number) => void;
  setSelectedImage: (image: string | null) => void;
  isLoading: boolean;
  setDetailLoading: (loading: boolean) => void;
  loadWorkDetail: (workId: string) => Promise<WorkItem | null>;
}

// 图片/视频骨架屏组件
const MediaSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-800 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-size-200 animate-shimmer"></div>
  </div>
);

// 单个媒体加载组件 - 带骨架屏
const MediaItemWithSkeleton = ({ 
  media, 
  index, 
  title, 
  onImageClick 
}: { 
  media: MediaItem, 
  index: number, 
  title: string, 
  onImageClick: (url: string) => void 
}) => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  
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

  return (
    <div 
      key={index} 
      className="mb-8 relative"
      style={{ animation: 'slideUp 0.6s ease-out', animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}
    >
      {/* 骨架屏 - 在加载过程中显示 */}
      {!mediaLoaded && (
        <div className="absolute inset-0 z-10">
          <MediaSkeleton />
        </div>
      )}

      {/* 实际媒体内容 */}
      <div className={mediaLoaded ? 'opacity-100' : 'opacity-0'}>
        {media.type === 'image' ? (
          <div className="relative overflow-hidden rounded-xl">
            <div className="relative overflow-hidden rounded-xl h-full">
              <img 
                src={media.url}
                alt={`${title} - 图片 ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => onImageClick(media.url)}
                loading="lazy"
                onLoad={() => setMediaLoaded(true)}
                onError={(e) => {
                  console.error('媒体图片加载失败:', media.url);
                  setMediaLoaded(true);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        ) : media.type === 'video' ? (
          <div className="relative overflow-hidden rounded-xl">
            <video
              src={media.url}
              title={`${title} - 视频 ${index + 1}`}
              className="w-full aspect-video border-none"
              controls
              muted
              playsInline
              onCanPlay={() => setMediaLoaded(true)}
            ></video>
          </div>
        ) : media.type === 'video-link' ? (
          <div className="relative overflow-hidden rounded-xl">
            <iframe 
              src={getEmbedUrl(media.url)}
              title={`${title} - 视频 ${index + 1}`}
              className="w-full aspect-video border-none"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              scrolling="no"
              frameBorder="0"
              onLoad={() => setMediaLoaded(true)}
            ></iframe>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const WorkDetailModal: React.FC<WorkDetailModalProps> = React.memo(({ 
  work, 
  workList, 
  isScrolled, 
  setIsScrolled, 
  showDetailModal, 
  setShowDetailModal, 
  setSelectedWork, 
  detailKey, 
  setDetailKey, 
  setSelectedImage,
  isLoading,
  setDetailLoading,
  loadWorkDetail
}) => {

  // 文字骨架屏组件
  const TextSkeleton = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-800 rounded animate-pulse ${className}`}></div>
  );

  const currentIndex = work ? workList.findIndex(item => String(item.id) === String(work.id)) : -1;
  const previousWork = currentIndex > 0 ? workList[currentIndex - 1] : null;
  const nextWork = currentIndex >= 0 && currentIndex < workList.length - 1 ? workList[currentIndex + 1] : null;

  const navigateToWork = (targetWork: WorkListItem | null) => {
    if (!targetWork) {
      return;
    }

    setDetailLoading(true);
    setSelectedWork(toFallbackWork(targetWork));
    setDetailKey(detailKey + 1);
    setIsScrolled(false);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollContainer = document.querySelector('.work-detail-scrollbar');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }, 50);

    loadWorkDetail(targetWork.id).then((targetWorkDetail) => {
      if (targetWorkDetail) {
        setSelectedWork(targetWorkDetail);
      }
    }).catch((error) => {
      console.error('加载相邻作品失败:', error);
    }).finally(() => {
      setDetailLoading(false);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-dark-bg z-[10000] overflow-x-hidden overflow-y-auto"
      style={{ animation: 'fadeIn 0.3s ease-in-out', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowDetailModal(false);
        }
      }}
    >
      {/* 从下往上的渐变发光背景 */}
      {work && work.media && (
        <div 
          className="fixed bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '200px',
            background: 'linear-gradient(to top, rgba(0, 236, 178, 0.25) 0%, rgba(0, 236, 178, 0.12) 30%, rgba(0, 14, 12, 0) 100%)',
            zIndex: 0
          }}
        />
      )}
      
      <div
        className="w-full h-full overflow-y-auto work-detail-scrollbar overflow-x-hidden"
        data-lenis-prevent
      >
        {/* 顶部标题和关闭按钮 - 吸顶 */}
        <div className={`sticky top-0 bg-dark-bg z-10 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="text-left flex-1 min-w-0">
                {work ? (
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
                className="p-2 rounded-full hover:bg-gray-800 transition-all text-white flex-shrink-0 ml-4"
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
          {work && work.links && work.links.length > 0 && (
            <div className="p-0 pt-12" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="flex flex-wrap gap-3">
                {work.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark-bg rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 z-50 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.url, '_blank');
                      return false;
                    }}
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
          {work ? (
            <div className="p-0 pt-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.2s', animationFillMode: 'both' }}>
              {isLoading ? (
                // 加载状态时显示骨架屏
                <div className="space-y-3">
                  <TextSkeleton className="h-4 w-full" />
                  <TextSkeleton className="h-4 w-5/6" />
                  <TextSkeleton className="h-4 w-4/6" />
                  <TextSkeleton className="h-4 w-5/6" />
                  <TextSkeleton className="h-4 w-full" />
                </div>
              ) : (
                // 加载完成后显示实际内容
                <div className="text-white/70 font-light leading-loose prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: work.description }} />
                </div>
              )}
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
            {work && work.media ? (
              work.media.sort((a, b) => a.order - b.order).map((media, index) => (
                <MediaItemWithSkeleton
                  key={index}
                  media={media}
                  index={index}
                  title={work.title}
                  onImageClick={setSelectedImage}
                />
              ))
            ) : isLoading ? (
              // 加载状态时显示骨架屏
              <>
                <div className="mb-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.3s', animationFillMode: 'both' }}>
                  <MediaSkeleton />
                </div>
                <div className="mb-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.4s', animationFillMode: 'both' }}>
                  <MediaSkeleton />
                </div>
                <div className="mb-8" style={{ animation: 'slideUp 0.6s ease-out', animationDelay: '0.5s', animationFillMode: 'both' }}>
                  <MediaSkeleton />
                </div>
              </>
            ) : (
              // 无媒体时显示空状态
              <div className="text-center py-12">
                <p className="text-white/50">暂无媒体内容</p>
              </div>
            )}
          </div>

            {/* 上下页导航区域 */}
            <div className="pt-12 pb-20 relative w-full">
              
              <div className="flex flex-row justify-between items-center w-full relative z-10">
                {/* 上一条 - 只有不是第一个作品时才显示 */}
                <div className="flex-1 flex justify-start">
                  {work && previousWork && (
                    <button 
                      onClick={() => navigateToWork(previousWork)}
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
                          <p className="hidden md:block text-white text-sm md:text-2xl font-medium">{previousWork.title}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* 下一条 - 只有不是最后一个作品时才显示 */}
                <div className="flex-1 flex justify-end">
                  {work && nextWork && (
                    <button 
                      onClick={() => navigateToWork(nextWork)}
                      className="flex items-center justify-end opacity-80 hover:opacity-100 transition-opacity duration-300 group"
                    >
                      <div className="text-right flex items-center">
                        <div>
                          <p className="text-white/60 text-xs md:text-sm">下一条</p>
                          <p className="hidden md:block text-white text-sm md:text-2xl font-medium">{nextWork.title}</p>
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
  const [loading, setLoading] = useState(true); // 初始显示骨架屏
  const [hasCache, setHasCache] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false); // 标记是否已经完成首次加载
  const [detailLoading, setDetailLoading] = useState(false); // 详情页加载状态
  const [showRefreshNotice, setShowRefreshNotice] = useState(false); // 显示刷新提示
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  // 数据更新处理函数
  const handleDataUpdate = useCallback(() => {
    console.log('收到数据更新通知，重新加载数据...');
    // 清除旧缓存
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CACHE_DETAIL_KEY}_`)) {
          localStorage.removeItem(key);
        }
      }
    }
    // 重新加载数据
    loadFromStaticData();
    // 显示刷新提示
    setShowRefreshNotice(true);
    setTimeout(() => setShowRefreshNotice(false), 3000);
  }, []);

  // 监听数据同步事件
  useEffect(() => {
    // 监听localStorage变化（跨标签页）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'publish_timestamp') {
        console.log('收到Storage事件，更新数据:', e.key);
        handleDataUpdate();
      }
    };
    
    // 监听自定义发布事件（同一标签页内）
    const handlePortfolioPublish = (event: CustomEvent) => {
      console.log('收到发布事件，更新数据:', event.detail);
      handleDataUpdate();
    };
    
    // 监听事件
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
    };
  }, [handleDataUpdate]);

  // 组件加载时立即获取数据
  useEffect(() => {
    // 立即开始初始化数据
    initializeData();
  }, []);

  // 保存详情页状态到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (showDetailModal && selectedWork) {
          const state = {
            showDetailModal,
            selectedWorkId: selectedWork.id
          };
          localStorage.setItem('portfolio_detail_state', JSON.stringify(state));
        } else {
          localStorage.removeItem('portfolio_detail_state');
        }
      } catch (error) {
        console.error('保存详情页状态失败:', error);
      }
    }
  }, [showDetailModal, selectedWork]);

  // 初始化数据 - 不再强制清除缓存，确保数据稳定
  const initializeData = () => {
    if (typeof window !== 'undefined') {
      console.log('开始初始化数据...');
      
      // 清除之前保存的详情页状态，确保每次打开都从主页开始
      try {
        localStorage.removeItem('portfolio_detail_state');
      } catch (error) {
        console.error('清除详情页状态失败:', error);
      }
      
      // 立即尝试从缓存加载，不阻塞渲染
      try {
        const cachedData = loadFromCache();
        if (cachedData) {
          console.log('从缓存快速加载数据...');
          setWorkList(cachedData.list);
          setHasCache(true);
          setLoading(false); // 有缓存立即停止加载状态
          setInitialLoaded(true); // 标记为已加载
          console.log('从缓存快速加载完成');
        }
      } catch (error) {
        console.error('从缓存加载失败:', error);
      }
      
      // 异步从静态数据加载（确保是最新的）- 完全不阻塞
      loadFromStaticData();
    }
  };

  // 从静态数据加载 - 优化：优先列表快速加载，完整数据按需加载
  const loadFromStaticData = () => {
    try {
      console.log('从静态数据加载作品数据...');
      
      // 立即开始加载列表数据（用于首页显示）
      loadListData().then((loadedListData) => {
        console.log('list.json 加载完成，开始处理数据...');
        
        // 快速提取列表所需的基本数据
        const listItems = loadedListData.map((work: any) => ({
          id: String(work.id || Date.now() + Math.random()),
          title: work.title || '未命名作品',
          category: Array.isArray(work.category) ? work.category : [],
          cover: work.cover || '',
          ratio: work.ratio || '4:3',
          brief: work.brief || '',
          order: typeof work.order === 'number' ? work.order : 0
        })).filter(item => item !== null);
        
        // 按order排序
        listItems.sort((a, b) => a.order - b.order);
        
        // 立即设置作品列表数据
        setWorkList(listItems);
        setLoading(false); // 立即停止加载状态
        console.log('作品列表数据加载完成，共', listItems.length, '个作品');
        
        // 缓存到本地 - 只缓存列表数据（不缓存完整数据，避免缓存过大）
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const cacheData = {
              list: listItems,
              timestamp: Date.now()
            };
            const cacheString = JSON.stringify(cacheData);
            console.log('缓存数据大小:', cacheString.length, '字符');
            localStorage.setItem(CACHE_KEY, cacheString);
            console.log('列表数据缓存成功，缓存键:', CACHE_KEY);
          } catch (storageError) {
            console.error('缓存数据失败:', storageError);
          }
        }
      }).catch((err) => {
        console.error('加载列表数据失败:', err);
        setLoading(false); // 加载失败也要停止加载状态
      });
      
      // 不等待数据加载，立即返回，确保首屏不被阻塞
    } catch (err) {
      console.error('从静态数据加载失败:', err);
      setLoading(false); // 加载失败也要停止加载状态
    }
  };

  // 从缓存加载列表数据 - 同步方式，更快
  const loadFromCache = (): { list: WorkListItem[] } | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            const now = Date.now();
            
            if (parsedData.timestamp && now - parsedData.timestamp < CACHE_VALIDITY) {
              if (parsedData.list && Array.isArray(parsedData.list)) {
                console.log('从缓存加载成功');
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

  // 从静态数据获取作品列表数据
  const fetchWorkList = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      console.log('从静态数据获取作品列表数据...');
      loadFromStaticData();
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
      console.log('从静态数据更新作品数据...');
      
      // 清除所有缓存，确保显示最新内容
      if (window.localStorage) {
        try {
          // 清除所有作品详情缓存
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${CACHE_DETAIL_KEY}_`)) {
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
      
      // 从静态数据加载最新内容
      loadFromStaticData();
    } catch (err) {
      console.error('后台更新数据失败:', err);
    }
  };
  
  // 从静态数据获取作品详情数据（带缓存，后台更新时会清除缓存）
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
      
      // 缓存不存在或已过期，从静态文件加载（快速！）
      console.log('从静态文件获取作品详情:', workId);
      
      // 直接从静态文件加载，不依赖 data.json
      const response = await fetch(`/static/work-${workId}.json`);
      if (!response.ok) {
        console.error('静态详情文件不存在:', workId);
        return null;
      }
      
      const work = await response.json();
      
      if (work) {
        // 转换数据格式
        let media: MediaItem[] = [];
        if (work.media && Array.isArray(work.media)) {
          media = work.media as MediaItem[];
        } else if ((work as any).images || (work as any).videos) {
          media = [
            ...(Array.isArray((work as any).images) ? (work as any).images : []).map((url: string, i: number) => ({
              type: 'image' as const,
              url,
              order: i
            })),
            ...(Array.isArray((work as any).videos) ? (work as any).videos : []).map((url: string, i: number) => ({
              type: 'video-link' as const,
              url,
              order: (Array.isArray((work as any).images) ? (work as any).images.length : 0) + i
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
          ratio: (work.ratio || '4:3') as '4:3' | '16:9',
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
    } catch (err) {
      console.error('获取作品详情数据出错:', err);
    }
    
    return null;
  };

  // 处理作品点击 - 优先打开模态框，立即加载单个作品详情
  const handleWorkClick = useCallback((work: WorkListItem) => {
    try {
      console.log('点击作品:', work.title, work.id);
      
      // 立即使用列表数据创建后备作品
      const fallbackWork = {
        id: work.id,
        title: work.title,
        brief: work.brief,
        description: '',
        category: work.category,
        cover: work.cover,
        ratio: work.ratio,
        order: work.order,
        media: []
      };
      
      // 立即打开模态框（毫秒级响应）
      setSelectedWork(fallbackWork);
      setIsScrolled(false);
      setShowDetailModal(true);
      setDetailLoading(true);
      setDetailKey(prev => prev + 1);
      console.log('模态框已打开，立即加载单个作品详情');
      
      // 直接加载单个作品详情，不依赖 data.json（1-4KB，极快）
      loadWorkDetail(work.id).then(fullWork => {
        console.log('单个作品详情加载完成:', fullWork ? '成功' : '失败');
        if (fullWork) {
          setSelectedWork(fullWork);
        }
      }).catch(error => {
        console.error('加载作品详情失败:', error);
      }).finally(() => {
        setDetailLoading(false);
      });
      
    } catch (error) {
      console.error('打开作品详情失败:', error);
      // 使用列表中的数据作为后备
      const fallbackWork = {
        id: work.id,
        title: work.title,
        brief: work.brief,
        description: '',
        category: work.category,
        cover: work.cover,
        ratio: work.ratio,
        order: work.order,
        media: []
      };
      
      setSelectedWork(fallbackWork);
      setIsScrolled(false);
      setShowDetailModal(true);
      setDetailKey(prev => prev + 1);
    }
  }, []);

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
    <section id="work" className="pt-48 pb-80 md:pt-32 md:pb-60 bg-dark-bg relative overflow-x-hidden">

      {/* 数据更新提示 */}
      <AnimatePresence>
        {showRefreshNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary/20 backdrop-blur-lg text-primary px-6 py-3 rounded-full border border-primary/30 shadow-xl shadow-primary/20"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">作品数据已更新</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 右侧亮光装饰 */}
      <div className="absolute w-[800px] h-[800px] z-0 right-[-300px] top-[100px] rounded-full bg-gradient-to-l from-primary/30 via-primary/10 to-transparent blur-3xl overflow-hidden"></div>
      
      {/* 右侧背景图片 - dotgroup.png */}
      <div className="absolute w-[600px] h-[600px] z-0 right-[-300px] top-[100px] opacity-30 animate-pulse overflow-hidden">
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
          {loading ? (
            // 加载中时显示骨架屏，数量与实际作品数量一致
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ 
                  opacity: 1, 
                  y: 0 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.21, 0.6, 0.35, 1],
                  delay: index * 0.05 // 减少延迟，从0.15秒降到0.05秒
                }}
                className="group relative"
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : filteredWorks.length > 0 ? (
            // 显示作品卡片
            filteredWorks.map((work, index) => (
              <WorkCard 
                key={work.id}
                work={work} 
                index={index} 
                onClick={() => handleWorkClick(work)}
                isLoaded={true}
              />
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
          workList={workList}
          isScrolled={isScrolled}
          setIsScrolled={setIsScrolled}
          showDetailModal={showDetailModal}
          setShowDetailModal={setShowDetailModal}
          setSelectedWork={setSelectedWork}
          detailKey={detailKey}
          setDetailKey={setDetailKey}
          setSelectedImage={setSelectedImage}
          isLoading={detailLoading}
          setDetailLoading={setDetailLoading}
          loadWorkDetail={loadWorkDetail}
        />
      )}
    </section>
  );
}
