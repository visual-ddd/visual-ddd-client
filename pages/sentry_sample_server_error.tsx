import { GetServerSideProps } from 'next';

export default function SentrySampleServerError() {
  return <div>just for test</div>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  throw new Error('test server side error');
};
