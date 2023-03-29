import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/modules/chat-bot'), { ssr: false });

// TODO: remove
export default function Temp() {
  return <Chat></Chat>;
}
