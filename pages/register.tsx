export { Register as default } from '@/modules/user/Login';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<{
  warning?: string;
}> = async context => {
  const { i } = context.query;
  if (process.env.REQUIRE_INVITATION === 'true' && i == null) {
    return {
      props: {
        warning: '目前仅支持邀请注册',
      },
    };
  }

  return {
    props: {},
  };
};
