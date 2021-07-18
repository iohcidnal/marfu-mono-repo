import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay
} from '@chakra-ui/modal';
import { useDisclosure } from '@chakra-ui/hooks';
import { Button } from '@chakra-ui/react';

interface IProps {
  handleConfirm: () => void;
  title: React.ReactNode;
  message: string;
}

const ConfirmDialog = React.forwardRef(function ConfirmDialog(
  { handleConfirm, title, message }: IProps,
  ref: React.MutableRefObject<{
    onClose: () => void;
    onOpen: () => void;
  }>
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = React.useRef();

  React.useImperativeHandle(ref, () => ({ onClose, onOpen }), [onClose, onOpen]);

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>{title}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>{message}</AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            No
          </Button>
          <Button colorScheme="red" ml={3} onClick={handleConfirm}>
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export default ConfirmDialog;
