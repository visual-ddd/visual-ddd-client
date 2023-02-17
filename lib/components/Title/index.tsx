import Head from 'next/head';

export interface TitleProps {
  children?: string;
}

export const Title = (props: TitleProps) => {
  const { children } = props;

  return (
    <Head>
      <title>{`${children} - Visual DDD`}</title>
    </Head>
  );
};
