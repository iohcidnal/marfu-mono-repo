import { GetServerSideProps } from 'next';
import { fetcher } from '../../utils';
import { MemberInfo } from '../../components';

export default function Member({ member, medications }) {
  return <MemberInfo member={member} medications={medications} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { memberId } = context.query;
  const results = await Promise.allSettled([
    fetcher({ url: `${process.env.NEXT_PUBLIC_API}members/${memberId}` }, context),
    fetcher({ url: `${process.env.NEXT_PUBLIC_API}medications/${memberId}` }, context)
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

  return {
    props: {
      member: results[0]['value'].data,
      medications: results[1]['value'].data
    }
  };
};
