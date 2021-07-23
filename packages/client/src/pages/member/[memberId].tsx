import { GetServerSideProps } from 'next';

import { fetcher, IFetchResult } from '../../utils';
import { IMemberInfoProps, MemberInfo } from '../../components';

export default function Member({ currentUserId, member }: IMemberInfoProps) {
  return <MemberInfo currentUserId={currentUserId} member={member} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { memberId } = context.query;
  const results = await Promise.allSettled([
    fetcher({ url: `${process.env.NEXT_PUBLIC_API}users/session` }, context),
    fetcher({ url: `${process.env.NEXT_PUBLIC_API}members/${memberId}` }, context)
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

  const [sessionResult, memberResult] = results as PromiseFulfilledResult<IFetchResult>[];

  return {
    props: {
      currentUserId: sessionResult.value.data._id,
      member: memberResult.value.data
    }
  };
};
