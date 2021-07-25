import { useToast } from '@chakra-ui/react';
import { useMutation } from 'react-query';

import { fetcher } from '../../utils';
import toastOptions from './toast-options';

export type method = 'PUT' | 'POST' | 'DELETE';

export default function useFetcher<T, P = T>(onSuccessSubmit: (data: T) => void, method: method) {
  const toast = useToast();

  const mutation = useMutation(
    ({ payload, url }: { payload: P; url: string }) => {
      return fetcher({
        url,
        method,
        payload
      });
    },
    {
      onSuccess: ({ status, data }: { status: number; data: T }) => {
        if ([200, 201].includes(status)) {
          onSuccessSubmit(data);
        } else {
          toast({
            ...toastOptions,
            title: 'An error occured',
            status: 'error',
            description: data['errorMessage']
          });
        }
      },
      onError: () => {
        toast({
          ...toastOptions,
          title: 'An error occured',
          status: 'error'
        });
      }
    }
  );

  return mutation;
}
