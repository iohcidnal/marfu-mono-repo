import * as React from 'react';
import Link from 'next/link';
import {
  Alert,
  AlertIcon,
  Badge,
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
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Wrap
} from '@chakra-ui/react';
import { FaCapsules, FaEdit, FaTh, FaTrash, FaUserEdit, FaUserPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';

import { IDashboardDto, IMemberDto } from '@common';
import DrawerContainer from './common/drawer-container';
import useFetcher, { method } from './common/use-fetcher';
import { fetcher } from '../utils';
import toastOptions from './common/toast-options';
import ConfirmDialog from './common/confirm-dialog';
import getDateTimeAndTimeZone from './common/get-dt-tz';
import badgeStatus from './common/badge-status';
import SignOutPopover from './sign-out-popover';

export interface IDashboardProps {
  currentUserId: string;
}

interface IDashboardContextProps extends IDashboardProps {
  setDashboardItems: React.Dispatch<IDashboardDto[]>;
  dashboardItems: IDashboardDto[];
}

const DashboardContext = React.createContext<IDashboardContextProps>(null);
const useDashboardContext = () => React.useContext(DashboardContext);

export default function MembersDashboard({ currentUserId }: IDashboardProps) {
  const { data, isFetching, refetch } = useQuery(['members-dashboard'], fetchDashboardItems, {
    enabled: false,
    initialData: []
  });
  const [dashboardItems, setDashboardItems] = React.useState(data);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    setDashboardItems(data);
  }, [data]);

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
        <Skeleton isLoaded={!isFetching}>
          <Cards />
        </Skeleton>
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
          <HStack>
            <IconButton
              aria-label="Add new user"
              icon={<FaUserPlus />}
              variant="outline"
              onClick={() => formRef.current.onOpen()}
            />
            <SignOutPopover />
          </HStack>
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
            >
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">
                  {item.firstName} {item.lastName}
                  {badgeStatus[item.status] && (
                    <Badge ml="2" colorScheme={badgeStatus[item.status]} fontSize="md">
                      <Icon as={FaCapsules} />
                    </Badge>
                  )}
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
  const confirmDeleteRef = React.useRef<{ onOpen: () => void }>();

  return (
    <>
      <HStack justifyContent="flex-end">
        <Link href={`/member/${encodeURIComponent(dashboardItem._id)}`}>
          <IconButton aria-label="View medications" icon={<FaCapsules />} variant="outline" />
        </Link>
        <IconButton
          aria-label="Edit member"
          icon={<FaUserEdit />}
          variant="outline"
          onClick={() => formRef.current.onOpen()}
        />
        <IconButton
          aria-label="Delete member"
          icon={<FaTrash />}
          variant="outline"
          onClick={() => confirmDeleteRef.current.onOpen()}
        />
      </HStack>
      <AddEditMemberForm dashboardItem={dashboardItem} method="PUT" ref={formRef} />
      <ConfirmDeleteDialog dashboardItem={dashboardItem} ref={confirmDeleteRef} />
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
    reset
  } = useForm<IMemberDto>({
    mode: 'all',
    defaultValues: dashboardItem
  });
  const toast = useToast();
  const { currentUserId, dashboardItems, setDashboardItems } = useDashboardContext();
  const mutation = useFetcher<IMemberDto>(handleSubmitSuccess, method);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  React.useEffect(() => {
    reset(dashboardItem);
  }, [dashboardItem, reset]);

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
          <Icon as={method === 'POST' ? FaUserPlus : FaEdit} />
          <Text>{`${method === 'POST' ? 'Add New' : 'Edit'} Member`}</Text>
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

const ConfirmDeleteDialog = React.forwardRef(function ConfirmDeleteDialog(
  { dashboardItem }: { dashboardItem: IDashboardDto },
  ref: React.MutableRefObject<{
    onOpen: () => void;
  }>
) {
  const { dashboardItems, setDashboardItems } = useDashboardContext();
  const confirmDialogRef = React.useRef<{ onOpen: () => void }>();
  const toast = useToast();

  React.useImperativeHandle(ref, () => ({ onOpen: confirmDialogRef.current.onOpen }), []);

  const mutation = useFetcher<IDashboardDto>(handleDeleteSuccess, 'DELETE');

  function handleDeleteSuccess() {
    const index = dashboardItems.findIndex(item => item._id === dashboardItem._id);
    setDashboardItems([...dashboardItems.slice(0, index), ...dashboardItems.slice(index + 1)]);
    toast({
      ...toastOptions,
      title: `${dashboardItem.firstName} ${dashboardItem.lastName} successfuly deleted`,
      status: 'success'
    });
  }

  function handleDelete() {
    mutation.mutate({
      payload: undefined,
      url: `${process.env.NEXT_PUBLIC_API}members/${dashboardItem._id}`
    });
  }

  return (
    <ConfirmDialog
      ref={confirmDialogRef}
      handleConfirm={handleDelete}
      title={
        <HStack>
          <Icon as={FaTrash} />
          <Text>{`Delete ${dashboardItem.firstName} ${dashboardItem.lastName}?`}</Text>
        </HStack>
      }
      message="Are you sure you want to delete this member?"
    />
  );
});

async function fetchDashboardItems() {
  const { clientDateTime, timeZone } = getDateTimeAndTimeZone();
  const { data }: { data: IDashboardDto[] } = await fetcher({
    url: `${
      process.env.NEXT_PUBLIC_API
    }members/dashboard?dt=${clientDateTime.toISOString()}&tz=${timeZone}`
  });

  return data;
}
