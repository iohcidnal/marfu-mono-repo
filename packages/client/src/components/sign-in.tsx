import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';

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
  return (
    <Stack align="center">
      <Stack spacing="6" width={['full', 'lg']}>
        <Box bg="white" borderWidth={1} p={4} boxShadow="lg">
          <Text color="gray.600" fontSize="20px" mb={6} fontWeight="semibold">
            Sign in to continue
          </Text>
          <form>
            <Stack spacing={6}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input type="email" size="lg" />
              </FormControl>
              <FormControl id="password">
                <Stack isInline justifyContent="space-between">
                  <FormLabel>Password</FormLabel>
                  <Link color="blue.600" fontSize="sm" fontWeight="bold">
                    Forgot password?
                  </Link>
                </Stack>
                <Input type="password" size="lg" />
              </FormControl>
              <Button w="full" size="lg">
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
