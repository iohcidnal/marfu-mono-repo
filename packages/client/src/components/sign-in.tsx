import * as React from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaCapsules } from 'react-icons/fa';

import { IUserDto, signInMode } from '@common';
import useFetcher from './common/use-fetcher';

export default function SignIn() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('marfu.token')) {
      router.replace('/dashboard');
    } else {
      setIsLoaded(true);
    }
  }, [router]);

  return (
    <Skeleton isLoaded={isLoaded}>
      <Stack bg="gray.50" minHeight="100vh">
        <Header />
        <Form />
      </Stack>
    </Skeleton>
  );
}

function Header() {
  return (
    <Box textAlign="center" mb="6" mt="4">
      <HStack justify="center">
        <Icon as={FaCapsules} fontSize="xx-large" color="blue.600" />
        <Heading color="blue.600" fontSize="44px" fontWeight="extrabold">
          marfu
        </Heading>
      </HStack>
      <Text color="gray.600" fontWeight="light">
        Medication Administration Record for Family Use
      </Text>
    </Box>
  );
}

function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState
  } = useForm<IUserDto>({ mode: 'all' });
  const router = useRouter();
  const mutation = useFetcher<string, IUserDto>(handleSubmitSuccess, 'POST');

  function onSubmit(payload: IUserDto) {
    mutation.mutate({
      payload,
      url: `${process.env.NEXT_PUBLIC_API}users/authenticate`
    });
  }

  function handleSubmitSuccess(token: string) {
    localStorage.setItem('marfu.token', token);
    router.replace('/dashboard');
  }

  return (
    <Stack align="center">
      <Stack spacing="6" width={['full', 'lg']}>
        <Box bg="white" borderWidth={1} p={4} boxShadow="lg">
          <MessageMode />
          <Text color="gray.600" fontSize="20px" mb={6} fontWeight="semibold">
            Sign in to continue
          </Text>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={6}>
              <FormControl id="userName" isRequired isInvalid={!!errors.userName}>
                <FormLabel>Username</FormLabel>
                <Input
                  {...register('userName', {
                    required: 'Username is required.'
                  })}
                  type="email"
                  size="lg"
                />
                {errors.userName && <FormErrorMessage>{errors.userName.message}</FormErrorMessage>}
              </FormControl>
              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <Stack isInline justifyContent="space-between">
                  <FormLabel>Password</FormLabel>
                  <Link color="blue.600" fontSize="sm" fontWeight="bold">
                    Forgot password?
                  </Link>
                </Stack>
                <Input
                  {...register('password', { required: 'Password is required.' })}
                  type="password"
                  size="lg"
                />
                {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
              </FormControl>
              <Button
                type="submit"
                isLoading={mutation.isLoading}
                disabled={!formState.isValid}
                colorScheme="blue"
                w="full"
                size="lg"
              >
                Sign in
              </Button>
              <Stack isInline fontSize="sm" fontWeight="bold">
                <Text>New user?</Text>
                <Link color="blue.600" href="/user-registration">
                  Create an account
                </Link>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Stack>
  );
}

function MessageMode() {
  const router = useRouter();
  const mode = router?.query.mode as signInMode;

  if (!mode) return null;

  let message: string;
  if (mode === 'SIGNED_OUT') {
    message = 'You have successfully signed out. Sign back in to continue.';
  } else if (mode === 'REGISTERED') {
    message =
      'You have successfully registered. You can now use your username and password to sign in.';
  }

  if (!message) return null;

  return (
    <Alert status="success" mb="6">
      <AlertIcon />
      {message}
    </Alert>
  );
}
