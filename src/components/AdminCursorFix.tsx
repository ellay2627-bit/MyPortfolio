'use client';
import React, { useEffect } from 'react';

export default function AdminCursorFix() {
  useEffect(() => {
    // 完全移除前台的自定义光标影响
    const style = document.createElement('style');
    style.id = 'admin-cursor-fix';
    style.textContent = `
      /* 隐藏自定义光标 */
      .custom-cursor, .neo-cursor, .cursor {
        display: none !important;
        pointer-events: none !important;
      }
      
      /* 确保body和根元素正常 */
      :root, body {
        cursor: auto !important;
        pointer-events: auto !important;
      }
      
      /* 按钮和可点击元素 */
      button, a, [role="button"], [onclick], [href], [tabindex]:not([tabindex="-1"]) {
        cursor: pointer !important;
      }
      
      /* 表单元素 */
      input, textarea, select {
        cursor: text !important;
      }
      
      /* 禁用状态 */
      [disabled] {
        cursor: not-allowed !important;
      }
      
      /* 拖拽元素 */
      [draggable="true"] {
        cursor: grab !important;
      }
      [draggable="true"]:active {
        cursor: grabbing !important;
      }
    `;
    
    // 先移除旧的样式（如果存在）
    const oldStyle = document.getElementById('admin-cursor-fix');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
}