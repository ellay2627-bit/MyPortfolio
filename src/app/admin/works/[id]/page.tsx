'use client';
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminCursorFix from '@/components/AdminCursorFix';
import Notification from '@/components/Notification';

// 动态导入ReactQuill，只在客户端加载
const ReactQuill = lazy(() => import('react-quill'));

// ReactQuill包装组件
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // 动态加载CSS
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
      document.head.appendChild(link);
    }
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
        加载编辑器中...
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
        加载编辑器中...
      </div>
    }>
      <ReactQuill
        value={value}
        onChange={onChange}
        className="bg-white rounded-lg"
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ]
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet',
          'link'
        ]}
      />
    </Suspense>
  );
};

const CATEGORIES = ['UX设计', '视觉设计', '品牌设计', '动态设计', '其他'];

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'video-link';
  url: string;
  name?: string;
  order: number;
}

interface Work {
  id?: number;
  title: string;
  brief: string;
  description: string;
  category: string[];
  cover: string;
  ratio: '16:9' | '4:3';
  order: number;
  media: MediaItem[];
  links?: {
    text: string;
    url: string;
    order: number;
  }[];
}

export default function WorkEditPage() {
  const params = useParams();
  const router = useRouter();
  const isEdit = !!params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Work>({
    title: '',
    brief: '',
    description: '',
    category: [],
    cover: '',
    ratio: '4:3',
    order: 0,
    media: [],
    links: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // 自定义对话框状态
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'link' | 'video'>('link');
  const [dialogInput1, setDialogInput1] = useState('');
  const [dialogInput2, setDialogInput2] = useState('');
  
  // 链接管理状态
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [draggedLink, setDraggedLink] = useState<{ text: string; url: string; order: number } | null>(null);
  const [dragOverLinkIndex, setDragOverLinkIndex] = useState<number | null>(null);
  
  // 通知状态
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>>([]);
  
  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => {});
  
  // 表单状态，用于检测是否有更改
  const [initialFormData, setInitialFormData] = useState<Work>({
    title: '',
    brief: '',
    description: '',
    category: [],
    cover: '',
    ratio: '4:3',
    order: 0,
    media: [],
    links: []
  });

  useEffect(() => {
    if (isEdit) {
      fetchWork();
    } else {
      // 新增作品时生成默认ID和顺序
      setFormData(prev => ({
        ...prev,
        id: Date.now(),
        order: 0
      }));
    }
  }, [isEdit, params.id]);

  // 添加通知的函数
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    // 3秒后自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };

  // 处理确认对话框
  const handleConfirm = () => {
    confirmDialogAction();
    setShowConfirmDialog(false);
  };

  // 检查表单是否有更改
  const hasFormChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    if (hasFormChanges()) {
      setConfirmDialogMessage('您有未保存的更改，确定要离开吗？');
      setConfirmDialogAction(() => () => {
        router.push('/admin/works');
      });
      setShowConfirmDialog(true);
    } else {
      router.push('/admin/works');
    }
  };

  // 处理返回按钮点击
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, initialFormData]);

  const fetchWork = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/works?draft=true');
      const works = await response.json();
      const work = works.find((w: any) => w.id === parseInt(params.id as string));
      if (work) {
        // 转换旧格式到新格式
        let formattedWork: Work;
        if (work.images || work.videos) {
          const media: MediaItem[] = [];
          
          // 添加图片
          if (work.images && work.images.length > 0) {
            work.images.forEach((url: string, index: number) => {
              media.push({
                id: `image-${Date.now()}-${index}`,
                type: 'image',
                url,
                order: media.length
              });
            });
          }
          
          // 添加视频链接
          if (work.videos && work.videos.length > 0) {
            work.videos.forEach((url: string, index: number) => {
              media.push({
                id: `video-link-${Date.now()}-${index}`,
                type: 'video-link',
                url,
                order: media.length
              });
            });
          }
          
          formattedWork = {
            ...work,
            media
          };
        } else {
          formattedWork = {
            ...work,
            links: work.links || []
          };
        }
        
        setFormData(formattedWork);
        setInitialFormData(formattedWork);
      } else {
        addNotification('error', '作品不存在');
      }
    } catch (err: any) {
      addNotification('error', `获取作品失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(cat => cat !== category)
        : [...prev.category, category]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) {
      return; // 用户取消了文件选择
    }
    
    setUploading(true);
    let processedFiles = 0;
    const newMedia = [...formData.media];
    
    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        newMedia.push({
          id: `${type}-${Date.now()}-${processedFiles}`,
          type: type as 'image' | 'video',
          url,
          name: file.name,
          order: newMedia.length
        });
        
        processedFiles++;
        if (processedFiles === files.length) {
          setFormData(prev => ({
            ...prev,
            media: newMedia
          }));
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        processedFiles++;
        if (processedFiles === files.length) {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleVideoLink = () => {
    // 使用更简单的方式
    const videoUrl = window.prompt('请输入视频链接:');
    if (videoUrl !== null && videoUrl.trim() !== '') {
      const newMedia = [...formData.media];
      newMedia.push({
        id: `video-link-${Date.now()}`,
        type: 'video-link',
        url: videoUrl.trim(),
        name: '视频链接',
        order: newMedia.length
      });
      
      setFormData(prev => ({
        ...prev,
        media: newMedia
      }));
    }
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
    // 添加通知
    addNotification('success', '媒体删除成功');
  };

  // 处理添加链接
  const handleAddLink = () => {
    if (linkText.trim() && linkUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...(prev.links || []), {
          text: linkText.trim(),
          url: linkUrl.trim(),
          order: (prev.links || []).length
        }]
      }));
      // 清空输入
      setLinkText('');
      setLinkUrl('');
      // 添加通知
      addNotification('success', '链接添加成功');
    }
  };

  // 处理删除链接
  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
    // 添加通知
    addNotification('success', '链接删除成功');
  };

  // 链接拖拽排序功能
  const handleLinkDragStart = (e: React.DragEvent, index: number) => {
    const link = formData.links?.[index];
    if (link) {
      setDraggedLink(link);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleLinkDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLinkIndex(index);
  };

  const handleLinkDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedLink === null || !formData.links) return;
    
    const newLinks = [...formData.links];
    const draggedIndex = newLinks.findIndex(item => 
      item.text === draggedLink.text && 
      item.url === draggedLink.url && 
      item.order === draggedLink.order
    );
    
    if (draggedIndex !== index) {
      const [removed] = newLinks.splice(draggedIndex, 1);
      newLinks.splice(index, 0, removed);
      
      // 更新顺序
      const updatedLinks = newLinks.map((item, i) => ({
        ...item,
        order: i
      }));
      
      setFormData(prev => ({ ...prev, links: updatedLinks }));
      // 添加通知
      addNotification('success', '链接排序成功');
    }
    
    setDraggedLink(null);
    setDragOverLinkIndex(null);
  };

  // 拖拽排序功能
  const handleDragStart = (e: React.DragEvent, index: number) => {
    const item = formData.media[index];
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    const newMedia = [...formData.media];
    const draggedIndex = newMedia.findIndex(item => item.id === draggedItem.id);
    
    if (draggedIndex !== index) {
      const [removed] = newMedia.splice(draggedIndex, 1);
      newMedia.splice(index, 0, removed);
      
      // 更新顺序
      const updatedMedia = newMedia.map((item, i) => ({
        ...item,
        order: i
      }));
      
      setFormData(prev => ({ ...prev, media: updatedMedia }));
      // 添加通知
      addNotification('success', '媒体排序成功');
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // 处理对话框提交
  const handleDialogSubmit = () => {
    if (dialogType === 'link') {
      // 处理超链接
      const linkText = dialogInput1.trim();
      const linkUrl = dialogInput2.trim();
      if (linkText && linkUrl) {
        const link = `[${linkText}](${linkUrl})`;
        setFormData(prev => ({
          ...prev,
          description: prev.description + link
        }));
      }
    } else if (dialogType === 'video') {
      // 处理视频链接
      const videoUrl = dialogInput1.trim();
      if (videoUrl) {
        const newMedia = [...formData.media];
        newMedia.push({
          id: `video-link-${Date.now()}`,
          type: 'video-link',
          url: videoUrl,
          name: '视频链接',
          order: newMedia.length
        });
        
        setFormData(prev => ({
          ...prev,
          media: newMedia
        }));
      }
    }
    setShowDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 验证
    if (!formData.title || !formData.brief || !formData.description || !formData.cover || formData.category.length === 0) {
      addNotification('error', '请填写所有必填字段');
      return;
    }
    
    setSaving(true);

    try {
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      if (result.success) {
        addNotification('success', '✅ 发布成功，前台将在1-2秒内更新');
        // 1.5秒后跳转到作品列表
        setTimeout(() => {
          router.push('/admin/works');
        }, 1500);
      } else {
        addNotification('error', `发布失败: ${result.message}`);
      }
    } catch (err: any) {
      let errorMessage = '发布失败';
      if (err.message.includes('Network')) {
        errorMessage = '网络连接失败，请检查您的网络设置';
      } else if (err.message.includes('Timeout')) {
        errorMessage = '请求超时，请稍后重试';
      } else {
        errorMessage = `发布失败: ${err.message}`;
      }
      addNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-primary text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <AdminCursorFix />
      {/* 导航栏 */}
      <nav className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">后台管理系统</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-white"
          >
            返回作品列表
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-white">
            {isEdit ? '编辑作品' : '添加作品'}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/20 text-green-400 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">基本信息</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    作品标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    简介 *
                  </label>
                  <input
                    type="text"
                    value={formData.brief}
                    onChange={(e) => setFormData({...formData, brief: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    详细描述 *
                  </label>
                  <div className="mb-4">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    分类标签 *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((category) => (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.category.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="mr-2"
                        />
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    排序
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white flex items-center justify-between">
                    <span>{formData.order}</span>
                    <span className="text-xs text-gray-400">当前顺序</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    封面图片 *
                  </label>
                  {!formData.cover && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const url = event.target?.result as string;
                            setFormData({...formData, cover: url});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    />
                  )}
                  {formData.cover && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            // 重置封面，显示文件选择框
                            setFormData({...formData, cover: ''});
                          }}
                          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all text-white"
                        >
                          更换封面
                        </button>
                      </div>
                      <div className="mt-3">
                        <img
                          src={formData.cover}
                          alt="封面预览"
                          className="w-32 h-24 object-cover rounded-lg"
                          loading="lazy"
                        />
                        <p className="text-xs text-gray-400 mt-1">图片比例固定为4:3</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 链接管理 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">链接管理</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="链接文本"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  />
                  <input
                    type="text"
                    placeholder="链接地址"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 bg-primary text-dark-bg rounded-lg hover:bg-primary/90 transition-all whitespace-nowrap"
                  >
                    添加链接
                  </button>
                </div>
                
                {formData.links && formData.links.length > 0 && (
                  <div className="space-y-2">
                    {formData.links.map((link, index) => (
                      <div
                        key={`${link.text}-${index}`}
                        className={`flex items-center gap-2 p-3 rounded-lg ${dragOverLinkIndex === index ? 'bg-gray-700' : 'bg-gray-800'}`}
                        draggable
                        onDragStart={(e) => handleLinkDragStart(e, index)}
                        onDragOver={(e) => handleLinkDragOver(e, index)}
                        onDrop={(e) => handleLinkDrop(e, index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-move" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-white font-medium">{link.text}</div>
                          <div className="text-gray-400 text-sm">{link.url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 作品媒体 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">作品媒体</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {uploading ? '上传中...' : '+ 上传文件'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDialogType('video');
                      setDialogInput1('');
                      setDialogInput2('');
                      setShowDialog(true);
                    }}
                    className="px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    + 添加视频链接
                  </button>
                </div>
              </div>
              
              {/* 统一媒体网格 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.media.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative bg-gray-700 rounded-lg overflow-hidden border-2 transition-all ${
                      dragOverIndex === index
                        ? 'border-primary shadow-xl shadow-primary/30 scale-102 ring-2 ring-primary/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {item.type === 'image' && (
                      <div className="relative">
                        <img
                          src={item.url}
                          alt={item.name || `图片 ${index + 1}`}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />
                        {item.name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                            <p className="text-xs text-white truncate">{item.name}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'video' && (
                      <div className="relative">
                        <video
                          src={item.url}
                          className="w-full h-40 object-cover"
                          controls
                          muted
                          playsInline
                        />
                        {item.name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                            <p className="text-xs text-white truncate">{item.name}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'video-link' && (
                      <div className="relative bg-gray-600 h-40 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="text-primary mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-300 truncate">视频链接</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">{item.url}</p>
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.media.length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-400">
                    暂无媒体文件，请点击上传或添加视频链接
                  </div>
                )}
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-all text-white"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存作品'}
              </button>
            </div>
          </form>

          {/* 自定义对话框 */}
          {showDialog && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {dialogType === 'link' ? '插入超链接' : '添加视频链接'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      {dialogType === 'link' ? '链接文本' : '视频链接'}
                    </label>
                    <input
                      type="text"
                      value={dialogInput1}
                      onChange={(e) => setDialogInput1(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    />
                  </div>
                  {dialogType === 'link' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        链接地址
                      </label>
                      <input
                        type="text"
                        value={dialogInput2}
                        onChange={(e) => setDialogInput2(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-end mt-6">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all text-white"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDialogSubmit}
                    className="px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 确认对话框 */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4 text-white">确认操作</h3>
                <p className="text-gray-300 mb-6">{confirmDialogMessage}</p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all text-white"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 通知组件 */}
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
