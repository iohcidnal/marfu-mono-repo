import mongoose from 'mongoose';
import { IMedicationDto, IFrequencyDto, IFrequencyLogDto, MedicationStatus } from '@common';

import medicationModel from './medication.model';
import freqModel from './frequency.model';
import { getAllByFrequencyIds as getAllFreqLogsByFrequencyIds } from '../frequency-log/frequency-log.service';
import getFrequencyStatus from './status-handler';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

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
  console.log('clientDateTime :>> ', clientDateTime);
  const currentDateTime = toDate(new Date(clientDateTime))('0:0');
  const docs = await medicationModel.find({ memberId }).lean().populate('frequencies');

  // Get meds that fall within the start and end dates
  const medications: IMedicationDto[] = [];
  for (const doc of docs) {
    if (!doc.endDate) {
      medications.push(doc);
    } else {
      const startDate = toDate(new Date(doc.startDate))('0:0');
      const endDate = toDate(new Date(doc.endDate as string))('0:0');
      console.log('startDate :>> ', startDate);
      console.log('endDate :>> ', endDate);
      console.log('currentDateTime :>> ', currentDateTime);
      if (currentDateTime >= startDate && currentDateTime <= endDate) {
        medications.push(doc);
      }
    }
  }

  const freqLogs = await getFrequencyLogs(medications);
  const getFrequencyStatusFn = getFrequencyStatus.bind(null, clientDateTime, freqLogs);

  const result: IMedicationDto[] = medications.map(med => {
    const frequenciesStatus = med.frequencies?.map(freq =>
      getFrequencyStatusFn(freq)
    ) as MedicationStatus[];
    const medicationStatus = getMedicationStatus(frequenciesStatus);

    return {
      _id: med._id,
      memberId: med.memberId,
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequencies: med.frequencies,
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

async function getFrequencyLogs(docs: IMedicationDto[]): Promise<IFrequencyLogDto[]> {
  // Get all frequency IDs to retrieve
  const frequencyIds = docs.flatMap(doc =>
    doc.frequencies?.map(freq => freq._id.toString())
  ) as string[];
  const freqLogs = await getAllFreqLogsByFrequencyIds(frequencyIds);

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
