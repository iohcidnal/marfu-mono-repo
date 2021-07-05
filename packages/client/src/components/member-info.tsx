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
import { HamburgerIcon, AddIcon } from '@chakra-ui/icons';
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

const MemberInfoContext = React.createContext<IMemberInfoContextProps>(null);
const useMemberInfoContext = () => React.useContext(MemberInfoContext);

export default function MemberInfo({
  currentUserId,
  member,
  medications: initialMedications
}: IMemberInfoProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [medications, setMedications] = React.useState(initialMedications);
  const value = React.useMemo(
    () => ({
      currentUserId,
      member,
      medications,
      setMedications,
      isOpen,
      onOpen,
      onClose
    }),
    [currentUserId, isOpen, medications, member, onClose, onOpen]
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
  const { onOpen } = useMemberInfoContext();

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<AddIcon />} onClick={onOpen}>
            Add new medication
          </MenuItem>
        </MenuList>
      </Menu>
      <DrawerForm formMode="CREATE" />
    </>
  );
}

function DrawerForm({ formMode }: { formMode: 'CREATE' | 'UPDATE' }) {
  const { member, isOpen, onClose } = useMemberInfoContext();

  const {
    control,
    watch,
    register,
    handleSubmit,
    formState: { errors },
    formState
  } = useForm<IMedicationDto>({ mode: 'all' });

  const { fields, append } = useFieldArray({
    control,
    name: 'frequencies'
  });
  const watchInputs = watch('frequencies');
  const freqInputs = fields.map((field, index) => ({
    ...field,
    ...watchInputs[index]
  }));

  const { currentUserId } = useMemberInfoContext();
  const mutation = useMedicationService();

  async function onSubmit(payload: IMedicationDto) {
    const p = { ...payload, memberId: member._id, createdBy: currentUserId };
    mutation.mutate(p);
  }

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {formMode === 'CREATE' ? 'Add New Medication' : ''}
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
                leftIcon={<AddIcon />}
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
}

function MedicationCards() {
  const { medications } = useMemberInfoContext();

  return (
    <Wrap p="10" justify="center" alignContent="flex-start">
      {medications.map((medication, index) => (
        <LinkBox key={index} as="article" w="sm" p="4" borderWidth="1px" rounded="md" shadow="md">
          <Heading size="md" my="2">
            {medication.medicationName}
          </Heading>

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
              <Text>
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric'
                }).format(new Date(medication.startDate))}
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">End:</Text>
              <Text>
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric'
                }).format(new Date(medication.endDate))}
              </Text>
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

          <CardActions />
        </LinkBox>
      ))}
    </Wrap>
  );
}

function CardActions() {
  return (
    <HStack mt="4" justifyContent="space-between">
      <Button colorScheme="gray" w="full" size="sm" variant="outline">
        Update
      </Button>
      <Button colorScheme="gray" w="full" size="sm" variant="outline">
        Add logs
      </Button>
      <Button colorScheme="gray" w="full" size="sm" variant="outline">
        View logs
      </Button>
    </HStack>
  );
}

const toastOptions: UseToastOptions = {
  position: 'top-right',
  isClosable: true
};

function useMedicationService() {
  const { medications, setMedications, onClose } = useMemberInfoContext();
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
