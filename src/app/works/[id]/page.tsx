'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Work from '@/components/Work';
import { WorkItem } from '@/components/Work';

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workId, setWorkId] = useState<string | null>(null);
  const [showDirectModal, setShowDirectModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      setWorkId(String(params.id));
      setShowDirectModal(true);
    }
  }, [params.id]);

  const handleCloseDirectModal = () => {
    setShowDirectModal(false);
    setWorkId(null);
    // 导航回主页
    router.push('/#work');
  };

  return (
    <Work 
      directWorkId={showDirectModal ? workId : null}
      onDirectClose={handleCloseDirectModal}
    />
  );
}
