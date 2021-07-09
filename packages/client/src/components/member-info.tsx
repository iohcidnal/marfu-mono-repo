import * as React from 'react';
import {
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
  FaEllipsisH,
  FaList,
  FaNotesMedical,
  FaPlus,
  FaRegEdit,
  FaTrash
} from 'react-icons/fa';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { IMemberDto, IMedicationDto } from '@common';
import { fetcher } from '../utils';

interface IMemberInfoProps {
  currentUserId: string;
  member: IMemberDto;
  medications: IMedicationDto[];
}

interface IMemberInfoContextProps extends IMemberInfoProps {
  setMedications: React.Dispatch<IMedicationDto[]>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
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
      <DrawerForm formMode="CREATE" ref={formRef} />
    </>
  );
}

const DrawerForm = React.forwardRef(function DrawerForm(
  { formMode, defaultValues }: { formMode: 'CREATE' | 'UPDATE'; defaultValues?: IMedicationDto },
  ref
) {
  const { currentUserId, member } = useMemberInfoContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();
  const {
    control,
    watch,
    register,
    handleSubmit,
    formState: { errors },
    formState
  } = useForm<IMedicationDto>({
    mode: 'all',
    defaultValues
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

  const mutation = useMedicationService(onClose);

  React.useImperativeHandle(ref, () => ({ onOpen }), [onOpen]);

  async function onSubmit(payload: IMedicationDto) {
    if (freqInputs.length === 0 || freqInputs.some(freq => isNaN(freq.dateTime.valueOf()))) {
      toast({
        ...toastOptions,
        status: 'error',
        title: 'Not able to save',
        description: 'Frequency is required.'
      });
      return;
    }

    const medication = { ...payload, memberId: member._id, createdBy: currentUserId };
    console.log('medication :>> ', medication);
    mutation.mutate(medication);
  }

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {formMode === 'CREATE' ? 'Add New Medication' : 'Edit Medication'}
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
                    required: 'Start date is required.',
                    setValueAs: value => value && new Date(value).toISOString()
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
                    required: 'End date is required.',
                    setValueAs: value => value && new Date(value).toISOString()
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
                onClick={() => append({ dateTime: null })}
                colorScheme="gray"
                w="full"
                variant="outline"
              >
                Add frequency
              </Button>
              <Stack>
                {freqInputs.map((input, index) => {
                  const inputError =
                    errors.frequencies && errors.frequencies[index]?.dateTime.message;
                  return (
                    <FormControl
                      key={input.id}
                      id={`frequencies[${index}].dateTime`}
                      isRequired
                      isInvalid={!!inputError}
                    >
                      <FormLabel>{`Freq ${index + 1}`}</FormLabel>
                      <Input
                        type="time"
                        size="lg"
                        {...register(`frequencies.${index}.dateTime`, {
                          required: `Freq ${index + 1} is required.`,
                          setValueAs: value => {
                            const [hh, mm] = value.split(':');
                            const date = new Date();
                            date.setHours(Number(hh));
                            date.setMinutes(Number(mm), 0);
                            return date;
                          }
                        })}
                      />
                      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
                    </FormControl>
                  );
                })}
              </Stack>

              <HStack pt="4">
                <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  disabled={!formState.isValid}
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
              <Text>{formatDateFromISO(medication.startDate)}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">End:</Text>
              <Text>{formatDateFromISO(medication.endDate)}</Text>
            </HStack>
          </HStack>

          <HStack>
            <Text fontWeight="semibold">Note:</Text>
            <Text>{medication.note}</Text>
          </HStack>

          <HStack mt="2">
            <Text fontWeight="semibold">Schedule:</Text>
            <HStack>
              {medication.frequencies.map((freq, index) => (
                <Text key={index}>
                  {new Intl.DateTimeFormat('en-US', {
                    timeStyle: 'short',
                    hour12: false
                  }).format(new Date(freq.dateTime))}
                </Text>
              ))}
            </HStack>
          </HStack>
        </LinkBox>
      ))}
    </Wrap>
  );
}

function CardActions({ medication }) {
  const formRef = React.useRef<{ onOpen: () => void }>();
  const defaultValues = {
    ...medication,
    startDate: new Date(medication.startDate).toISOString().split('T')[0],
    endDate: new Date(medication.endDate).toISOString().split('T')[0]
  };

  return (
    <>
      <Menu>
        <MenuButton as={IconButton} aria-label="Options" icon={<FaEllipsisH />} variant="outline" />
        <MenuList>
          <MenuItem icon={<FaRegEdit />} onClick={() => formRef.current.onOpen()}>
            Edit medication
          </MenuItem>
          <MenuItem icon={<FaTrash />}>Delete medication</MenuItem>
          <MenuItem icon={<FaList />}>View logs</MenuItem>
          <MenuItem icon={<FaNotesMedical />}>Add logs</MenuItem>
        </MenuList>
      </Menu>
      <DrawerForm defaultValues={defaultValues} formMode="UPDATE" ref={formRef} />
    </>
  );
}

function useMedicationService(onClose: () => void) {
  const { medications, setMedications } = useMemberInfoContext();
  const toast = useToast();

  const mutation = useMutation(
    async (payload: IMedicationDto) => {
      const result = await fetcher({
        url: `${process.env.NEXT_PUBLIC_API}medications`,
        method: 'POST',
        payload
      });

      return {
        ...result,
        payload
      };
    },
    {
      onSuccess: ({ status, payload }) => {
        if (status === 201) {
          setMedications([...medications, payload]);
          onClose();
          toast({
            ...toastOptions,
            title: 'Medication successfuly created',
            status: 'success'
          });
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

function formatDateFromISO(isoDate: Date): string {
  const [yyyy, mm, dd] = isoDate.toString().split('T')[0].split('-');
  return new Date(`${mm}/${dd}/${yyyy}`).toLocaleDateString();
}
