import * as React from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
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
  Wrap
} from '@chakra-ui/react';
import { HamburgerIcon, AddIcon } from '@chakra-ui/icons';
import { useFieldArray, useForm } from 'react-hook-form';

import { IMemberDto, IMedicationDto, IFrequencyDto } from '@common';

interface IProps {
  member: IMemberDto;
  medications: IMedicationDto[];
}

export default function MemberInfo({ member, medications }: IProps) {
  return (
    <>
      {/* TODO: Display breadcrumbs */}
      <TitleBar title={`Medications for ${member.firstName} ${member.lastName}`} />
      <Wrap p="10" justify="center" alignContent="flex-start">
        {medications.map(medication => (
          <MedicationCard key={medication._id} medication={medication} />
        ))}
      </Wrap>
    </>
  );
}

function TitleBar({ title }: { title: string }) {
  return (
    <>
      <Box p="4" shadow="md">
        <HStack>
          <MedicationMenu />
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            {title}
          </Text>
        </HStack>
      </Box>
    </>
  );
}

function MedicationMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      <DrawerForm isOpen={isOpen} onClose={onClose} />
    </>
  );
}

interface IFreqInputs {
  freq: IFrequencyDto[];
}

function DrawerForm({ isOpen, onClose, medicationId = null }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState
  } = useForm<IMedicationDto>({ mode: 'all' });

  const { control, register: registerFreqInput, watch } = useForm<IFreqInputs>({ mode: 'all' });
  const { fields, append } = useFieldArray({
    control,
    name: 'freq'
  });
  const watchInputs = watch('freq');
  const freqInputs = fields.map((field, index) => ({
    ...field,
    ...watchInputs[index]
  }));

  function onSubmit(payload: IMedicationDto) {
    console.log('medication :>> ', payload);
    console.log('freqInputs :>> ', freqInputs);
    // TODO: Merge freqInputs into medication before calling the API
  }

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {!medicationId ? 'Add New Medication' : ''}
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

              <FrequencyInput inputs={freqInputs} append={append} register={registerFreqInput} />

              <HStack pt="4">
                <Button colorScheme="blue" w="full" size="lg" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="blue" w="full" size="lg">
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

function FrequencyInput({ inputs, append, register }) {
  return (
    <>
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
        {inputs.map((input, index) => {
          return (
            <FormControl
              key={input.id}
              id={`freq.${index}.dateTime`}
              isRequired
              isInvalid={!input.dateTime}
            >
              <FormLabel>{`Freq ${index + 1}`}</FormLabel>
              <Input type="time" size="lg" {...register(`freq.${index}.dateTime`)} />
              {!input.dateTime && (
                <FormErrorMessage>{`Freq ${index + 1} is required.`}</FormErrorMessage>
              )}
            </FormControl>
          );
        })}
      </Stack>
    </>
  );
}

function MedicationCard({ medication }: { medication: IMedicationDto }) {
  return (
    <LinkBox as="article" w="sm" p="4" borderWidth="1px" rounded="md" shadow="md">
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
          {medication.frequencies.map(freq => (
            <Text key={freq._id}>
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
