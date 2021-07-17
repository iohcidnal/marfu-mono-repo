import { GetServerSideProps } from 'next';

import { IDashboardProps, MembersDashboard } from '../components';
import { fetcher, IFetchResult } from '../utils';

export default function Dashboard({ currentUserId, dashboardItems }: IDashboardProps) {
  return <MembersDashboard currentUserId={currentUserId} dashboardItems={dashboardItems} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const results = await Promise.allSettled([
    fetcher({ url: `${process.env.NEXT_PUBLIC_API}users/session` }, context),
    fetcher(
      {
        url: `${process.env.NEXT_PUBLIC_API}members/dashboard`,
        method: 'POST',
        payload: {
          clientDateTime: new Date()
        }
      },
      context
    )
  ]);

  if (
    results.some(result => result.status === 'rejected') ||
    results.some(result => result['value'].status !== 200)
  ) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  const [sessionResult, dashboardResult] = results as PromiseFulfilledResult<IFetchResult>[];

  return {
    props: {
      currentUserId: sessionResult.value.data._id,
      dashboardItems: dashboardResult.value.data
    }
  };
};
