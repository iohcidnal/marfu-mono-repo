import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  LinkBox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Wrap
} from '@chakra-ui/react';
import {
  FaCapsules,
  FaChevronLeft,
  FaEdit,
  FaEllipsisV,
  FaList,
  FaNotesMedical,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQuery } from 'react-query';

import {
  IMemberDto,
  IMedicationDto,
  IFrequencyDto,
  IFrequencyLogDto,
  IMedicationPostPutPayload
} from '@common';
import DrawerContainer from './common/drawer-container';
import useFetcher, { method } from './common/use-fetcher';
import toastOptions from './common/toast-options';
import { fetcher } from '../utils';
import ConfirmDialog from './common/confirm-dialog';
import getDateTimeAndTimeZone from './common/get-dt-tz';

export interface IMemberInfoProps {
  currentUserId: string;
  member: IMemberDto;
}

interface IMemberInfoContextProps extends IMemberInfoProps {
  setMedications: React.Dispatch<IMedicationDto[]>;
  medications: IMedicationDto[];
}

const MemberInfoContext = React.createContext<IMemberInfoContextProps>(null);
const useMemberInfoContext = () => React.useContext(MemberInfoContext);

export default function MemberInfo({ currentUserId, member }: IMemberInfoProps) {
  const { data, isFetching, refetch } = useQuery(
    ['member-info', member._id],
    () => fetchMedications(member._id),
    {
      enabled: false,
      initialData: []
    }
  );
  const [medications, setMedications] = React.useState(data);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    setMedications(data);
  }, [data]);

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
      <TitleBar />
      <Skeleton isLoaded={!isFetching}>
        {medications.length === 0 && (
          <Alert status="info" mt="2">
            <AlertIcon />
            There are no medications yet. Select `Add new medication` from the menu to create one.
          </Alert>
        )}
        <MedicationCards />
      </Skeleton>
    </MemberInfoContext.Provider>
  );
}

function TitleBar() {
  const { member } = useMemberInfoContext();
  const formRef = React.useRef<{ onOpen: () => void }>();

  return (
    <>
      <Box p="4" shadow="md">
        <HStack justifyContent="space-between">
          <HStack>
            <IconButton
              aria-label="Back to dashboard"
              as="a"
              href="/dashboard"
              icon={<FaChevronLeft />}
              variant="outline"
            />
            <Icon as={FaCapsules} />
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">
              {`Medications for ${member.firstName} ${member.lastName}`}
            </Text>
          </HStack>
          <IconButton
            aria-label="Add new medication"
            icon={<FaPlus />}
            onClick={() => formRef.current.onOpen()}
            variant="outline"
          />
        </HStack>
      </Box>
      <AddEditMedicationForm method="POST" ref={formRef} />
    </>
  );
}

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

  const mutation = useFetcher<IMedicationDto, IMedicationPostPutPayload>(
    handleSuccessSubmit,
    method
  );
  const title = (
    <HStack>
      {method === 'POST' ? (
        <>
          <Icon as={FaPlus} />
          <Text>Add New Medication</Text>
        </>
      ) : (
        <>
          <Icon as={FaEdit} />
          <Text>Edit Medication</Text>
        </>
      )}
    </HStack>
  );

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  React.useEffect(() => {
    reset(medication);
  }, [medication, reset]);

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

    const { clientDateTime, timeZone } = getDateTimeAndTimeZone();
    mutation.mutate({
      payload: { medication, clientDateTime: clientDateTime.toString(), timeZone },
      url: `${process.env.NEXT_PUBLIC_API}medications`
    });
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
    if (method === 'POST') {
      // Created
      reset();
      setMedications([...medications, data]);
      toast({
        ...toastOptions,
        title: 'Medication successfuly created',
        status: 'success'
      });
    } else {
      // Updated
      reset(data);
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
    <DrawerContainer onClose={handleClose} isOpen={isOpen} title={title} size="md">
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
            {errors.startDate && <FormErrorMessage>{errors.startDate.message}</FormErrorMessage>}
          </FormControl>
          <FormControl id="endDate">
            <FormLabel>End date:</FormLabel>
            <Input type="date" size="lg" {...register('endDate')} />
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
                      variant="outline"
                    />
                  </HStack>
                  {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
                </FormControl>
              );
            })}
          </Stack>

          <HStack pt="4">
            <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={handleClose}>
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
    </DrawerContainer>
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
            {medication.endDate && (
              <HStack>
                <Text fontWeight="semibold">End:</Text>
                <Text>{toDate(medication.endDate).toLocaleDateString()}</Text>
              </HStack>
            )}
          </HStack>

          <HStack>
            <Text fontWeight="semibold">Note:</Text>
            <Text>{medication.note}</Text>
          </HStack>

          <HStack mt="2">
            <Text fontWeight="semibold">Schedule:</Text>
            <HStack>
              {medication.frequencies.map(freq => (
                <Text key={freq._id}>
                  {freq.time}
                  {freq.status !== 'DONE' && (
                    <Badge ml="1" colorScheme={freq.status === 'PAST_DUE' ? 'red' : 'green'}>
                      <Icon as={FaCapsules} />
                    </Badge>
                  )}
                </Text>
              ))}
            </HStack>
          </HStack>
        </LinkBox>
      ))}
    </Wrap>
  );
}

function CardActions({ medication }: { medication: IMedicationDto }) {
  const addEditFormMedicationRef = React.useRef<{ onOpen: () => void }>();
  const confirmDeleteRef = React.useRef<{ onOpen: () => void }>();
  const addLogFormRef = React.useRef<{ onOpen: () => void }>();
  const logsHistoryRef = React.useRef<{ onOpen: () => void }>();

  return (
    <HStack>
      <IconButton
        aria-label="Add log"
        icon={<FaNotesMedical />}
        onClick={() => addLogFormRef.current.onOpen()}
      />
      <Menu>
        <MenuButton as={IconButton} aria-label="Options" icon={<FaEllipsisV />} variant="outline" />
        <MenuList>
          <MenuItem icon={<FaEdit />} onClick={() => addEditFormMedicationRef.current.onOpen()}>
            Edit medication
          </MenuItem>
          <MenuItem icon={<FaTrash />} onClick={() => confirmDeleteRef.current.onOpen()}>
            Delete medication
          </MenuItem>
          <MenuItem icon={<FaList />} onClick={() => logsHistoryRef.current.onOpen()}>
            Logs History
          </MenuItem>
        </MenuList>
      </Menu>
      <AddEditMedicationForm medication={medication} method="PUT" ref={addEditFormMedicationRef} />
      <ConfirmDeleteDialog medication={medication} ref={confirmDeleteRef} />
      <AddLogForm medication={medication} ref={addLogFormRef} />
      <LogsHistory medication={medication} ref={logsHistoryRef} />
    </HStack>
  );
}

const ConfirmDeleteDialog = React.forwardRef(function ConfirmDeleteDialog(
  { medication }: { medication: IMedicationDto },
  ref: React.MutableRefObject<{
    onOpen: () => void;
  }>
) {
  const { setMedications, medications } = useMemberInfoContext();
  const confirmDialogRef = React.useRef<{ onOpen: () => void }>();
  const toast = useToast();

  React.useImperativeHandle(ref, () => ({ onOpen: confirmDialogRef.current.onOpen }), []);

  const mutation = useFetcher<IMedicationDto>(handleDeleteSuccess, 'DELETE');

  function handleDeleteSuccess() {
    const index = medications.findIndex(med => med._id === medication._id);
    setMedications([...medications.slice(0, index), ...medications.slice(index + 1)]);
    toast({
      ...toastOptions,
      title: `${medication.medicationName} successfuly deleted`,
      status: 'success'
    });
  }

  function handleDelete() {
    mutation.mutate({
      payload: undefined,
      url: `${process.env.NEXT_PUBLIC_API}medications/${medication._id}`
    });
  }

  return (
    <ConfirmDialog
      ref={confirmDialogRef}
      handleConfirm={handleDelete}
      title={
        <HStack>
          <Icon as={FaTrash} />
          <Text>{`Delete ${medication.medicationName}?`}</Text>
        </HStack>
      }
      message="Are you sure you want to delete this medication?"
    />
  );
});

const AddLogForm = React.forwardRef(function AddLogForm(
  { medication }: { medication: IMedicationDto },
  ref
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
    reset
  } = useForm<IFrequencyLogDto>({
    mode: 'all'
  });
  const toast = useToast();
  const [selectedFrequencyId, setSelectedFrequencyId] = React.useState<string>();
  const { currentUserId } = useMemberInfoContext();
  const mutation = useFetcher<IFrequencyLogDto>(handleSubmitSuccess, 'POST');

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  const getDefaultValues = React.useCallback(() => {
    return {
      administeredDate: new Date().toISOString().split('T')[0],
      administeredTime: `${new Date()
        .getHours()
        .toString()
        .padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
      note: '',
      frequencyId: null,
      administeredBy: currentUserId
    };
  }, [currentUserId]);

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [currentUserId, getDefaultValues, reset]);

  function onSubmit(payload: IFrequencyLogDto) {
    if (!selectedFrequencyId) {
      toast({
        ...toastOptions,
        status: 'error',
        title: 'Not able to save',
        description: 'Select a time for the log to apply to.'
      });
      return;
    }

    const freqLog: IFrequencyLogDto = {
      ...payload,
      frequencyId: selectedFrequencyId
    };

    mutation.mutate({ payload: freqLog, url: `${process.env.NEXT_PUBLIC_API}frequency-logs` });
  }

  function handleSubmitSuccess() {
    toast({
      ...toastOptions,
      status: 'success',
      title: 'Log created successfully'
    });
    handleClose();
  }

  function handleClose() {
    reset(getDefaultValues());
    onClose();
  }

  return (
    <DrawerContainer
      onClose={handleClose}
      isOpen={isOpen}
      size="md"
      title={
        <HStack>
          <Icon as={FaNotesMedical} />
          <Text>{`Add Log for ${medication.medicationName}`}</Text>
        </HStack>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <RadioGroup
            onChange={setSelectedFrequencyId}
            value={selectedFrequencyId}
            size="lg"
            mb="4"
          >
            <FormLabel>Apply log to:</FormLabel>
            <HStack spacing="4">
              {medication.frequencies.map(freq => (
                <Radio key={freq._id} value={freq._id}>
                  {freq.time}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>
          <FormControl id="administeredDate" isRequired isInvalid={!!errors.administeredDate}>
            <FormLabel>Administered Date:</FormLabel>
            <Input
              type="date"
              size="lg"
              {...register('administeredDate', {
                required: 'Administered date is required.'
              })}
            />
            {errors.administeredDate && (
              <FormErrorMessage>{errors.administeredDate.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="administeredTime" isRequired isInvalid={!!errors.administeredTime}>
            <FormLabel>Administered Time:</FormLabel>
            <Input
              type="time"
              size="lg"
              {...register('administeredTime', {
                required: 'Administered time is required.'
              })}
            />
            {errors.administeredTime && (
              <FormErrorMessage>{errors.administeredTime.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="note">
            <FormLabel>Note</FormLabel>
            <Input type="text" size="lg" {...register('note')} />
          </FormControl>
          <HStack pt="4">
            <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={formState.isSubmitting}
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

const LogsHistory = React.forwardRef(function LogsHistory(
  { medication }: { medication: IMedicationDto },
  ref
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [selectedFrequencyId, setSelectedFrequencyId] = React.useState<string>();

  const { data, isFetching, refetch } = useQuery(
    ['logs-history', selectedFrequencyId],
    async () => {
      const { data }: { data: IFrequencyLogDto[] } = await fetcher({
        url: `${process.env.NEXT_PUBLIC_API}frequency-logs/${selectedFrequencyId}`
      });
      return data;
    },
    { enabled: false, initialData: [] }
  );

  const [logs, setLogs] = React.useState<IFrequencyLogDto[]>([]);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  React.useEffect(() => {
    setLogs(data);
  }, [data]);

  React.useEffect(() => {
    if (selectedFrequencyId) refetch();
  }, [refetch, selectedFrequencyId]);

  function handleClose() {
    setLogs([]);
    setSelectedFrequencyId(null);
    onClose();
  }

  return (
    <DrawerContainer
      onClose={handleClose}
      isOpen={isOpen}
      size="full"
      title={
        <HStack>
          <Icon as={FaList} />
          <Text>{`Logs for ${medication.medicationName}`}</Text>
        </HStack>
      }
      footer={
        <Button
          colorScheme="blue"
          w="full"
          size="lg"
          variant="outline"
          isLoading={isFetching}
          onClick={handleClose}
        >
          Close
        </Button>
      }
    >
      <Stack>
        <RadioGroup onChange={setSelectedFrequencyId} value={selectedFrequencyId} size="lg" mb="4">
          <FormLabel>Select time:</FormLabel>
          <HStack spacing="4">
            {medication.frequencies.map(freq => (
              <Radio key={freq._id} value={freq._id}>
                {freq.time}
              </Radio>
            ))}
          </HStack>
        </RadioGroup>
        <Skeleton isLoaded={!isFetching}>
          {logs.length > 0 && (
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Administered Date/Time</Th>
                  <Th>By</Th>
                  <Th>Note</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map(log => (
                  <Tr key={log._id} justifyContent="space-between">
                    <Td>
                      {`${toDate(log.administeredDate).toLocaleDateString()} ${
                        log.administeredTime
                      }`}
                    </Td>
                    <Td>
                      {`${log.administeredBy['firstName']} ${log.administeredBy['lastName']}`}
                    </Td>
                    <Td>{log.note}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Skeleton>
      </Stack>
    </DrawerContainer>
  );
});

function toDate(dateAsString: string): Date {
  const [yyyy, mm, dd] = dateAsString.split('-');
  return new Date(`${mm}/${dd}/${yyyy}`);
}

async function fetchMedications(memberId: string): Promise<IMedicationDto[]> {
  const { clientDateTime, timeZone } = getDateTimeAndTimeZone();
  const { data }: { data: IMedicationDto[] } = await fetcher({
    url: `${process.env.NEXT_PUBLIC_API}medications/members/${memberId}?dt=${clientDateTime}&tz=${timeZone}`
  });

  return data;
}
