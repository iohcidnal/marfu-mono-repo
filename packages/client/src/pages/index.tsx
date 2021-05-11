import { GetServerSideProps } from 'next';
import { SignIn } from '../components';

export default function Index() {
  return <SignIn />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const option: RequestInit = {
    headers: context.req ? { cookie: context.req.headers.cookie } : undefined
  };
  // TODO: Make fetch re-usable for server side calls
  const result = await fetch(`${process.env.NEXT_PUBLIC_API}members`, option);

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
