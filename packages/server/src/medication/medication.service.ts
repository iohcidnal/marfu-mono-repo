import mongoose from 'mongoose';
import { IMedicationDto, IFrequencyDto, IFrequencyLogDto, MedicationStatus } from '@common';

import medicationModel from './medication.model';
import freqModel from './frequency.model';
import getFrequencyStatus from './status-handler';
import frequencyLogModel from '../frequency-log/frequency-log.model';

/* istanbul ignore next */
/* mongodbMemoryServerOptions does not support transactions */
export async function create({
  frequencies,
  ...medication
}: IMedicationDto): Promise<IMedicationDto> {
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

  return medicationModel.toDto(medicationDoc, frequenciesDto);
}

export async function getAllByMemberId(
  memberId: string,
  clientDateTime: string
): Promise<IMedicationDto[]> {
  const currentDate = toDate(new Date(clientDateTime))('0:0');
  const currentDateTime = new Date(clientDateTime);
  console.log('currentDateTime :>> ', currentDateTime);
  const docs = await medicationModel.find({ memberId }).lean().populate('frequencies');

  // Get meds that fall within the start and end dates
  const medications: IMedicationDto[] = [];
  for (const doc of docs) {
    if (!doc.endDate) {
      medications.push(doc);
    } else {
      const startDate = toDate(new Date(doc.startDate))('0:0');
      const endDate = toDate(new Date(doc.endDate as string))('0:0');
      if (currentDate >= startDate && currentDate <= endDate) {
        medications.push(doc);
      }
    }
  }

  const freqLogs = await getFrequencyLogs(medications, currentDate);
  const getFrequencyStatusFn = getFrequencyStatus.bind(null, currentDateTime.toString(), freqLogs);

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

export async function update(payload: IMedicationDto): Promise<IMedicationDto | null> {
  const medication = { ...payload };
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

  const doc = await medicationModel
    .findByIdAndUpdate(medication._id, medication, { lean: true, new: true })
    .populate('frequencies');

  return doc;
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
  let status = MedicationStatus.DONE;
  if (frequenciesStatus.some(status => status === MedicationStatus.PAST_DUE)) {
    status = MedicationStatus.PAST_DUE;
  } else if (frequenciesStatus.some(status => status === MedicationStatus.COMING)) {
    status = MedicationStatus.COMING;
  }

  return status;
}

function toDate(currentDateTime: Date): (time: string) => Date {
  return function (time: string): Date {
    const [hh, mm] = time.split(':');
    const dateTime = new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      Number(hh),
      Number(mm)
    );

    return dateTime;
  };
}
