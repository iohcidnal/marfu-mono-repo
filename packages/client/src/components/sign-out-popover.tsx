import * as React from 'react';
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { FaSignOutAlt } from 'react-icons/fa';
import useFetcher from './common/use-fetcher';
import { signInMode } from '@common';

export default function SignOutPopover() {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const initialFocusRef = React.useRef();
  const mutation = useFetcher<signInMode, any>(handleSignOutSuccess, 'POST');

  function handleSignOut() {
    mutation.mutate({ payload: {}, url: `${process.env.NEXT_PUBLIC_API}users/signout` });
  }

  function handleSignOutSuccess(mode: signInMode) {
    window.location.replace(decodeURIComponent(`/?mode=${mode}`));
  }

  return (
    <Popover
      isLazy
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
    >
      <PopoverTrigger>
        <IconButton aria-label="Sign out" icon={<FaSignOutAlt />} variant="outline" />
      </PopoverTrigger>
      {/* isOpen && is needed to fix alignment in mobile */}
      {isOpen && (
        <PopoverContent bg="blue.900" color="white">
          <PopoverHeader fontWeight="semibold" border="0">
            <HStack>
              <Icon as={FaSignOutAlt} />
              <Text>Sign out</Text>
            </HStack>
          </PopoverHeader>
          <PopoverArrow bg="blue.900" />
          <PopoverCloseButton />
          <PopoverBody>Are you sure you want to sign out?</PopoverBody>
          <PopoverFooter border="0" d="flex" justifyContent="flex-end" p="4">
            <HStack>
              <Button colorScheme="green" ref={initialFocusRef} onClick={onClose}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleSignOut}>
                Yes
              </Button>
            </HStack>
          </PopoverFooter>
        </PopoverContent>
      )}
    </Popover>
  );
}
