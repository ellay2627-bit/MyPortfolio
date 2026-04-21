'use client';
import React, { useEffect } from 'react';

interface RealTimeSyncProps {
  onDataUpdate: () => void;
}

export default function RealTimeSync({ onDataUpdate }: RealTimeSyncProps) {
  useEffect(() => {
    // 监听localStorage变化（跨标签页）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'published_works' || e.key === 'publish_timestamp') {
        console.log('收到Storage事件，更新数据:', e.key);
        onDataUpdate();
      }
    };
    
    // 监听自定义发布事件（同一标签页内）
    const handlePortfolioPublish = (event: CustomEvent) => {
      console.log('收到发布事件，更新数据:', event.detail);
      onDataUpdate();
    };
    
    // 监听事件
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio_publish', handlePortfolioPublish as EventListener);
    };
  }, [onDataUpdate]);

  return null;
}