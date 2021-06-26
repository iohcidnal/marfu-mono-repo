import Link from 'next/link';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Box,
  Wrap,
  WrapItem,
  Text,
  HStack
} from '@chakra-ui/react';
import { HamburgerIcon, AddIcon } from '@chakra-ui/icons';

import { IMemberDto, IMedicationDto } from '@common';

interface Props {
  membersWithMeds: (IMemberDto & IMedicationDto)[];
}

const colorMap = {
  PAST_DUE: {
    color: 'white',
    bgColor: 'red'
  },
  COMING: {
    color: 'white',
    bgColor: 'green'
  }
};

export default function MembersDashboard({ membersWithMeds }: Props) {
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
              <MenuItem icon={<AddIcon />}>Add new member</MenuItem>
            </MenuList>
          </Menu>
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            Dashboard
          </Text>
        </HStack>
      </Box>
      <Wrap p="10" justify="center" alignContent="flex-start">
        {membersWithMeds.map(med => {
          return (
            <Link href={`/member/${encodeURIComponent(med.memberId)}`} key={med._id}>
              <WrapItem>
                <Box
                  w="xs"
                  borderWidth="1px"
                  borderRadius="lg"
                  p="4"
                  as="button"
                  shadow="md"
                  {...colorMap[med.status]}
                >
                  <Text fontSize="lg" fontWeight="semibold">
                    {med.firstName} {med.lastName}
                  </Text>
                </Box>
              </WrapItem>
            </Link>
          );
        })}
      </Wrap>
    </>
  );
}
