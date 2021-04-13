import mongoose from 'mongoose';
import { IMedicationDto, IFrequencyDto, IFrequencyLogDto, medicationStatus } from '@common';

import model from './medication.model';
import freqModel from './frequency.model';
import { getAllByFrequencyIds as getAllFreqLogsByFrequencyIds } from '../frequency-log/frequency-log.service';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

/* istanbul ignore next */
/* mongodbMemoryServerOptions does not support transactions */
export async function create({
  frequencies,
  ...medication
}: IMedicationDto): Promise<IMedicationDto> {
  const session = await model.startSession();
  session.startTransaction();

  // Create frequency IDs
  const freqIds = Array(frequencies?.length)
    .fill(null)
    .map(() => mongoose.Types.ObjectId().toHexString());
  // Create medication with frequency IDs
  const medicationDoc = (
    await model.create([{ ...medication, frequencies: freqIds }], { session: session })
  )[0];
  // Create frequencies
  const frequencyDtos = frequencies?.map((freq, index) => ({
    ...freq,
    _id: freqIds[index],
    medicationId: medicationDoc._id
  })) as IFrequencyDto[];
  await freqModel.create(frequencyDtos, { session: session });

  await session.commitTransaction();
  session.endSession();

  return model.toDto(medicationDoc);
}

export async function getAll(memberId: string, clientDateTime: string): Promise<IMedicationDto[]> {
  const docs = await model.find({ memberId }).lean().populate('frequencies');
  // Get all frequency IDs to retrieve
  const frequencyIds = docs.flatMap(doc =>
    doc.frequencies?.map(freq => freq._id.toString())
  ) as string[];
  const freqDocs = await getAllFreqLogsByFrequencyIds(frequencyIds);

  const result: IMedicationDto[] = docs.map(doc => {
    const frequencyStatus = getFrequencyStatus(clientDateTime, doc, freqDocs);
    return {
      _id: doc._id,
      memberId: doc.memberId,
      medicationName: doc.medicationName,
      dosage: doc.dosage,
      frequencies: frequencyStatus,
      route: doc.route,
      startDate: doc.startDate,
      endDate: doc.endDate
    };
  });

  return result;
}

export async function update(payload: IMedicationDto): Promise<IMedicationDto | null> {
  // Update frequencies
  for await (const freq of payload.frequencies ?? []) {
    // updateOne updates one document in the database without returning it
    freqModel.updateOne({ _id: freq._id }, { dateTime: freq.dateTime }).exec();
  }

  const doc = await model.findByIdAndUpdate(payload._id, payload, { lean: true, new: true });
  return doc;
}

function getFrequencyStatus(
  clientDateTime: string,
  doc: IMedicationDto,
  freqLogDocs: IFrequencyLogDto[] | null
): IFrequencyDto[] {
  const currentDateTime = new Date(clientDateTime);
  const frequency = doc.frequencies as IFrequencyDto[];

  const result = frequency.reduce((accumulator: IFrequencyDto[], freq) => {
    const freqId = freq._id.toString();
    const medicationId = doc._id.toString();
    // If frequency is in the frequency logs, mark it with DONE.
    if (freqLogDocs?.some(log => log.frequencyId.toString() === freqId)) {
      accumulator.push({
        _id: freqId,
        medicationId,
        dateTime: freq.dateTime,
        status: medicationStatus.DONE
      });

      return accumulator;
    }

    const freqDateTime = createFrequencyDateTime(currentDateTime, freq.dateTime);

    if (freqDateTime >= currentDateTime) {
      const diff = freqDateTime.valueOf() - currentDateTime.valueOf();
      const isFreqWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      if (isFreqWithinAnHour) {
        accumulator.push({
          _id: freqId,
          medicationId,
          dateTime: freqDateTime,
          status: medicationStatus.COMING
        });

        return accumulator;
      }
    }

    const diff = currentDateTime.valueOf() - freqDateTime.valueOf();
    const isFreqPastWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
    accumulator.push({
      _id: freqId,
      medicationId,
      dateTime: freqDateTime,
      status: isFreqPastWithinAnHour ? medicationStatus.COMING : medicationStatus.PAST_DUE
    });

    return accumulator;
  }, []);

  return result;
}

/**
 * Creates a new date and time by concatinating freq time to the current date
 */
function createFrequencyDateTime(currentDateTime: Date, freqDateTime: Date): Date {
  return new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
    freqDateTime.getHours(),
    freqDateTime.getMinutes()
  );
}
