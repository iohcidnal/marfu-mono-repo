import * as React from 'react';
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
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
  UseToastOptions,
  Wrap
} from '@chakra-ui/react';
import {
  FaBars,
  FaEllipsisV,
  FaList,
  FaNotesMedical,
  FaPlus,
  FaRegEdit,
  FaTrash
} from 'react-icons/fa';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { IMemberDto, IMedicationDto, IFrequencyDto } from '@common';
import { fetcher } from '../utils';

interface IMemberInfoProps {
  currentUserId: string;
  member: IMemberDto;
  medications: IMedicationDto[];
}

interface IMemberInfoContextProps extends IMemberInfoProps {
  setMedications: React.Dispatch<IMedicationDto[]>;
}

const toastOptions: UseToastOptions = {
  position: 'top-right',
  isClosable: true
};
const MemberInfoContext = React.createContext<IMemberInfoContextProps>(null);
const useMemberInfoContext = () => React.useContext(MemberInfoContext);

export default function MemberInfo({
  currentUserId,
  member,
  medications: initialMedications
}: IMemberInfoProps) {
  const [medications, setMedications] = React.useState(initialMedications);
  const value = React.useMemo(
    () => ({
      currentUserId,
      member,
      medications,
      setMedications
    }),
    [currentUserId, medications, member]
  );

  return (
    <MemberInfoContext.Provider value={value}>
      {/* TODO: Display breadcrumbs */}
      <TitleBar />
      {medications.length === 0 && (
        <Alert status="info" mt="2">
          <AlertIcon />
          There are no medications yet. Select `Add new medication` from the menu to create one.
        </Alert>
      )}
      <MedicationCards />
    </MemberInfoContext.Provider>
  );
}

function TitleBar() {
  const { member } = useMemberInfoContext();

  return (
    <>
      <Box p="4" shadow="md">
        <HStack>
          <MedicationMenu />
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            {`Medications for ${member.firstName} ${member.lastName}`}
          </Text>
        </HStack>
      </Box>
    </>
  );
}

function MedicationMenu() {
  const formRef = React.useRef<{ onOpen: () => void }>();

  return (
    <>
      <Menu>
        <MenuButton as={IconButton} aria-label="Options" icon={<FaBars />} variant="outline" />
        <MenuList>
          <MenuItem icon={<FaPlus />} onClick={() => formRef.current.onOpen()}>
            Add new medication
          </MenuItem>
        </MenuList>
      </Menu>
      <AddEditMedicationForm method="POST" ref={formRef} />
    </>
  );
}

type method = 'PUT' | 'POST' | 'DELETE';

const AddEditMedicationForm = React.forwardRef(function AddEditMedicationForm(
  {
    method,
    medication
  }: {
    method: method;
    medication?: IMedicationDto;
  },
  ref
) {
  const { currentUserId, member, setMedications, medications } = useMemberInfoContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();
  const {
    control,
    watch,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<IMedicationDto>({
    mode: 'all',
    defaultValues: medication
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'frequencies'
  });
  const watchInputs = watch('frequencies');
  const freqInputs = fields.map((field, index) => ({
    ...field,
    ...watchInputs[index]
  }));

  const mutation = useMedicationService(handleSuccessSubmit, method);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  async function onSubmit(payload: IMedicationDto) {
    if (!areFreqInputsValid()) {
      toast({
        ...toastOptions,
        status: 'error',
        title: 'Not able to save',
        description: 'Time is required.'
      });
      return;
    }

    const medication: IMedicationDto = {
      ...payload,
      frequencies: freqInputs
    };

    if (method === 'POST') {
      medication.memberId = member._id;
      medication.createdBy = currentUserId;
    }

    mutation.mutate({ payload: medication, url: `${process.env.NEXT_PUBLIC_API}medications` });
  }

  function areFreqInputsValid(): boolean {
    // How does react-form-hook do validation on a field array?
    return (
      freqInputs.length > 0 &&
      freqInputs.every(freq => freq.time) &&
      freqInputs.some(freq => freq.status !== 'DELETE')
    );
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSuccessSubmit(data: IMedicationDto) {
    reset(data);

    if (method === 'POST') {
      // Created
      setMedications([...medications, data]);
      toast({
        ...toastOptions,
        title: 'Medication successfuly created',
        status: 'success'
      });
    } else {
      // Updated
      const index = medications.findIndex(med => med._id === data._id);
      setMedications([...medications.slice(0, index), data, ...medications.slice(index + 1)]);
      toast({
        ...toastOptions,
        title: 'Medication successfuly updated',
        status: 'success'
      });
    }

    onClose();
  }

  return (
    <Drawer onClose={handleClose} isOpen={isOpen} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {method === 'POST' ? 'Add New Medication' : 'Edit Medication'}
        </DrawerHeader>
        <DrawerBody>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <FormControl id="medicationName" isRequired isInvalid={!!errors.medicationName}>
                <FormLabel>Medication name</FormLabel>
                <Input
                  type="text"
                  size="lg"
                  {...register('medicationName', {
                    required: 'Medication name is required.'
                  })}
                />
                {errors.medicationName && (
                  <FormErrorMessage>{errors.medicationName.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="dosage" isRequired isInvalid={!!errors.dosage}>
                <FormLabel>Dosage</FormLabel>
                <Input
                  type="text"
                  size="lg"
                  {...register('dosage', {
                    required: 'Dosage is required.'
                  })}
                />
                {errors.dosage && <FormErrorMessage>{errors.dosage.message}</FormErrorMessage>}
              </FormControl>
              <FormControl id="route" isRequired isInvalid={!!errors.route}>
                <FormLabel>Route</FormLabel>
                <Input
                  type="text"
                  size="lg"
                  {...register('route', {
                    required: 'Route is required.'
                  })}
                />
                {errors.route && <FormErrorMessage>{errors.route.message}</FormErrorMessage>}
              </FormControl>
              <FormControl id="startDate" isRequired isInvalid={!!errors.startDate}>
                <FormLabel>Start date:</FormLabel>
                <Input
                  type="date"
                  size="lg"
                  {...register('startDate', {
                    required: 'Start date is required.'
                  })}
                />
                {errors.startDate && (
                  <FormErrorMessage>{errors.startDate.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="endDate" isRequired isInvalid={!!errors.endDate}>
                <FormLabel>End date:</FormLabel>
                <Input
                  type="date"
                  size="lg"
                  {...register('endDate', {
                    required: 'End date is required.'
                  })}
                />
                {errors.endDate && <FormErrorMessage>{errors.endDate.message}</FormErrorMessage>}
              </FormControl>
              <FormControl id="note">
                <FormLabel>Note</FormLabel>
                <Input type="text" size="lg" {...register('note')} />
              </FormControl>

              <Button
                leftIcon={<FaPlus />}
                onClick={() => append({ time: null, status: 'NEW', medicationId: medication?._id })}
                colorScheme="blue"
                w="full"
              >
                Add Time
              </Button>
              <Stack>
                {freqInputs.map((input: IFrequencyDto, index) => {
                  if (input.status === 'DELETE') return null;

                  const inputError = errors.frequencies && errors.frequencies[index]?.time.message;
                  return (
                    <FormControl
                      key={index}
                      id={`frequencies[${index}].time`}
                      isRequired
                      isInvalid={!!inputError}
                    >
                      <HStack>
                        <Input
                          type="time"
                          size="lg"
                          {...register(`frequencies.${index}.time`, {
                            required: `Time is required.`
                          })}
                        />
                        <IconButton
                          aria-label="Delete time"
                          icon={<FaTrash />}
                          onClick={() => setValue(`frequencies.${index}.status`, 'DELETE')}
                        />
                      </HStack>
                      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
                    </FormControl>
                  );
                })}
              </Stack>

              <HStack pt="4">
                <Button
                  colorScheme="blue"
                  w="full"
                  size="lg"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  isLoading={mutation.isLoading}
                  size="lg"
                  type="submit"
                  w="full"
                >
                  Save
                </Button>
              </HStack>
            </Stack>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

function MedicationCards() {
  const { medications } = useMemberInfoContext();

  return (
    <Wrap p="10" justify="center" alignContent="flex-start">
      {medications.map((medication, index) => (
        <LinkBox key={index} as="article" w="sm" p="4" borderWidth="1px" rounded="md" shadow="md">
          <HStack justifyContent="space-between">
            <Heading size="md" my="2">
              {medication.medicationName}
            </Heading>
            <CardActions medication={medication} />
          </HStack>

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
              <Text>{toDate(medication.startDate).toLocaleDateString()}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">End:</Text>
              <Text>{toDate(medication.endDate).toLocaleDateString()}</Text>
            </HStack>
          </HStack>

          <HStack>
            <Text fontWeight="semibold">Note:</Text>
            <Text>{medication.note}</Text>
          </HStack>

          <HStack mt="2">
            <Text fontWeight="semibold">Schedule:</Text>
            <HStack>
              {medication.frequencies.map(freq => (
                <Text key={freq._id}>{freq.time}</Text>
              ))}
            </HStack>
          </HStack>
        </LinkBox>
      ))}
    </Wrap>
  );
}

function CardActions({ medication }: { medication: IMedicationDto }) {
  const formRef = React.useRef<{ onOpen: () => void }>();
  const confirmDeleteRef = React.useRef<{ onOpen: () => void }>();

  return (
    <HStack>
      <IconButton aria-label="Add log" icon={<FaNotesMedical />} colorScheme="blue" />
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          backgroundColor="gray.200"
          icon={<FaEllipsisV />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<FaRegEdit />} onClick={() => formRef.current.onOpen()}>
            Edit medication
          </MenuItem>
          <MenuItem icon={<FaTrash />} onClick={() => confirmDeleteRef.current.onOpen()}>
            Delete medication
          </MenuItem>
          <MenuItem icon={<FaList />}>Log History</MenuItem>
        </MenuList>
      </Menu>
      <AddEditMedicationForm medication={medication} method="PUT" ref={formRef} />
      <ConfirmDeleteDialog medication={medication} ref={confirmDeleteRef} />
    </HStack>
  );
}

const ConfirmDeleteDialog = React.forwardRef(function ConfirmDeleteDialog(
  { medication }: { medication: IMedicationDto },
  ref
) {
  const { setMedications, medications } = useMemberInfoContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  const mutation = useMedicationService(handleDeleteSuccess, 'DELETE');

  function handleDeleteSuccess() {
    const index = medications.findIndex(med => med._id === medication._id);
    setMedications([...medications.slice(0, index), ...medications.slice(index + 1)]);
    toast({
      ...toastOptions,
      title: `${medication.medicationName} successfuly deleted`,
      status: 'success'
    });
  }

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>{`Delete ${medication.medicationName}?`}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>Are you sure you want to delete this medication?</AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            No
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() =>
              mutation.mutate({
                payload: undefined,
                url: `${process.env.NEXT_PUBLIC_API}medications/${medication._id}`
              })
            }
          >
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

function useMedicationService(onSuccessSubmit: (data: IMedicationDto) => void, method: method) {
  const toast = useToast();

  const mutation = useMutation(
    ({ payload, url }: { payload: IMedicationDto; url: string }) => {
      return fetcher({
        url,
        method,
        payload
      });
    },
    {
      onSuccess: ({ status, data }: { status: number; data: IMedicationDto }) => {
        if ([200, 201].includes(status)) {
          onSuccessSubmit(data);
        } else {
          toast({ ...toastOptions, title: 'An error occured', status: 'error' });
        }
      },
      onError: () => {
        toast({ ...toastOptions, title: 'An error occured', status: 'error' });
      }
    }
  );

  return mutation;
}

function toDate(dateAsString: string): Date {
  const [yyyy, mm, dd] = dateAsString.split('-');
  return new Date(`${mm}/${dd}/${yyyy}`);
}
