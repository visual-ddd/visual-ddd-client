import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/modules/scenario/scenario-design'), { ssr: false });

export default function Temp() {
  return <Editor />;
}
