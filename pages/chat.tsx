import type { GetServerSideProps } from 'next';
import { getSupportedModels } from '@/modules/ai/platform';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Page = dynamic(() => import('@/modules/chat-bot/StandalonePage'), { ssr: false });

export interface ChatProps {
  models: string[];
}

export default function Chat(props: ChatProps) {
  return (
    <>
      <Head>
        <title>Visual DDD ChatBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
      </Head>
      <Page models={props.models} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ChatProps> = async context => {
  const models = getSupportedModels();

  return {
    props: {
      models,
    },
  };
};
