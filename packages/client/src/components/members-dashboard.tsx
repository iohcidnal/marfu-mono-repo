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
  Stack,
  Text,
  useDisclosure,
  useToast,
  Wrap
} from '@chakra-ui/react';

import { IDashboardDto, IMemberDto } from '@common';
import DrawerContainer from './common/drawer-container';
import useFetcher, { method } from './common/use-fetcher';
import { useForm } from 'react-hook-form';
import toastOptions from './common/toast-options';
import { FaCapsules, FaTh, FaTrash, FaUserEdit, FaUserPlus } from 'react-icons/fa';

const colorMap = {
  PAST_DUE: {
    color: 'white',
    bgColor: 'red.400'
  },
  COMING: {
    color: 'white',
    bgColor: 'green.400'
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
        {dashboardItems.map(item => {
          return (
            <LinkBox
              key={item._id}
              as="article"
              w="sm"
              padding="4"
              borderWidth="1px"
              rounded="md"
              shadow="md"
              {...colorMap[item.status]}
            >
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">
                  {item.firstName} {item.lastName}
                </Text>
                <CardActions dashboardItem={item} />
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

function CardActions({ dashboardItem }: { dashboardItem: IDashboardDto }) {
  const formRef = React.useRef<{ onOpen: () => void }>();

  return (
    <>
      <HStack justifyContent="flex-end">
        <Link href={`/member/${encodeURIComponent(dashboardItem._id)}`}>
          <IconButton aria-label="View medications" icon={<FaCapsules />} colorScheme="blue" />
        </Link>
        <IconButton
          aria-label="Edit member"
          icon={<FaUserEdit />}
          colorScheme="blue"
          onClick={() => formRef.current.onOpen()}
        />
        {/* STOP HERE: DELETE MEMBER */}
        <IconButton aria-label="Delete member" icon={<FaTrash />} colorScheme="blue" />
      </HStack>
      <AddEditMemberForm dashboardItem={dashboardItem} method="PUT" ref={formRef} />
    </>
  );
}

const AddEditMemberForm = React.forwardRef(function AddEditMemberForm(
  { dashboardItem, method }: { dashboardItem?: IDashboardDto; method: method },
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
    defaultValues: dashboardItem
  });
  const toast = useToast();
  const { currentUserId, dashboardItems, setDashboardItems } = useDashboardContext();
  const mutation = useFetcher<IMemberDto>(handleSubmitSuccess, method);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  function onSubmit(payload: IMemberDto) {
    const member: IMemberDto = { ...payload, createdBy: currentUserId };
    mutation.mutate({ payload: member, url: `${process.env.NEXT_PUBLIC_API}members` });
  }

  function handleSubmitSuccess(data: IMemberDto) {
    let toastTitle: string;

    if (method === 'POST') {
      toastTitle = 'Member succesfully created';
      setDashboardItems([...dashboardItems, data]);
      reset();
    } else {
      toastTitle = 'Member sucessfully updated';
      const index = dashboardItems.findIndex(item => item._id === data._id);
      const newItem = { ...data, status: dashboardItem.status };
      setDashboardItems([
        ...dashboardItems.slice(0, index),
        newItem,
        ...dashboardItems.slice(index + 1)
      ]);
      reset(newItem);
    }

    toast({
      ...toastOptions,
      status: 'success',
      title: toastTitle
    });
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <DrawerContainer
      onClose={handleClose}
      isOpen={isOpen}
      size="md"
      title={
        <HStack>
          <Icon as={FaUserPlus} />
          <Text>Add New Member</Text>
        </HStack>
      }
    >
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
