import {
  Box,
  Heading,
  HStack,
  IconButton,
  LinkBox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
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
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList>
              <MenuItem icon={<AddIcon />}>Add new medication</MenuItem>
            </MenuList>
          </Menu>
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            {title}
          </Text>
        </HStack>
      </Box>
    </>
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

      {/* TODO: Stop here to handle onClick. Should display a Drawer: https://chakra-ui.com/docs/overlay/drawer */}
      <HStack mt="4" justifyContent="space-between">
        <Text as="button" color="teal.400" fontWeight="bold">
          Add logs
        </Text>
        <Text as="button" color="teal.400" fontWeight="bold">
          View logs
        </Text>
      </HStack>
    </LinkBox>
  );
}
