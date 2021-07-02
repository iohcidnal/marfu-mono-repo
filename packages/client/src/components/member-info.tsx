import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  LinkBox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  Wrap
} from '@chakra-ui/react';
import { HamburgerIcon, AddIcon } from '@chakra-ui/icons';
import { IMemberDto, IMedicationDto } from '@common';

interface IProps {
  member: IMemberDto;
  medications: IMedicationDto[];
}

export default function MemberInfo({ member, medications }: IProps) {
  console.log('{member, medications} :>> ', { member, medications });
  return (
    <>
      {/* TODO: Display breadcrumbs */}
      <TitleBar title={`Medications for ${member.firstName} ${member.lastName}`} />
      <Wrap p="10" justify="center" alignContent="flex-start">
        {medications.map(medication => (
          <MedicationCard key={medication._id} medication={medication} />
        ))}
      </Wrap>
    </>
  );
}

function TitleBar({ title }: { title: string }) {
  return (
    <>
      <Box p="4" shadow="md">
        <HStack>
          <MedicationMenu />
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            {title}
          </Text>
        </HStack>
      </Box>
    </>
  );
}

function MedicationMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<AddIcon />} onClick={onOpen}>
            Add new medication
          </MenuItem>
        </MenuList>
      </Menu>
      <DrawerForm isOpen={isOpen} onClose={onClose} />
    </>
  );
}

function DrawerForm({ isOpen, onClose, medicationId = null }) {
  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {!medicationId ? 'Add New Medication' : ''}
        </DrawerHeader>
        <DrawerBody>
          {/* TODO: Create form  */}
          <form></form>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          <HStack>
            <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="blue" w="full" size="lg">
              Save
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function MedicationCard({ medication }: { medication: IMedicationDto }) {
  return (
    <LinkBox as="article" w="sm" p="4" borderWidth="1px" rounded="md" shadow="md">
      <Heading size="md" my="2">
        {medication.medicationName}
      </Heading>

      <HStack justifyContent="space-between">
        <HStack>
          <Text fontWeight="semibold">Dosage:</Text>
          <Text>{medication.dosage}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold">Route:</Text>
          <Text>{medication.route}</Text>
        </HStack>
      </HStack>

      <HStack justifyContent="space-between">
        <HStack>
          <Text fontWeight="semibold">Start:</Text>
          <Text>
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            }).format(new Date(medication.startDate))}
          </Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold">End:</Text>
          <Text>
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            }).format(new Date(medication.endDate))}
          </Text>
        </HStack>
      </HStack>

      {/* TODO: Add new field `Note` for medication. This will be primarily use for instructions */}

      <HStack mt="2">
        <Text fontWeight="semibold">Schedule:</Text>
        <HStack>
          {medication.frequencies.map(freq => (
            <Text>
              {new Intl.DateTimeFormat('en-US', {
                timeStyle: 'short',
                hour12: false
              }).format(new Date(freq.dateTime))}
            </Text>
          ))}
        </HStack>
      </HStack>

      {/* TODO: Handle onClick. Should display a Drawer: https://chakra-ui.com/docs/overlay/drawer */}
      <HStack mt="4" justifyContent="space-between">
        <Button colorScheme="gray" w="full" size="sm" variant="outline">
          Update
        </Button>
        <Button colorScheme="gray" w="full" size="sm" variant="outline">
          Add logs
        </Button>
        <Button colorScheme="gray" w="full" size="sm" variant="outline">
          View logs
        </Button>
      </HStack>
    </LinkBox>
  );
}
