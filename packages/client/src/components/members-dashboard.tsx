import Link from 'next/link';
import {
  Alert,
  AlertIcon,
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Wrap,
  WrapItem
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
    <Stack>
      <TitleBar />
      <Cards members={members} />
    </Stack>
  );
}

function TitleBar() {
  return (
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
  );
}

function Cards({ members }: IProps) {
  if (members.length > 0) {
    return (
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
    );
  }

  return (
    <Alert>
      <AlertIcon />
      There are no members yet. Select `Add new member` from the menu to create one.
    </Alert>
  );
}
