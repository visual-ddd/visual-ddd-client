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

  if (!session) {
    return {
      redirect: { destination: '/login', statusCode: 302 },
    };
  }

  const state = session.state;

  if (state == null) {
    return {
      redirect: { destination: '/launch', statusCode: 302 },
    };
  }

  return {
    redirect: { destination: `/${state.entry}${state.entryId ? `/${state.entryId}` : ''}`, statusCode: 302 },
  };
});
