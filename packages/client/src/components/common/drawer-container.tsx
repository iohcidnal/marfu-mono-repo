import * as React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/modal';
import { DrawerFooter, DrawerProps } from '@chakra-ui/react';

interface IProps extends DrawerProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DrawerContainer({ title, children, footer, ...drawerProps }: IProps) {
  return (
    <Drawer {...drawerProps}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">{title}</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        {footer && <DrawerFooter borderTopWidth="1px">{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
