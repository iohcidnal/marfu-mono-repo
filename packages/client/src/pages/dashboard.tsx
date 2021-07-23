import { GetServerSideProps } from 'next';

import { IDashboardProps, MembersDashboard } from '../components';
import { fetcher } from '../utils';

export default function Dashboard({ currentUserId }: IDashboardProps) {
  return <MembersDashboard currentUserId={currentUserId} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await fetcher({ url: `${process.env.NEXT_PUBLIC_API}users/session` }, context);

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
      currentUserId: result.data._id
    }
  };
};
