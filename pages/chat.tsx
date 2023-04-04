import dynamic from 'next/dynamic';
import Head from 'next/head';

const Page = dynamic(() => import('@/modules/chat-bot/StandalonePage'), { ssr: false });

export default function Chat() {
  return (
    <>
      <Head>
        <title>Visual DDD ChatBot</title>
      </Head>
      <Page />
    </>
  );
}
