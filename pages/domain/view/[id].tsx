import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const DynamicDesigner = dynamic(() => import('@/modules/domain/Designer'), { ssr: false });

export default function Designer() {
  const { query } = useRouter();
  return <DynamicDesigner id={query.id as string} readonly />;
}
