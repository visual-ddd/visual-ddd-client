import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/modules/chat-bot'), { ssr: false });

export default function Temp() {
  return (
    <Chat>
      <button>open</button>
    </Chat>
  );
}
