import { useQuery } from 'react-query';
import { fetcher } from '../../utils';

export default function useValidateSession() {
  const { data } = useQuery(
    ['user-session'],
    async () => {
      return await fetcher({
        url: `${process.env.NEXT_PUBLIC_API}users/session`
      });
    },
    {
      enabled: true
    }
  );

  return data?.status === 200;
}
