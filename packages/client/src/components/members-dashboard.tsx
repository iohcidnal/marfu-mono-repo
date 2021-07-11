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

import { IDashboardDto } from '@common';

interface IProps {
  members: IDashboardDto[];
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

export default function MembersDashboard({ members }: IProps) {
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
        {members.map(member => {
          return (
            <Link href={`/member/${encodeURIComponent(member._id)}`} key={member._id}>
              <WrapItem>
                <Box
                  w="xs"
                  borderWidth="1px"
                  borderRadius="lg"
                  p="4"
                  as="button"
                  shadow="md"
                  {...colorMap[member.status]}
                >
                  <Text fontSize="lg" fontWeight="semibold">
                    {member.firstName} {member.lastName}
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
