import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { GetServerSideProps } from 'next';

export default function Dashboard() {
  return (
    <div>
      <img src="/logo.svg" alt="logo" />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = withWakedataRequestSsr(async context => {
  const session = context.req.session.content;

  context.res.setHeader('Cache-Control', 'no-cache');

  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  const state = session.state;

  if (state == null) {
    return {
      redirect: { destination: '/launch', permanent: false },
    };
  }

  return {
    redirect: { destination: `/${state.entry}${state.entryId ? `/${state.entryId}` : ''}`, permanent: false },
  };
});
