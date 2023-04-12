import { GetServerSideProps } from 'next';

export default function SystemIndex() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      permanent: false,
      destination: '/system/organization',
    },
  };
};
