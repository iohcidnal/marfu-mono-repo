import * as React from 'react';
import {
  Button,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure
} from '@chakra-ui/react';
import { FaSignOutAlt } from 'react-icons/fa';
import useFetcher from './common/use-fetcher';

export default function SignOutPopover() {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const initialFocusRef = React.useRef();
  const mutation = useFetcher(handleSignOutSuccess, 'POST');

  function handleSignOut() {
    mutation.mutate({ payload: {}, url: `${process.env.NEXT_PUBLIC_API}users/signout` });
  }

  function handleSignOutSuccess(data: any) {
    window.location.replace(decodeURIComponent(`/?mode=${data.mode}`));
  }

  return (
    <Popover initialFocusRef={initialFocusRef} isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
      <PopoverTrigger>
        <IconButton aria-label="Sign out" icon={<FaSignOutAlt />} variant="outline" />
      </PopoverTrigger>
      <PopoverContent bg="blue.900" color="white">
        <PopoverHeader fontWeight="semibold" border="0">
          Sign out
        </PopoverHeader>
        <PopoverArrow bg="blue.900" />
        <PopoverCloseButton />
        <PopoverBody>Are you sure you want to sign out?</PopoverBody>
        <PopoverFooter border="0" d="flex" justifyContent="flex-end" p="4">
          <HStack spacing="2">
            <Button variant="outline" ref={initialFocusRef} onClick={onClose}>
              No
            </Button>
            <Button colorScheme="red" onClick={handleSignOut}>
              Yes
            </Button>
          </HStack>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
