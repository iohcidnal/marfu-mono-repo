import mongoose from 'mongoose';
import {
  IMedicationDto,
  IFrequencyDto,
  IFrequencyLogDto,
  MedicationStatus,
  IMedicationPostPutPayload
} from '@common';

import medicationModel from './medication.model';
import freqModel from './frequency.model';
import getFrequencyStatus from './status-handler';
import frequencyLogModel from '../frequency-log/frequency-log.model';

/* istanbul ignore next */
/* mongodbMemoryServerOptions does not support transactions */
export async function create(payload: IMedicationPostPutPayload): Promise<IMedicationDto> {
  const {
    medication,
    medication: { frequencies },
    clientDateTime,
    timeZone
  } = payload;

  const session = await medicationModel.startSession();
  session.startTransaction();

  // Create frequency IDs
  const freqIds = Array(frequencies?.length)
    .fill(null)
    .map(() => mongoose.Types.ObjectId().toHexString());
  // Create medication with frequency IDs
  const medicationDoc = (
    await medicationModel.create([{ ...medication, frequencies: freqIds }], { session: session })
  )[0];
  // Create frequencies
  const frequenciesDto = frequencies?.map((freq, index) => ({
    ...freq,
    _id: freqIds[index],
    medicationId: medicationDoc._id
  })) as IFrequencyDto[];
  await freqModel.create(frequenciesDto, { session: session });

  await session.commitTransaction();
  session.endSession();

  const medicationDto = medicationModel.toDto(medicationDoc, frequenciesDto);
  const result = await getFrequenciesStatusByMedication(medicationDto, clientDateTime, timeZone);

  return result;
}

export async function getAllByMemberId(
  memberId: string,
  clientDateTime: string,
  timeZone: string
): Promise<IMedicationDto[]> {
  const currentDate = getDateOnly(clientDateTime);
  const currentDateTime = new Date(clientDateTime);

  const medications = (
    await medicationModel.find({ memberId }).lean().populate('frequencies')
  ).filter(filterMeds(currentDate));

  const freqLogs = await getFrequencyLogs(medications, currentDate);
  const getFrequencyStatusFn = getFrequencyStatus.bind(
    null,
    currentDateTime.toString(),
    timeZone,
    freqLogs
  );

  const result: IMedicationDto[] = medications.map(med => {
    const frequencies = med.frequencies?.map(freq => {
      const freqStatus = getFrequencyStatusFn(freq);
      return { ...freq, status: freqStatus };
    });

    const frequenciesStatus = frequencies?.map(freq => freq.status) as MedicationStatus[];
    const medicationStatus = getMedicationStatus(frequenciesStatus);

    return {
      _id: med._id,
      memberId: med.memberId,
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequencies: frequencies,
      route: med.route,
      note: med.note,
      startDate: med.startDate,
      endDate: med.endDate,
      status: medicationStatus,
      createdBy: med.createdBy
    };
  });

  return result;
}

export async function update(payload: IMedicationPostPutPayload): Promise<IMedicationDto | null> {
  const { medication, clientDateTime, timeZone } = payload;

  // Update frequencies
  for await (const freq of medication.frequencies ?? []) {
    switch (freq.status) {
      case 'NEW': {
        freq._id = mongoose.Types.ObjectId().toHexString();
        await freqModel.create(freq);
        break;
      }
      case 'DELETE':
        await freqModel.findByIdAndDelete(freq._id).exec();
        break;
      default:
        // updateOne updates one document in the database without returning it
        await freqModel.updateOne({ _id: freq._id }, { time: freq.time }).exec();
    }
  }
  // Make sure we update frequency references in medication after updating frequencies above.
  medication.frequencies = medication.frequencies?.filter(freq => freq.status !== 'DELETE');

  const medicationDoc = await medicationModel
    .findByIdAndUpdate(medication._id, medication, { lean: true, new: true })
    .populate('frequencies');
  const result = await getFrequenciesStatusByMedication(
    medicationDoc as IMedicationDto,
    clientDateTime,
    timeZone
  );

  return result;
}

export async function deleteById(id: string): Promise<IMedicationDto | null> {
  const result = await medicationModel.findOneAndDelete({ _id: id });
  return result;
}

async function getFrequencyLogs(
  docs: IMedicationDto[],
  currentDate: Date
): Promise<IFrequencyLogDto[]> {
  // Get all frequency IDs to retrieve
  const frequencyIds = docs.flatMap(doc =>
    doc.frequencies?.map(freq => freq._id.toString())
  ) as string[];
  // Filter logs that are equal to current date
  const administeredDate = currentDate.toISOString().split('T')[0];
  const freqLogs = await frequencyLogModel
    .find({
      frequencyId: { $in: frequencyIds },
      administeredDate: administeredDate
    })
    .lean();

  return freqLogs;
}

function getMedicationStatus(frequenciesStatus: MedicationStatus[]): MedicationStatus {
  let status: MedicationStatus = 'DONE';
  if (frequenciesStatus.some(status => status === 'PAST_DUE')) {
    status = 'PAST_DUE';
  } else if (frequenciesStatus.some(status => status === 'COMING')) {
    status = 'COMING';
  }

  return status;
}

/**
 * Get the status of each frequency in a medication.
 * @param medication
 * @param clientDateTime
 * @param timeZone
 * @returns Promise<IMedicationDto>
 */
async function getFrequenciesStatusByMedication(
  medication: IMedicationDto,
  clientDateTime: string,
  timeZone: string
): Promise<IMedicationDto> {
  const currentDate = getDateOnly(clientDateTime);
  const currentDateTime = new Date(clientDateTime);

  const freqLogs = await getFrequencyLogs([medication], currentDate);
  const getFrequencyStatusFn = getFrequencyStatus.bind(
    null,
    currentDateTime.toString(),
    timeZone,
    freqLogs
  );
  const frequenciesWithStatus = medication.frequencies?.map(freq => {
    const status = getFrequencyStatusFn(freq);
    return { ...freq, status };
  });

  const result: IMedicationDto = { ...medication, frequencies: frequenciesWithStatus };
  return result;
}

function getDateOnly(currentDateTime: string): Date {
  const date = new Date(currentDateTime);
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
  return result;
}

function filterMeds(currentDate: Date) {
  return function (med: IMedicationDto) {
    // Get meds that fall within the start and end dates
    let [year, month, date] = med.startDate.split('-');
    const startDate = new Date(Number(year), Number(month) - 1, Number(date), 0, 0);
    let endDate = currentDate;
    if (med.endDate) {
      [year, month, date] = med.endDate.split('-');
      endDate = new Date(Number(year), Number(month) - 1, Number(date), 0, 0);
    }

    return currentDate >= startDate && currentDate <= endDate;
  };
}
