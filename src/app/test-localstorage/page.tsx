'use client';
import React, { useEffect, useState } from 'react';

export default function TestLocalStorage() {
  const [localStorageData, setLocalStorageData] = useState<{ [key: string]: string }>({});
  const [publishedWorks, setPublishedWorks] = useState<any>(null);
  const [works, setWorks] = useState<any>(null);

  useEffect(() => {
    // 读取所有localStorage数据
    const data: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    setLocalStorageData(data);

    // 读取发布的作品
    const published = localStorage.getItem('published_works');
    if (published) {
      try {
        setPublishedWorks(JSON.parse(published));
      } catch (e) {
        console.error('解析published_works失败:', e);
      }
    }

    // 读取编辑中的作品
    const worksData = localStorage.getItem('works');
    if (worksData) {
      try {
        setWorks(JSON.parse(worksData));
      } catch (e) {
        console.error('解析works失败:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <h1 className="text-2xl font-bold mb-8">LocalStorage 测试</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">LocalStorage 所有键值</h2>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">已发布的作品 (published_works)</h2>
        {publishedWorks ? (
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
            {JSON.stringify(publishedWorks, null, 2)}
          </pre>
        ) : (
          <p className="text-red-400">published_works 不存在或为空</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">编辑中的作品 (works)</h2>
        {works ? (
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
            {JSON.stringify(works, null, 2)}
          </pre>
        ) : (
          <p className="text-red-400">works 不存在或为空</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">测试发布功能</h2>
        <button
          onClick={() => {
            // 模拟发布操作
            const testWorks = [
              {
                id: 1,
                title: '测试作品 1',
                category: ['UX设计'],
                cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20work%201&image_size=landscape_16_9',
                ratio: '4:3',
                order: 1,
                images: [],
                videos: []
              },
              {
                id: 2,
                title: '测试作品 2',
                category: ['视觉设计'],
                cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20work%202&image_size=landscape_16_9',
                ratio: '4:3',
                order: 2,
                images: [],
                videos: []
              }
            ];
            
            localStorage.setItem('works', JSON.stringify(testWorks));
            localStorage.setItem('published_works', JSON.stringify(testWorks));
            localStorage.setItem('publish_timestamp', String(Date.now()));
            
            // 刷新页面
            window.location.reload();
          }}
          className="px-6 py-3 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
        >
          发布测试作品
        </button>
      </div>
    </div>
  );
}