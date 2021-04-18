import * as React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider, QueryClient } from 'react-query';

const queryClient = new QueryClient();

export default function renderWithProviders(children: React.ReactNode) {
  const Component = () => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </QueryClientProvider>
  );

  return () => {
    const rendered = render(<Component />);
    return {
      ...rendered
    };
  };
}
