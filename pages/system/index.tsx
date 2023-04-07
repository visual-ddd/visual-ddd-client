import { GetServerSideProps } from 'next';

export default function SystemIndex() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      statusCode: 302,
      destination: '/system/organization',
    },
  };
};
