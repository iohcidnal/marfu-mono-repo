import { GetServerSideProps } from 'next';
import { SignIn } from '../components';
import { fetcher } from '../utils';

export default function Index() {
  return <SignIn />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await fetcher({ url: `${process.env.NEXT_PUBLIC_API}users/session` }, context);
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
