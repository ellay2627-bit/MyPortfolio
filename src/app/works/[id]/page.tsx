import React from 'react';
import Work from '@/components/Work';
import worksList from '../../../../public/static/works-list.json';

export const dynamicParams = false;

export function generateStaticParams() {
  return (worksList as Array<{ id: string | number }>).map((work) => ({
    id: String(work.id),
  }));
}

interface WorkDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkDetailPage({ params }: WorkDetailPageProps) {
  const workId = params?.id ? String(params.id) : null;

  return (
    <Work
      directWorkId={workId}
      onDirectClose={undefined}
    />
  );
}
