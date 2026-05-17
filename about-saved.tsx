'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
 
interface AboutProps {
  activeTab: number
  onTabChange: (tab: number) => void
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
  const segments = text.split('\n')
  
  return (
    <span style={{ display: 'block' }} suppressHydrationWarning>
      {segments.map((segment, segIndex) => (
        <React.Fragment key={segIndex}>
          {[...segment].map((char, index) => (
            <motion.span
              key={`${segIndex}-${index}`}
              initial={{ 
                opacity: 0, 
                y: 20, 
                filter: 'blur(4px)' 
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                filter: 'blur(0px)' 
              }}
              transition={{
                duration: 0.15,
                delay: delay + (segIndex * 0.02) + (index * 0.015),
                ease: [0.4, 0, 0.2, 1]
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
 
export default function About({ activeTab, onTabChange, onNavigate }: AboutProps) {
  const [showTimeline, setShowTimeline] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [autoParallax, setAutoParallax] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })
  const prevTabRef = useRef(0)
  const tabDataForActive = tabData.find(t => t.id === activeTab)!
  const timeRef = useRef(0)
 
  useEffect(() => {
    prevTabRef.current = activeTab
  }, [activeTab])
 
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
 
  const careerData = [
    {
      period: '2022.08-2026.04',
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
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
 
  const getParallaxStyle = useCallback((multiplier: number) => {
    return {
      x: (mousePosition.x * 60 + autoParallax.x * 80) * multiplier,
      y: (mousePosition.y * 60 + autoParallax.y * 60) * multiplier
    }
  }, [mousePosition, autoParallax])
 
  const imageVariants = {
    hidden: (direction: number) => ({
      opacity: 0,
      y: direction > 0 ? -200 : 200,
      scale: 0.9,
    }),
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
    },
    exit: (direction: number) => ({
      opacity: 0,
      y: direction > 0 ? 200 : -200,
      scale: 0.9,
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
    })
  }
 
  const decorationVariants = {
    hidden: (custom: [number, number, number]) => {
      const [direction, randomOffset, randomDuration] = custom;
      return {
        opacity: 0,
        y: direction > 0 ? -150 - randomOffset : 150 + randomOffset,
        scale: 0.8,
      };
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (custom: [number, number, number]) => {
      const [direction, randomOffset, randomDuration] = custom;
      return {
        opacity: 0,
        y: direction > 0 ? 150 + randomOffset : -150 - randomOffset,
        scale: 0.8,
      };
    }
  }
 
  const getMeImage = () => {
    switch (activeTab) {
      case 0: return '/images/about/img/me_01.png'
      case 1: return '/images/about/img/me_02.png'
      case 2: return '/images/about/img/me_03.png'
      case 3: return '/images/about/img/me_04.png'
      case 4: return '/images/about/img/me_05.png'
      default: return '/images/about/img/me_01.png'
    }
  }
 
  const getDecorations = (direction: number) => {
    // 为每个装饰元素生成随机偏移量和持续时间
    const randomValues = React.useMemo(() => {
      return {
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
      };
    }, []);
 
    switch (activeTab) {
      case 0:
        return (
          <>
            <motion.div
              key="dec-0-1"
              custom={[direction, randomValues['dec-0-1'].offset, randomValues['dec-0-1'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: randomValues['dec-0-1'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-0-2'].offset, randomValues['dec-0-2'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: randomValues['dec-0-2'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-0-3'].offset, randomValues['dec-0-3'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: randomValues['dec-0-3'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-0-4'].offset, randomValues['dec-0-4'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: randomValues['dec-0-4'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-1-1'].offset, randomValues['dec-1-1'].duration]}
              variants={decorationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: randomValues['dec-1-1'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-1-2'].offset, randomValues['dec-1-2'].duration]}
              transition={{ duration: randomValues['dec-1-2'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-1-3'].offset, randomValues['dec-1-3'].duration]}
              transition={{ duration: randomValues['dec-1-3'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-1-4'].offset, randomValues['dec-1-4'].duration]}
              transition={{ duration: randomValues['dec-1-4'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-1-5'].offset, randomValues['dec-1-5'].duration]}
              transition={{ duration: randomValues['dec-1-5'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-2-1'].offset, randomValues['dec-2-1'].duration]}
              transition={{ duration: randomValues['dec-2-1'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-2-2'].offset, randomValues['dec-2-2'].duration]}
              transition={{ duration: randomValues['dec-2-2'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-2-3'].offset, randomValues['dec-2-3'].duration]}
              transition={{ duration: randomValues['dec-2-3'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-2-4'].offset, randomValues['dec-2-4'].duration]}
              transition={{ duration: randomValues['dec-2-4'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-2-5'].offset, randomValues['dec-2-5'].duration]}
              transition={{ duration: randomValues['dec-2-5'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-3-1'].offset, randomValues['dec-3-1'].duration]}
              transition={{ duration: randomValues['dec-3-1'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-3-2'].offset, randomValues['dec-3-2'].duration]}
              transition={{ duration: randomValues['dec-3-2'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-3-3'].offset, randomValues['dec-3-3'].duration]}
              transition={{ duration: randomValues['dec-3-3'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-3-4'].offset, randomValues['dec-3-4'].duration]}
              transition={{ duration: randomValues['dec-3-4'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-4-1'].offset, randomValues['dec-4-1'].duration]}
              transition={{ duration: randomValues['dec-4-1'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-4-2'].offset, randomValues['dec-4-2'].duration]}
              transition={{ duration: randomValues['dec-4-2'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-4-3'].offset, randomValues['dec-4-3'].duration]}
              transition={{ duration: randomValues['dec-4-3'].duration, ease: [0.4, 0, 0.2, 1] }}
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
              custom={[direction, randomValues['dec-4-4'].offset, randomValues['dec-4-4'].duration]}
              transition={{ duration: randomValues['dec-4-4'].duration, ease: [0.4, 0, 0.2, 1] }}
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
 
      <AnimatePresence mode="wait">
        <React.Fragment key={activeTab}>
          <motion.div
            custom={activeTab > prevTabRef.current ? 1 : -1}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
              <img src={getMeImage()} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </motion.div>
          {getDecorations(activeTab > prevTabRef.current ? 1 : -1)}
        </React.Fragment>
      </AnimatePresence>
 
      <motion.div
        style={{
          position: 'absolute',
          left: '20.8%',
          top: '32.2%',
          width: '30%',
          height: '35.5%'
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        {tabDataForActive.title1 && (
          <motion.div
            key={`title1-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginBottom: '8px',
              fontSize: 'clamp(24px, 2.5vw, 48px)',
              fontWeight: 100,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.2,
              fontFamily: 'PingFang SC, system-ui'
            }}
          >
            <AnimatedText text={tabDataForActive.title1} />
          </motion.div>
        )}
 
        <motion.div
          key={`title2-${activeTab}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: 'clamp(32px, 3.33vw, 64px)',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.125,
            marginBottom: '8px',
            fontFamily: 'PingFang SC, system-ui'
          }}
        >
          <AnimatedText text={tabDataForActive.title2} delay={0.1} />
        </motion.div>
 
        {tabDataForActive.description && (
          <motion.div
            key={`desc-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 'clamp(14px, 0.83vw, 16px)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.5,
              marginTop: '8px',
              fontFamily: 'PingFang SC, system-ui'
            }}
          >
            <AnimatedText text={tabDataForActive.description} delay={0.25} />
          </motion.div>
        )}
 
        {tabDataForActive.hasButton && (
          <motion.div
            key={`btn-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={{ marginTop: '40px' }}
          >
            <button
              suppressHydrationWarning
              onClick={() => setShowTimeline(true)}
              style={{
                backgroundColor: '#00ecb2',
                color: '#000e0c',
                fontSize: 'clamp(16px, 1.04vw, 20px)',
                fontWeight: 400,
                paddingLeft: '20px',
                paddingRight: '20px',
                height: '38px',
                borderRadius: '9999px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              查看履历
              <img src="/images/about/icon/arrow-right-long-line.svg" alt="" style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
            </button>
          </motion.div>
        )}
      </motion.div>
 
      <motion.div
        style={{
          position: 'absolute',
          right: '16%',
          width: 'auto',
          alignSelf: 'center'
        }}
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 50, y: 50 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          alignItems: 'flex-start'
        }}>
          {tabData.map((tab) => {
            const isActive = activeTab === tab.id
            const circleSize = isActive ? '40px' : '32px'
            const iconSize = isActive ? '24px' : '16px'
            const iconColor = isActive ? '#000e0c' : 'rgba(255,255,255,0.75)'
 
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
                onClick={() => onTabChange(tab.id)}
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
                    backgroundColor: isActive ? '#00ecb2' : 'rgba(55,255,206,0.1)',
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
                  opacity: isActive ? 0.85 : 0.4,
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
 
      {showTimeline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
              borderRadius: '12px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: '#031210',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              padding: '20px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(3,18,16,0.95)',
              backdropFilter: 'blur(12px)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                个人履历
              </h3>
              <button
                onClick={() => setShowTimeline(false)}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px'
            }}>
              <div style={{ position: 'relative' }}>
                {careerData.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    bottom: 0,
                    width: '2px',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05), transparent)'
                  }} />
                )}
 
                {careerData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    style={{
                      position: 'relative',
                      paddingLeft: '40px',
                      paddingBottom: '30px'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.5)'
                      }} />
                    </div>
 
                    <div style={{
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 100, color: 'rgba(255,255,255,0.5)' }}>
                        {item.period}
                      </span>
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.5)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}>
                        {item.industry}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: '12px',
                      marginTop: 0
                    }}>
                      {item.company}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.roles.map((role, roleIndex) => (
                        <span
                          key={roleIndex}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.5)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '15px'
                          }}
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
    </div>
  )
}