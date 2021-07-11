import { GetServerSideProps } from 'next';
import { MembersDashboard } from '../components';
import { fetcher } from '../utils';

export default function Dashboard({ members }) {
  return <MembersDashboard members={members} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await fetcher(
    {
      url: `${process.env.NEXT_PUBLIC_API}members/dashboard`,
      method: 'POST',
      payload: {
        clientDateTime: new Date()
      }
    },
    context
  );

  if (result.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  return {
    props: {
      members: result.data
    }
  };
};
