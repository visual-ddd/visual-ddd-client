import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/lib/chat-bot/ChatWindow'), { ssr: false });
export default function Temp() {
  return (
    <Chat>
      <button>open</button>
    </Chat>
  );
}
