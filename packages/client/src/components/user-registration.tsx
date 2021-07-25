import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  PinInput,
  PinInputField,
  Stack,
  Text
} from '@chakra-ui/react';
import { INewUserDto, signInMode } from '@common';
import { useForm } from 'react-hook-form';
import useFetcher from './common/use-fetcher';

export default function UserRegistration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
    getValues
  } = useForm<INewUserDto>({
    mode: 'all'
  });
  const mutation = useFetcher<signInMode, INewUserDto>(handleSubmitSuccess, 'POST');
  const isPinInputInvalid =
    !!errors.pin1 ||
    !!errors.pin2 ||
    !!errors.pin3 ||
    !!errors.pin4 ||
    !!errors.pin5 ||
    !!errors.pin6;

  function onSubmit(payload: INewUserDto) {
    mutation.mutate({ payload, url: `${process.env.NEXT_PUBLIC_API}users` });
  }

  function handleSubmitSuccess(mode: signInMode) {
    window.location.replace(decodeURIComponent(`/?mode=${mode}`));
  }

  return (
    <Center pt="10">
      <Box bg="white" borderWidth={1} p={4} boxShadow="lg">
        <Text color="gray.600" fontSize="20px" mb={6} fontWeight="semibold">
          User Registration
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack width={['full', 'md']} spacing="4">
            <FormControl isRequired isInvalid={isPinInputInvalid}>
              <FormLabel>Invitation Code</FormLabel>
              <HStack>
                <PinInput type="alphanumeric" isInvalid={isPinInputInvalid}>
                  <PinInputField maxLength={1} {...register('pin1', { required: true })} />
                  <PinInputField maxLength={1} {...register('pin2', { required: true })} />
                  <PinInputField maxLength={1} {...register('pin3', { required: true })} />
                  <PinInputField maxLength={1} {...register('pin4', { required: true })} />
                  <PinInputField maxLength={1} {...register('pin5', { required: true })} />
                  <PinInputField maxLength={1} {...register('pin6', { required: true })} />
                </PinInput>
              </HStack>
              {isPinInputInvalid && <FormErrorMessage>All codes are required.</FormErrorMessage>}
            </FormControl>
            <FormControl id="firstName" isRequired isInvalid={!!errors.firstName}>
              <FormLabel>First name</FormLabel>
              <Input
                type="text"
                size="lg"
                {...register('firstName', {
                  required: 'First name is required.'
                })}
              />
              {errors.firstName && <FormErrorMessage>{errors.firstName.message}</FormErrorMessage>}
            </FormControl>
            <FormControl id="lastName" isRequired isInvalid={!!errors.lastName}>
              <FormLabel>Last name</FormLabel>
              <Input
                type="text"
                size="lg"
                {...register('lastName', {
                  required: 'Last name is required.'
                })}
              />
              {errors.lastName && <FormErrorMessage>{errors.lastName.message}</FormErrorMessage>}
            </FormControl>
            <FormControl id="userName" isRequired isInvalid={!!errors.userName}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                size="lg"
                {...register('userName', {
                  required: 'Username is required.'
                })}
              />
              {errors.userName && <FormErrorMessage>{errors.userName.message}</FormErrorMessage>}
            </FormControl>
            <FormControl id="password" isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                autoComplete="false"
                type="password"
                size="lg"
                {...register('password', {
                  required: 'Password is required.'
                })}
              />
              {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
            </FormControl>
            <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                autoComplete="false"
                type="password"
                size="lg"
                {...register('confirmPassword', {
                  required: 'Password is required.',
                  validate: value => {
                    const password = getValues('password');
                    if (value !== password) {
                      return 'Passwords do not match.';
                    }
                  }
                })}
              />
              {errors.confirmPassword && (
                <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
              )}
            </FormControl>
            <HStack pt="6" justifyContent="space-between">
              <Button as="a" href="/" colorScheme="blue" variant="outline" size="lg" isFullWidth>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isFullWidth
                isLoading={mutation.isLoading}
                isDisabled={!formState.isValid}
              >
                Register
              </Button>
            </HStack>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}
