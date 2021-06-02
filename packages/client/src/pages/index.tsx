import { GetServerSideProps } from 'next';
import { SignIn } from '../components';

export default function Index() {
  return <SignIn />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const option: RequestInit = {
    headers: context.req ? { cookie: context.req.headers.cookie } : undefined
  };
  const result = await fetch(`${process.env.NEXT_PUBLIC_API}users/session`, option);

  if (result.status === 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard'
      }
    };
  }

  return {
    props: {}
  };
};
