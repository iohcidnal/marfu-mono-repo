import * as React from 'react';
import Link from 'next/link';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  LinkBox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { HamburgerIcon, AddIcon } from '@chakra-ui/icons';

import { IDashboardDto, IMemberDto } from '@common';
import DrawerContainer from './common/drawer-container';
import useFetcher, { method } from './common/use-fetcher';
import { useForm } from 'react-hook-form';
import toastOptions from './common/toast-options';
import { FaCapsules, FaTh, FaTrash, FaUserEdit, FaUserPlus } from 'react-icons/fa';

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

export interface IDashboardProps {
  currentUserId: string;
  dashboardItems: IDashboardDto[];
}

interface IDashboardContextProps extends IDashboardProps {
  setDashboardItems: React.Dispatch<IDashboardDto[]>;
}

const DashboardContext = React.createContext<IDashboardContextProps>(null);
const useDashboardContext = () => React.useContext(DashboardContext);

export default function MembersDashboard({
  currentUserId,
  dashboardItems: initialDashboardItems
}: IDashboardProps) {
  const [dashboardItems, setDashboardItems] = React.useState(initialDashboardItems);
  const value = React.useMemo(
    () => ({
      currentUserId,
      dashboardItems,
      setDashboardItems
    }),
    [currentUserId, dashboardItems]
  );

  return (
    <DashboardContext.Provider value={value}>
      <Stack>
        <TitleBar />
        <Cards />
      </Stack>
    </DashboardContext.Provider>
  );
}

function TitleBar() {
  const formRef = React.useRef<{ onOpen: () => void }>();

  return (
    <>
      <Box p="4" shadow="md">
        <HStack justifyContent="space-between">
          <HStack>
            <Icon as={FaTh} />
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">
              Dashboard
            </Text>
          </HStack>
          <IconButton
            aria-label="Add new user"
            icon={<FaUserPlus />}
            onClick={() => formRef.current.onOpen()}
          />
        </HStack>
      </Box>
      <AddEditMemberForm method="POST" ref={formRef} />
    </>
  );
}

function Cards() {
  const { dashboardItems } = useDashboardContext();

  if (dashboardItems.length > 0) {
    return (
      <Wrap p="10" justify="center">
        {dashboardItems.map(member => {
          return (
            <LinkBox
              key={member._id}
              as="article"
              w="sm"
              padding="4"
              borderWidth="1px"
              rounded="md"
              shadow="md"
              {...colorMap[member.status]}
            >
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">
                  {member.firstName} {member.lastName}
                </Text>
                <HStack justifyContent="flex-end">
                  <Link href={`/member/${encodeURIComponent(member._id)}`}>
                    <IconButton
                      aria-label="View medications"
                      icon={<FaCapsules />}
                      colorScheme="blue"
                    />
                  </Link>
                  <IconButton aria-label="Edit member" icon={<FaUserEdit />} colorScheme="blue" />
                  <IconButton aria-label="Delete member" icon={<FaTrash />} colorScheme="blue" />
                </HStack>
              </HStack>
            </LinkBox>
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

const AddEditMemberForm = React.forwardRef(function AddEditMemberForm(
  { member, method }: { member?: IMemberDto; method: method },
  ref
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
    reset,
    setValue
  } = useForm<IMemberDto>({
    mode: 'all',
    defaultValues: member
  });
  const toast = useToast();
  const { currentUserId, dashboardItems, setDashboardItems } = useDashboardContext();
  const mutation = useFetcher<IMemberDto>(handleSubmitSuccess, method);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  function onSubmit(payload: IMemberDto) {
    const member: IMemberDto = { ...payload, createdBy: currentUserId };
    mutation.mutate({ payload: member, url: `${process.env.NEXT_PUBLIC_API}members` });
  }

  function handleSubmitSuccess(data: IDashboardDto) {
    let toastTitle: string;

    if (method === 'POST') {
      toastTitle = 'Member succesfully created';
      setDashboardItems([...dashboardItems, data]);
    } else {
      toastTitle = 'Member sucessfully updated';
    }

    toast({
      ...toastOptions,
      status: 'success',
      title: toastTitle
    });
    handleClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <DrawerContainer onClose={handleClose} isOpen={isOpen} size="md" title="Add New Member">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <FormControl id="firstName" isRequired isInvalid={!!errors.firstName}>
            <FormLabel>First name</FormLabel>
            <Input
              type="text"
              size="lg"
              {...register('firstName', {
                required: 'First name is required.'
              })}
            />
            {errors.firstName && <FormErrorMessage>{errors.firstName.message}</FormErrorMessage>}
          </FormControl>
          <FormControl id="lastName" isRequired isInvalid={!!errors.lastName}>
            <FormLabel>Last name</FormLabel>
            <Input
              type="text"
              size="lg"
              {...register('lastName', {
                required: 'Last name is required.'
              })}
            />
            {errors.lastName && <FormErrorMessage>{errors.lastName.message}</FormErrorMessage>}
          </FormControl>
          <HStack pt="4">
            <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={!formState.isValid}
              colorScheme="blue"
              // isLoading={mutation.isLoading}
              size="lg"
              type="submit"
              w="full"
            >
              Save
            </Button>
          </HStack>
        </Stack>
      </form>
    </DrawerContainer>
  );
});
