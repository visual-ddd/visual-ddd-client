import dynamic from 'next/dynamic';

const DynamicDesigner = dynamic(() => import('@/modules/domain/Designer'), { ssr: false });

export default function Designer() {
  return <DynamicDesigner />;
}
