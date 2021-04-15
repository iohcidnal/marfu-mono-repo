import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { IUserDto } from '@common';

export default function SignIn() {
  return (
    <Stack bg="gray.50" minHeight="100vh">
      <Header />
      <Form />
    </Stack>
  );
}

function Header() {
  return (
    <Box textAlign="center" mb={['16', '20']} mt="4">
      <Heading color="blue.600" fontSize="44px" fontWeight="extrabold">
        marfu
      </Heading>
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
    formState: { errors }
  } = useForm<IUserDto>({ mode: 'all' });

  function onSubmit(data: IUserDto) {
    // TODO: Call api to submit
    console.log('data :>> ', data.password, data.userName);
  }

  return (
    <Stack align="center">
      <Stack spacing="6" width={['full', 'lg']}>
        <Box bg="white" borderWidth={1} p={4} boxShadow="lg">
          <Text color="gray.600" fontSize="20px" mb={6} fontWeight="semibold">
            Sign in to continue
          </Text>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={6}>
              <FormControl id="userName" isRequired isInvalid={!!errors.userName}>
                <FormLabel>Email address</FormLabel>
                <Input {...register('userName', { required: true })} type="email" size="lg" />
                {errors.userName && <FormErrorMessage>Email address is required.</FormErrorMessage>}
              </FormControl>
              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <Stack isInline justifyContent="space-between">
                  <FormLabel>Password</FormLabel>
                  <Link color="blue.600" fontSize="sm" fontWeight="bold">
                    Forgot password?
                  </Link>
                </Stack>
                <Input {...register('password', { required: true })} type="password" size="lg" />
                {errors.password && <FormErrorMessage>Password is required.</FormErrorMessage>}
              </FormControl>
              <Button type="submit" w="full" size="lg">
                Sign in
              </Button>
              <Stack isInline fontSize="sm" fontWeight="bold">
                <Text>New user?</Text>
                <Link color="blue.600">Create an account</Link>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Stack>
  );
}
