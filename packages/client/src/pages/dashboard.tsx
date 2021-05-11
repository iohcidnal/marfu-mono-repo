import { GetServerSideProps } from 'next';
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

interface DashboardProps {
  medications: (IMemberDto & IMedicationDto)[];
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

export default function Dashboard({ medications }: DashboardProps) {
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
        {medications.map(med => {
          return (
            <WrapItem key={med._id}>
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
          );
        })}
      </Wrap>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const option: RequestInit = {
    headers: context.req ? { cookie: context.req.headers.cookie } : undefined
  };
  // TODO: Make fetch re-usable for server side calls
  let result = await fetch(`${process.env.NEXT_PUBLIC_API}members`, option);

  if (result.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  option.headers['Content-Type'] = 'application/json';
  const members: IMemberDto[] = await result.json();
  const memberIds = { memberIds: members.map(dto => dto._id) };
  result = await fetch(`${process.env.NEXT_PUBLIC_API}medications/dashboard`, {
    method: 'POST',
    body: JSON.stringify(memberIds),
    ...option
  });
  const medications: IMedicationDto[] = await result.json();
  const membersMeds = medications.reduce((acc, med) => {
    const member = members.find(m => m._id === med.memberId);
    acc.push({
      ...member,
      ...med
    });
    return acc;
  }, []);

  return {
    props: {
      medications: membersMeds
    }
  };
};
