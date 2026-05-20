'use client'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSectionScrollContext } from '@/contexts/SectionScrollProvider'
import { preloadAboutAssets } from '@/lib/aboutAssets'

interface AboutProps {
  activeTab?: number
  onTabChange?: (tab: number) => void
  onNavigate?: (section: 'hero' | 'work') => void
}

const tabData = [
  {
    id: 0,
    label: '关于我',
    title1: 'Hi,我是李超',
    title2: '用设计驱动\n业务增长的实战派',
    description: '主导过亿级用户国家级平台的实战派，\n拿过教育部的点名感谢，也搞得定最新的AI智能体落地',
    hasButton: true
  },
  {
    id: 1,
    label: '16年+设计积淀',
    title1: 'Hi,我是李超',
    title2: '16年+设计积淀\n经验十足',
    description: '跨越互联网、SaaS、4A，\n从视觉到管理，经验都是实打实磨出来的',
    hasButton: true
  },
  {
    id: 2,
    label: '复合技能扎实',
    title1: 'Hi,我是李超',
    title2: '复合技能扎实\n超有实力',
    description: 'UX/视觉设计行家，动效设计加持，掌握AI，\n独立完成从产品策划到视觉落地的全过程。',
    hasButton: true
  },
  {
    id: 3,
    label: '大体量实战经验',
    title1: 'Hi,我是李超',
    title2: '大体量实战经验\n主导设计与带队',
    description: '主导过亿级用户平台的设计工作，\n懂得如何在复杂逻辑中寻找最优解',
    hasButton: true
  },
  {
      id: 4,
      label: '职业素养过硬',
      title1: 'Hi,我是李超',
      title2: '职业素养过硬\n每段履历均好评',
      description: '追求高效，拒绝低效加班，\n善于沟通，重视口碑，入职即能上手并产生价值。',
      hasButton: true
    }
]
 
const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  // Reduce per-character animations to avoid heavy re-renders.
  // For immediate performance relief we render static text.
  // This respects prefers-reduced-motion; for future, we can enable per-char animation conditionally.
  // Force-disable per-character animations to avoid text flicker and reduce CPU usage.
  const shouldAnimate = true

  if (!shouldAnimate) {
    return (
      <span style={{ display: 'block', overflow: 'hidden' }} suppressHydrationWarning>
        {text.split('\n').map((s, i) => (
          <React.Fragment key={i}>
            {s}
            {i < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    )
  }

  const segments = text.split('\n')
  
  return (
    <span style={{ display: 'block', overflow: 'hidden' }} suppressHydrationWarning>
      {segments.map((segment, segIndex) => (
        <React.Fragment key={segIndex}>
          {Array.from(segment).map((char, index) => (
            <motion.span
              key={`${segIndex}-${index}`}
              initial={{ 
                opacity: 0
              }}
              animate={{ 
                opacity: 1
              }}
              transition={{
                duration: 0.05,
                delay: (segIndex * 0.05) + (index * 0.04),
                ease: 'easeIn'
              }}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
          {segIndex < segments.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  )
}
 
const tabNames = ['能力分析', '大事记', '工作经历']

const eventsData = [
  {
    year: '2026',
    tag: 'AI+UX 落地实战',
    title: '定义新一代"智能备授课"工具',
    description: '拒绝功能堆砌，回归教学本质。主导了从"传统数字化工具"向"AI 驱动智能系统"的进阶升级'
  },
  {
    year: '2025',
    tag: 'AI智能体实战',
    title: '主导"育小苗"AI 助手落地',
    description: '拒绝 AI 泡沫，将智能交互真实落地于亿级教育产品。通过 AI 辅助流转，将团队设计效能提升300%'
  },
  {
    year: '2024',
    tag: '峰值突破',
    title: '见证用户数破1亿大关',
    description: '负责"国家中小学智慧教育平台"UED 设计，与团队一起支撑超1亿用户的日常高频使用，具备应对极端复杂场景的设计掌控力'
  },
  {
    year: '2023',
    tag: '官方致谢',
    title: '获教育部点名感谢信',
    description: '凭借在国家级战略项目中的卓越表现，获得教育部官方发函致谢（团队之一）'
  },
  {
    year: '2022',
    tag: '榜首成就',
    title: 'App Store教育类下载量第一',
    description: '主导并参与设计中小学产品的改版设计，助力登顶教育类榜首'
  },
  {
    year: '2021',
    tag: 'SaaS变革',
    title: 'SaaS采购品牌强势升级',
    description: '商越品牌大规模全新升级，最大规模发布会宣布革新'
  },
  {
    year: '2019',
    tag: '行业领跑',
    title: '助力华渔教育成为行业龙头',
    description: '5年深耕，从0到1参与构建多端设计规范，统筹北京团队，期间获评优秀设计师及设计创新奖'
  },
  {
    year: 'BEFORE',
    tag: '视觉跨界成长',
    title: '服务 CCTV 及多家省级卫视',
    description: '进修影视包装，跨界视频/动画设计，作品入选央视优秀创意栏目，连续三年获评最佳员工，完成了从平面到动态视觉的维度升级'
  }
]

export default function About({ activeTab: propActiveTab, onTabChange: propOnTabChange, onNavigate }: AboutProps) {
  const [showTimeline, setShowTimeline] = useState(false)
  const [activeResumeTab, setActiveResumeTab] = useState(0)
  const [hoveredTab, setHoveredTab] = useState<number | null>(null)
  const [hoveredEventIndex, setHoveredEventIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [autoParallax, setAutoParallax] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasPlayedInitialAnimation, setHasPlayedInitialAnimation] = useState(false)
  const animationKey = useRef(0)
  
  // 使用完整的滚动系统
  const { aboutTab, changeAboutTab } = useSectionScrollContext()
  
  // 使用全局的 tabIndex
  const currentActiveTab = propActiveTab !== undefined ? propActiveTab : aboutTab
  const tabDataForActive = tabData.find(t => t.id === currentActiveTab)!
  const timeRef = useRef(0)
  const maxTabIndex = tabData.length - 1
  const prevTabRef = useRef(currentActiveTab)

  // 计算方向：1=向下切换，-1=向上切换
  const direction = useMemo(() => {
    if (currentActiveTab === prevTabRef.current) return 0
    return currentActiveTab > prevTabRef.current ? 1 : -1
  }, [currentActiveTab])

  useEffect(() => {
    prevTabRef.current = currentActiveTab
  }, [currentActiveTab])

  // 处理标签切换
  const handleTabChange = (id: number) => {
    if (propOnTabChange) {
      propOnTabChange(id)
    } else {
      changeAboutTab(id)
    }
  }
 
  // 进入 About 时确保资源已预加载（与全局 Preloader 共享，不重复请求）
  useEffect(() => {
    void preloadAboutAssets()
  }, [])

  // 自动视差动画
  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      timeRef.current += 0.005
      const x = Math.sin(timeRef.current * 1.3) * 0.3
      const y = Math.cos(timeRef.current * 0.9) * 0.25
      setAutoParallax({ x, y })
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // 检测About区域是否进入视窗 - 触发首次入场动画
  useEffect(() => {
    if (!containerRef.current || hasPlayedInitialAnimation) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayedInitialAnimation) {
          setHasPlayedInitialAnimation(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [hasPlayedInitialAnimation])

  // 装饰元素的随机值 - 在组件顶层定义
  const decorationRandomValues = React.useMemo(() => ({
    'dec-0-1': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-0-2': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-0-3': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-0-4': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-1-1': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-1-2': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-1-3': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-1-4': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-1-5': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-2-1': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-2-2': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-2-3': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-2-4': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-2-5': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-3-1': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-3-2': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-3-3': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-3-4': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-4-1': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-4-2': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-4-3': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
    'dec-4-4': { offset: Math.random() * 100, duration: 0.25 + Math.random() * 0.3 },
  }), [])
 
  const careerData = [
    {
      period: '2022/08 - 2026/04',
      company: '网龙网络科技公司',
      tag: '互联网教育',
      roles: 'UI设计师P7 · UED负责人 · 中小学产品核心成员',
      description: '带领7人团队，主导国家级亿级平台UED，推动AI智能化进程与实践'
    },
    {
      period: '2021/07 - 2022/08',
      company: '北京商越网络科技有限公司',
      tag: 'SaaS采购',
      roles: '视觉设计师（组长） · 品牌设计师',
      description: 'SaaS品牌重塑，主导Vi 规范，主导运营及市场活动视觉设计'
    },
    {
      period: '2017/06 - 2021/05',
      company: '网龙网络科技公司 ｜ 华渔教育集团',
      tag: '互联网教育',
      roles: '创意设计师P7 · 北京分处核心成员',
      description: '主导教育核心产品（101教育、人教辞书等）视觉与产品研发，树立品牌识别系统'
    },
    {
      period: '2012/06 - 2017/05',
      company: '天马传媒有限公司 ｜ Xreal行空互动',
      tag: '4A创意广告',
      roles: '视频设计师 ｜ 创意设计师',
      description: '为CCTV、省级卫视提供视频动效及VI形象设计'
    },
    {
      period: '2010/06 - 2011/07',
      company: '烟台嘉和乐天家居商场',
      tag: '商超',
      roles: '平面设计师 · 运营部',
      description: '日常运营活动负责，商户宣传物料负责，品牌维护'
    }
  ]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])
 
  const getParallaxStyle = useCallback((multiplier: number) => {
    return {
      x: (mousePosition.x * 60 + autoParallax.x * 80) * multiplier,
      y: (mousePosition.y * 60 + autoParallax.y * 60) * multiplier
    }
  }, [mousePosition, autoParallax])
 
  const decorationVariants = {
    hidden: (custom: [number, number, number]) => {
      const [dir, randomOffset] = custom;
      return {
        opacity: 0,
        y: dir > 0 ? 180 + randomOffset : -180 - randomOffset,
        scale: 0.9,
      };
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: (custom: [number, number, number]) => {
      const [dir, randomOffset] = custom;
      return {
        opacity: 0,
        y: dir > 0 ? -180 - randomOffset : 180 + randomOffset,
        scale: 0.9,
        transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] }
      };
    }
  }
 
  const getMeImage = () => {
    switch (currentActiveTab) {
      case 0: return '/images/about/img/me_01.png'
      case 1: return '/images/about/img/me_02.png'
      case 2: return '/images/about/img/me_03.png'
      case 3: return '/images/about/img/me_04.png'
      case 4: return '/images/about/img/me_05.png'
      default: return '/images/about/img/me_01.png'
    }
  }

  const getDecorations = (direction: number) => {
    switch (currentActiveTab) {
      case 0:
        return (
          <>
            <motion.div
              key="dec-0-1"
              initial={{ opacity: 0, y: direction > 0 ? 120 + decorationRandomValues['dec-0-1'].offset : -120 - decorationRandomValues['dec-0-1'].offset, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.2, 0.8, 0.3, 1],
                exit: {
                  duration: 0.12,
                  ease: [0.7, 0.2, 1, 0.1]
                }
              }}
              style={{
                position: 'absolute',
                left: '56.4%',
                top: '21.6%',
                width: '8.2%',
                height: '11.8%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.5)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_pop.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 7, -4, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-0-2"
              initial={{ opacity: 0, y: direction > 0 ? 120 + decorationRandomValues['dec-0-2'].offset : -120 - decorationRandomValues['dec-0-2'].offset, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.2, 0.8, 0.3, 1],
                exit: {
                  duration: 0.12,
                  ease: [0.7, 0.2, 1, 0.1]
                }
              }}
              style={{
                position: 'absolute',
                left: '38.2%',
                top: '62.7%',
                width: '6.9%',
                height: '12.3%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.8)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_01.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, -5, 3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-0-3"
              initial={{ opacity: 0, y: direction > 0 ? 120 + decorationRandomValues['dec-0-3'].offset : -120 - decorationRandomValues['dec-0-3'].offset, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.2, 0.8, 0.3, 1],
                exit: {
                  duration: 0.12,
                  ease: [0.7, 0.2, 1, 0.1]
                }
              }}
              style={{
                position: 'absolute',
                left: '61.8%',
                top: '40.8%',
                width: '7.2%',
                height: '13.4%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.2)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_02.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.07, 1],
                  rotate: [0, 6, -3, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-0-4"
              custom={[direction, decorationRandomValues['dec-0-4'].offset, decorationRandomValues['dec-0-4'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: decorationRandomValues['dec-0-4'].duration, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                left: '59.9%',
                top: '61.7%',
                width: '6.8%',
                height: '11.9%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.0)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_sun.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -9, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </>
        )
      case 1:
        return (
          <>
            <motion.div
              key="dec-1-1"
              custom={[direction, decorationRandomValues['dec-1-1'].offset, decorationRandomValues['dec-1-1'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: decorationRandomValues['dec-1-1'].duration, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                left: '56.4%',
                top: '21.6%',
                width: '6.8%',
                height: '12.1%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.5)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_star.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.09, 1],
                  rotate: [0, 10, -6, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-1-2"
              custom={[direction, decorationRandomValues['dec-1-2'].offset, decorationRandomValues['dec-1-2'].duration]}
              transition={{ duration: decorationRandomValues['dec-1-2'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '59.8%',
                top: '26.9%',
                width: '4.1%',
                height: '7.3%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.8)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_star2.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, -8, 5, 0],
                }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-1-3"
              custom={[direction, decorationRandomValues['dec-1-3'].offset, decorationRandomValues['dec-1-3'].duration]}
              transition={{ duration: decorationRandomValues['dec-1-3'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '53.5%',
                top: '62.8%',
                width: '6.5%',
                height: '12.0%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.2)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_flash.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 7, -5, 0],
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-1-4"
              custom={[direction, decorationRandomValues['dec-1-4'].offset, decorationRandomValues['dec-1-4'].duration]}
              transition={{ duration: decorationRandomValues['dec-1-4'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '35.4%',
                top: '69.3%',
                width: '4.9%',
                height: '10.3%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.0)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_time.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, -6, 4, 0],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-1-5"
              custom={[direction, decorationRandomValues['dec-1-5'].offset, decorationRandomValues['dec-1-5'].duration]}
              transition={{ duration: decorationRandomValues['dec-1-5'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '61.3%',
                top: '44.4%',
                width: '8.0%',
                height: '13.5%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.4)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_omg.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.09, 1],
                  rotate: [0, 9, -5, 0],
                }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </>
        )
      case 2:
        return (
          <>
            <motion.div
              key="dec-2-1"
              custom={[direction, decorationRandomValues['dec-2-1'].offset, decorationRandomValues['dec-2-1'].duration]}
              transition={{ duration: decorationRandomValues['dec-2-1'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '37.7%',
                top: '21.3%',
                width: '6%',
                height: '10.7%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.2)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_robot.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, -5, 3, 0],
                }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-2-2"
              custom={[direction, decorationRandomValues['dec-2-2'].offset, decorationRandomValues['dec-2-2'].duration]}
              transition={{ duration: decorationRandomValues['dec-2-2'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '57.3%',
                top: '27.7%',
                width: '9.1%',
                height: '16.2%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.5)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_figma.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 8, -5, 0],
                }}
                transition={{
                  duration: 4.0,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-2-3"
              custom={[direction, decorationRandomValues['dec-2-3'].offset, decorationRandomValues['dec-2-3'].duration]}
              transition={{ duration: decorationRandomValues['dec-2-3'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '61.5%',
                top: '36.2%',
                width: '5.4%',
                height: '9.7%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.7)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_ai.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, 6, -3, 0],
                }}
                transition={{
                  duration: 6.0,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-2-4"
              custom={[direction, decorationRandomValues['dec-2-4'].offset, decorationRandomValues['dec-2-4'].duration]}
              transition={{ duration: decorationRandomValues['dec-2-4'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '37.3%',
                top: '67.4%',
                width: '5.1%',
                height: '9.1%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.9)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_PS.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.07, 1],
                  rotate: [0, -7, 4, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-2-5"
              custom={[direction, decorationRandomValues['dec-2-5'].offset, decorationRandomValues['dec-2-5'].duration]}
              transition={{ duration: decorationRandomValues['dec-2-5'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '60.2%',
                top: '56.5%',
                width: '5.7%',
                height: '10.1%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.0)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_kiss.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.09, 1],
                  rotate: [0, 9, -5, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </>
        )
      case 3:
        return (
          <>
            <motion.div
              key="dec-3-1"
              custom={[direction, decorationRandomValues['dec-3-1'].offset, decorationRandomValues['dec-3-1'].duration]}
              transition={{ duration: decorationRandomValues['dec-3-1'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '58.1%',
                top: '22.6%',
                width: '9.8%',
                height: '17.5%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.3)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_zxx.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 9, -5, 0],
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-3-2"
              custom={[direction, decorationRandomValues['dec-3-2'].offset, decorationRandomValues['dec-3-2'].duration]}
              transition={{ duration: decorationRandomValues['dec-3-2'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '62.9%',
                top: '48.5%',
                width: '5.3%',
                height: '9.8%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.5)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_xunzhang.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 7, -4, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-3-3"
              custom={[direction, decorationRandomValues['dec-3-3'].offset, decorationRandomValues['dec-3-3'].duration]}
              transition={{ duration: decorationRandomValues['dec-3-3'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '57.3%',
                top: '64.1%',
                width: '5%',
                height: '9%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.8)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_good.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, -6, 3, 0],
                }}
                transition={{
                  duration: 6.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-3-4"
              custom={[direction, decorationRandomValues['dec-3-4'].offset, decorationRandomValues['dec-3-4'].duration]}
              transition={{ duration: decorationRandomValues['dec-3-4'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '34.7%',
                top: '66.4%',
                width: '9.1%',
                height: '16.2%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.0)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_group.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.09, 1],
                  rotate: [0, -8, 5, 0],
                }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </>
        )
      case 4:
        return (
          <>
            <motion.div
              key="dec-4-1"
              custom={[direction, decorationRandomValues['dec-4-1'].offset, decorationRandomValues['dec-4-1'].duration]}
              transition={{ duration: decorationRandomValues['dec-4-1'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '56.1%',
                top: '22.7%',
                width: '8.9%',
                height: '15.8%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.5)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_heart.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.09, 1],
                  rotate: [0, 9, -5, 0],
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-4-2"
              custom={[direction, decorationRandomValues['dec-4-2'].offset, decorationRandomValues['dec-4-2'].duration]}
              transition={{ duration: decorationRandomValues['dec-4-2'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '63.3%',
                top: '47.7%',
                width: '4.6%',
                height: '9.5%',
                pointerEvents: 'none',
                ...getParallaxStyle(1.8)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_star3.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, -7, 4, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-4-3"
              custom={[direction, decorationRandomValues['dec-4-3'].offset, decorationRandomValues['dec-4-3'].duration]}
              transition={{ duration: decorationRandomValues['dec-4-3'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '55.8%',
                top: '59.2%',
                width: '9.0%',
                height: '15.4%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.2)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_flag.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 8, -4, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div
              key="dec-4-4"
              custom={[direction, decorationRandomValues['dec-4-4'].offset, decorationRandomValues['dec-4-4'].duration]}
              transition={{ duration: decorationRandomValues['dec-4-4'].duration, ease: [0.4, 0, 0.2, 1] }}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                left: '35.9%',
                top: '67.0%',
                width: '6.1%',
                height: '10.9%',
                pointerEvents: 'none',
                ...getParallaxStyle(2.0)
              }}
            >
              <motion.img
                src="/images/about/img/decorate_bravo.png"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, -6, 4, 0],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </>
        )
      default:
        return null
    }
  }
 
  return (
    <div
      id="about"
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '600px',
        background: 'radial-gradient(ellipse at center, #03332A 0%, #011410 100%)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: '5.5%',
          width: '50%',
          height: '88.8%',
          pointerEvents: 'none',
          ...getParallaxStyle(0.8)
        }}
      >
        <motion.img
          src="/images/about/img/BGdot.png"
          alt=""
          decoding="async"
          fetchPriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{
            opacity: [0.6, 0.85, 0.6],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {hasPlayedInitialAnimation && (
        <>
      <AnimatePresence mode="sync">
          <motion.div
            key={currentActiveTab}
            initial={{ opacity: 0, y: direction > 0 ? 260 : -260, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.45,
              delay: 0,
              ease: [0.25, 0.46, 0.45, 0.94],
              exit: {
                duration: 0,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            style={{
              position: 'absolute',
              left: '33.4%',
              top: '14.4%',
              width: '33.1%',
              height: '71.1%',
              ...getParallaxStyle(0.6)
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={getMeImage()}
                alt=""
                decoding="async"
                fetchPriority="high"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </motion.div>
          {getDecorations(direction)}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        <motion.div
          key={`text-content-${currentActiveTab}`}
          style={{
            position: 'absolute',
            left: '20.8%',
            top: '32.2%',
            width: '30%',
            height: '35.5%'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
            {tabDataForActive.title1 && (
              <div
                style={{
                  marginBottom: '8px',
                  fontSize: 'clamp(24px, 2.5vw, 48px)',
                  fontWeight: 100,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.2,
                  fontFamily: 'PingFang SC, system-ui'
                }}
              >
                <AnimatedText text={tabDataForActive.title1} delay={0} />
              </div>
            )}

            <div
              style={{
                fontSize: 'clamp(32px, 3.33vw, 64px)',
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.125,
                marginBottom: '8px',
                fontFamily: 'PingFang SC, system-ui'
              }}
            >
              <AnimatedText text={tabDataForActive.title2} delay={0} />
            </div>

            {tabDataForActive.description && (
              <div
                style={{
                  fontSize: 'clamp(14px, 0.83vw, 16px)',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.5,
                  marginTop: '8px',
                  fontFamily: 'PingFang SC, system-ui'
                }}
              >
                <AnimatedText text={tabDataForActive.description} delay={0} />
              </div>
            )}

            {tabDataForActive.hasButton && (
              <div
                style={{ marginTop: '40px' }}
              >
              <motion.button
                suppressHydrationWarning
                onClick={() => setShowTimeline(true)}
                className="inline-flex items-center justify-center rounded-full border border-[1px] transition-colors relative overflow-hidden cursor-pointer"
                style={{
                  background: '#00ECB2',
                  borderColor: '#00ECB2',
                  color: '#000e0c',
                  fontSize: 'clamp(16px, 1.04vw, 20px)',
                  fontWeight: 400,
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  height: '38px',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(0, 236, 178, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="scan-light" />
                <span className="relative z-10 flex items-center">
                  查看履历
                  <img src="/images/about/icon/arrow-right-long-line.svg" alt="" style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                </span>
              </motion.button>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        </>
      )}

      {hasPlayedInitialAnimation && (
        <motion.div
          style={{
            position: 'absolute',
            right: '16%',
            width: 'auto',
            alignSelf: 'center'
          }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
        >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          alignItems: 'flex-start'
        }}>
          {tabData.map((tab) => {
            const isActive = currentActiveTab === tab.id
            const isHighlighted = isActive || hoveredTab === tab.id
            const circleSize = isHighlighted ? '40px' : '32px'
            const iconSize = isHighlighted ? '24px' : '16px'
            const iconColor = isHighlighted ? '#000e0c' : 'rgba(255,255,255,0.75)'

            const icons = [
              <svg key="icon_me" width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: iconSize, height: iconSize }}>
                <path d="M7.38938 16.5386C5.33894 15.0901 4 12.7014 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 12.7014 18.6611 15.0901 16.6106 16.5386L18.6936 21.2996C18.8043 21.5526 18.6889 21.8474 18.4359 21.9581C18.3727 21.9857 18.3045 22 18.2355 22H5.76451C5.48837 22 5.26451 21.7761 5.26451 21.5C5.26451 21.431 5.27878 21.3628 5.30643 21.2996L7.38938 16.5386ZM14.1246 15.846L15.4567 14.905C17.041 13.7858 18 11.9752 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.9752 6.95901 13.7858 8.54335 14.905L9.87539 15.846L8.05803 20H15.942L14.1246 15.846ZM8.11851 10.9704L10.0593 10.4852C10.2761 11.3553 11.0628 12 12 12C12.9372 12 13.7239 11.3553 13.9407 10.4852L15.8815 10.9704C15.4478 12.7106 13.8745 14 12 14C10.1255 14 8.55217 12.7106 8.11851 10.9704Z" fill={iconColor} />
              </svg>,
              <svg key="icon_time" width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: iconSize, height: iconSize }}>
                <path d="M8.00016 14.6668C4.31826 14.6668 1.3335 11.682 1.3335 8.00016C1.3335 4.31826 4.31826 1.3335 8.00016 1.3335C11.682 1.3335 14.6668 4.31826 14.6668 8.00016C14.6668 11.682 11.682 14.6668 8.00016 14.6668ZM8.00016 13.3335C10.9457 13.3335 13.3335 10.9457 13.3335 8.00016C13.3335 5.05464 10.9457 2.66683 8.00016 2.66683C5.05464 2.66683 2.66683 5.05464 2.66683 8.00016C2.66683 10.9457 5.05464 13.3335 8.00016 13.3335ZM8.66683 8.00016H11.3335V9.3335H7.3335V4.66683H8.66683V8.00016Z" fill={iconColor} />
              </svg>,
              <svg key="icon_design" width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: iconSize, height: iconSize }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M8.00024 0.666634C8.89986 0.666705 9.73208 0.9643 10.4006 1.46644L9.59985 2.53284C9.15433 2.19818 8.60119 1.99971 8.00024 1.99964C7.81618 1.99964 7.63576 2.01782 7.46216 2.05335C6.24714 2.30209 5.33325 3.37805 5.33325 4.66663C5.33343 6.02183 6.34458 7.14037 7.65356 7.31019C8.33584 6.37162 9.37019 5.80529 10.4641 5.68812C10.9197 5.63933 11.386 5.66852 11.842 5.78089C12.2001 5.86911 12.5524 6.00855 12.887 6.20179C14.8001 7.30642 15.4553 9.75354 14.3508 11.6666C13.2462 13.5795 10.8 14.2348 8.88696 13.1305C8.55229 12.9373 8.25571 12.7021 8.00024 12.4362C7.74491 12.702 7.44816 12.9372 7.11353 13.1305C5.20039 14.235 2.75325 13.5798 1.64868 11.6666C0.544113 9.75347 1.20036 7.30635 3.11353 6.20179C3.44806 6.00872 3.79959 5.86907 4.15747 5.78089C4.07527 5.49702 4.02329 5.20022 4.0061 4.89417L4.00513 4.86488C4.00193 4.79933 4.00025 4.73295 4.00024 4.66663C4.00024 2.45749 5.79109 0.666634 8.00024 0.666634ZM4.76685 7.02113C4.42938 7.0652 4.09383 7.17559 3.77954 7.35706C2.50433 8.09355 2.06764 9.72435 2.80396 10.9996C3.54031 12.275 5.17113 12.7124 6.44653 11.9762C6.86781 11.733 7.19626 11.3932 7.42212 11.0016C7.82825 10.2972 7.90196 9.42563 7.57642 8.64417C7.32039 8.61718 7.07159 8.56576 6.83228 8.49281C6.80208 8.48361 6.77139 8.47435 6.74146 8.46449C5.94129 8.19946 5.25358 7.68819 4.76685 7.02113ZM10.8879 6.99866C10.075 6.99923 9.28383 7.37111 8.76978 8.04359C8.84396 8.21015 8.90546 8.38009 8.95532 8.5514C8.98449 8.65181 9.01044 8.75272 9.03149 8.85413C9.04047 8.89755 9.04838 8.94143 9.05591 8.98499C9.19134 9.77021 9.08653 10.5733 8.76978 11.2887C8.9767 11.5589 9.23872 11.7947 9.55298 11.9762C10.8284 12.7125 12.4591 12.275 13.1956 10.9996C13.5286 10.423 13.622 9.77316 13.5061 9.16663C13.3656 8.43196 12.9185 7.76047 12.22 7.35706C11.7985 7.11379 11.34 6.99839 10.8879 6.99866Z" fill={iconColor} />
                <path d="M13.0198 0.879524C13.1375 0.595497 13.5291 0.595497 13.6467 0.879524L13.8157 1.28675C14.1037 1.98201 14.6412 2.53711 15.3167 2.83753L15.7795 3.05042C16.0533 3.17222 16.0533 3.57023 15.7795 3.69202L15.2883 3.91761C14.6297 4.2105 14.1018 4.74616 13.8088 5.41859L13.6448 5.79554C13.5245 6.07162 13.1421 6.07162 13.0217 5.79554L12.8577 5.41859C12.7373 5.14243 12.5773 4.88925 12.385 4.66663C12.1091 4.3473 11.7662 4.09016 11.3782 3.91761L10.8723 3.69202C10.5985 3.57023 10.5985 3.17222 10.8723 3.05042L11.3499 2.83753C11.9006 2.59258 12.3596 2.17839 12.6663 1.65687C12.7357 1.53888 12.7977 1.41499 12.8508 1.28675L13.0198 0.879524Z" fill={iconColor} />
              </svg>,
              <svg key="icon_so" width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: iconSize, height: iconSize }}>
                <path d="M12.6667 5.3335H14C14.3682 5.3335 14.6667 5.63198 14.6667 6.00016V14.0002C14.6667 14.3684 14.3682 14.6668 14 14.6668H8.66667C8.29847 14.6668 8 14.3684 8 14.0002V13.3335H2.66667C2.29848 13.3335 2 13.035 2 12.6668V2.00016C2 1.63198 2.29848 1.3335 2.66667 1.3335H12C12.3682 1.3335 12.6667 1.63198 12.6667 2.00016V5.3335ZM11.3333 5.3335V2.66683H3.33333V12.0002H8V6.00016C8 5.63198 8.29847 5.3335 8.66667 5.3335H11.3333ZM9.33333 6.66683V13.3335H13.3333V6.66683H9.33333Z" fill={iconColor} />
              </svg>,
              <svg key="icon_good" width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: iconSize, height: iconSize }}>
                <path d="M9.73304 5.33339H13.9998C14.7362 5.33339 15.3332 5.93034 15.3332 6.6667V8.06964C15.3332 8.24377 15.299 8.41624 15.2328 8.5773L13.1698 13.5872C13.067 13.837 12.8235 14 12.5534 14H1.33317C0.964984 14 0.666504 13.7016 0.666504 13.3334V6.6667C0.666504 6.29853 0.964984 6.00006 1.33317 6.00006H3.6544C3.87102 6.00006 4.07412 5.89481 4.19904 5.71784L7.83464 0.567407C7.92964 0.432828 8.1087 0.387823 8.25604 0.461493L9.46544 1.06618C10.1665 1.41673 10.5286 2.20845 10.3352 2.96807L9.73304 5.33339ZM4.6665 7.05837V12.6667H12.1069L13.9998 8.06964V6.6667H9.73304C8.86324 6.6667 8.22637 5.84736 8.4409 5.00444L9.0431 2.63913C9.08177 2.4872 9.00937 2.32886 8.8691 2.25875L8.42837 2.03837L5.28834 6.48676C5.12174 6.72277 4.90878 6.91624 4.6665 7.05837ZM3.33317 7.33337H1.99984V12.6667H3.33317V7.33337Z" fill={iconColor} />
              </svg>
            ]

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  padding: '0',
                  margin: '0',
                  transition: 'all 0.3s ease',
                  width: '150px',
                  justifyContent: 'flex-start'
                }}
              >
                <div
                  style={{
                    width: circleSize,
                    height: circleSize,
                    backgroundColor: isHighlighted ? '#00ecb2' : 'rgba(55,255,206,0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                    {icons[tab.id]}
                  </span>
                </div>
                <span style={{
                  marginLeft: '12px',
                  opacity: isHighlighted ? 0.85 : 0.4,
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 400,
                  transition: 'opacity 0.3s ease',
                  whiteSpace: 'nowrap'
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
      )}

      {showTimeline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)'
          }}
          onClick={() => setShowTimeline(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100 }}
            data-lenis-prevent
            style={{
              borderRadius: '24px',
              width: '100%',
              maxWidth: '1200px',
              height: '720px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              backgroundColor: '#000E0C',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Section - Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>

              {/* Tabs */}
              <div style={{
                padding: '24px 40px',
                display: 'flex',
                gap: '24px',
                alignItems: 'center'
              }}>
                {tabNames.map((tab, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setActiveResumeTab(index)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '999px',
                      border: activeResumeTab === index ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                      background: activeResumeTab === index ? '#00ECB2' : 'rgba(255, 255, 255, 0.1)',
                      color: activeResumeTab === index ? '#000E0C' : 'rgba(255, 255, 255, 0.85)',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: activeResumeTab === index ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: 'PingFang SC',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: activeResumeTab === index
                        ? '0 0 30px rgba(0, 236, 178, 0.5)'
                        : '0 0 20px rgba(255, 255, 255, 0.1)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{
                flex: 1,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <AnimatePresence mode="wait">
                  {/* 能力分析 */}
                  {activeResumeTab === 0 && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px 48px'
                      }}
                    >
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <motion.img 
                          src="/images/about/radar-placeholder.png" 
                          alt="能力分析"
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: {
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1]
                            }
                          }}
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }} 
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* 大事记 */}
                  {activeResumeTab === 1 && (
                    <motion.div
                      key="events"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        maxHeight: '580px',
                        padding: '0 40px 24px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                      onWheel={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onScroll={(e) => e.stopPropagation()}
                    >
                      <div style={{ 
                        position: 'relative', 
                        width: '100%',
                        maxWidth: '840px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {eventsData.map((event, index) => {
                          const isHovered = hoveredEventIndex === index
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '16px',
                                borderRadius: '8px',
                                background: isHovered ? 'rgba(0, 236, 178, 0.06)' : 'transparent',
                                cursor: 'default',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={() => setHoveredEventIndex(index)}
                              onMouseLeave={() => setHoveredEventIndex(null)}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '4px'
                              }}>
                                <span style={{
                                  fontFamily: 'Campton',
                                  fontWeight: 700,
                                  fontSize: '56px',
                                  lineHeight: '46px',
                                  color: 'rgba(255, 255, 255, 0.1)',
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                  height: '46px',
                                  display: 'inline-block',
                                  verticalAlign: 'baseline'
                                }}>{event.year}</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginBottom: '4px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  color: '#00C897',
                                  background: 'rgba(3, 255, 194, 0.1)',
                                  fontFamily: 'PingFang SC',
                                  flexShrink: 0
                                }}>{event.tag}</span>
                                <span style={{
                                  fontSize: '24px',
                                  fontWeight: 600,
                                  color: isHovered ? 'rgba(0, 236, 178, 1)' : 'rgba(255, 255, 255, 0.85)',
                                  fontFamily: 'PingFang SC',
                                  transition: 'color 0.2s ease'
                                }}>{event.title}</span>
                              </div>
                              <div style={{
                                fontSize: '16px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                lineHeight: '1.6',
                                fontFamily: 'PingFang SC',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto'
                              }}>{event.description}</div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* 工作经历 */}
                  {activeResumeTab === 2 && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '840px',
                        padding: '0 40px 4px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        maxHeight: '580px'
                      }}
                      onWheel={(e) => { e.stopPropagation(); }}
                      onTouchStart={(e) => { e.stopPropagation(); }}
                      onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchEnd={(e) => { e.stopPropagation(); }}
                      onScroll={(e) => { e.stopPropagation(); }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '0px'
                      }}>
                        {careerData.map((item, index) => {
                          const isHovered = hoveredEventIndex === index
                          const isLast = index === careerData.length - 1
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.08, duration: 0.5 }}
                              style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '8px',
                                background: isHovered ? 'rgba(3, 255, 194, 0.06)' : 'transparent',
                                cursor: 'default',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={() => setHoveredEventIndex(index)}
                              onMouseLeave={() => setHoveredEventIndex(null)}
                            >
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                paddingTop: '0px'
                              }}>
                                <img 
                                  src="/images/about/icon/time_dot.svg" 
                                  alt=""
                                  style={{ width: '16px', height: '16px', flexShrink: 0 }}
                                />
                                {!isLast && (
                                  <img 
                                    src="/images/about/icon/time_line.svg" 
                                    alt=""
                                    style={{ 
                                      width: '2px', 
                                      marginTop: '0px', 
                                      flexShrink: 0,
                                      height: '110px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                )}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  flexWrap: 'wrap'
                                }}>
                                  <span style={{
                                    fontFamily: 'Campton',
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    lineHeight: '20px',
                                    color: 'rgba(255, 255, 255, 0.3)'
                                  }}>{item.period}</span>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  flexWrap: 'wrap'
                                }}>
                                  <span style={{
                                    fontFamily: 'PingFang SC',
                                    fontWeight: 600,
                                    fontSize: '24px',
                                    lineHeight: '40px',
                                    color: isHovered ? '#00ECB2' : 'rgba(255, 255, 255, 0.85)',
                                    transition: 'color 0.2s ease'
                                  }}>{item.company}</span>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#00C897',
                                    background: 'rgba(3, 255, 194, 0.1)',
                                    fontFamily: 'PingFang SC'
                                  }}>{item.tag}</span>
                                </div>
                                <span style={{
                                  fontFamily: 'PingFang SC',
                                  fontWeight: 400,
                                  fontSize: '16px',
                                  lineHeight: '24px',
                                  color: 'rgba(255, 255, 255, 0.75)'
                                }}>{item.roles}</span>
                                <span style={{
                                  fontFamily: 'PingFang SC',
                                  fontWeight: 400,
                                  fontSize: '12px',
                                  lineHeight: '20px',
                                  color: 'rgba(255, 255, 255, 0.3)'
                                }}>{item.description}</span>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section - Portrait */}
            <div style={{
              position: 'relative',
              width: '360px',
              flexShrink: 0,
              background: 'linear-gradient(180deg, rgba(3, 40, 46, 1) 0%, rgba(0, 236, 178, 1) 100%)',
              overflow: 'hidden'
            }}>
              {/* Close button */}
              <button
                onClick={() => setShowTimeline(false)}
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '24px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  zIndex: 100
                }}
              >
                <img src="/images/about/icon/close-line.svg" alt="" style={{ width: '32px', height: '32px' }} />
              </button>
              
              {/* 我的履历文字 - 在头像区域的上方 */}
              <div style={{
                position: 'absolute',
                left: '116px',
                top: '64px',
                fontSize: '64px',
                fontWeight: 600,
                lineHeight: '72px',
                color: '#FFFFFF',
                fontFamily: 'PingFang SC',
                zIndex: 10
              }}>
                我的<br/>履历
              </div>

              {/* Decorative elements */}
              <motion.img
                src="/images/about/img/Resume_2.png"
                alt=""
                style={{
                  position: 'absolute',
                  right: '25px',
                  top: '210px',
                  width: '79px',
                  height: '81px',
                  zIndex: 5
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.img
                src="/images/about/img/Resume_1.png"
                alt=""
                style={{
                  position: 'absolute',
                  left: '91px',
                  top: '273px',
                  width: '40px',
                  height: '38px',
                  zIndex: 5
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.img
                src="/images/about/img/Resume_3.png"
                alt=""
                style={{
                  position: 'absolute',
                  left: '-7px',
                  top: '387px',
                  width: '81px',
                  height: '81px',
                  zIndex: 5
                }}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Avatar */}
              <div style={{
                position: 'absolute',
                left: '-100px',
                top: '270px',
                width: '560px',
                height: '450px',
                pointerEvents: 'none',
                zIndex: 3
              }}>
                <img
                  src="/images/about/img/me_ Resume.png"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}