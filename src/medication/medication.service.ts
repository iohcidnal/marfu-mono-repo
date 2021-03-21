import mongoose from 'mongoose';

import model from './medication.model';
import freqModel from './frequency.model';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

export async function create({
  frequencies,
  ...medication
}: IMedicationDto): Promise<IMedicationDto> {
  const session = await model.startSession();
  session.startTransaction();

  const freqIds = Array(frequencies?.length)
    .fill(null)
    .map(() => mongoose.Types.ObjectId().toHexString());
  const medicationDoc = (
    await model.create([{ ...medication, frequencies: freqIds }], { session: session })
  )[0];

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

export async function getAll(clientDateTime: string): Promise<IMedicationDto[]> {
  const docs = await model.find().populate('frequencies').exec();
  const result: IMedicationDto[] = docs.map(doc => {
    const frequencyStatus = getFrequencyStatus(clientDateTime, doc);
    return {
      _id: doc._id,
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

function getFrequencyStatus(clientDateTime: string, doc: IMedicationDto): IFrequencyDto[] {
  const currentDateTime = new Date(clientDateTime);
  const frequency = doc.frequencies as IFrequencyDto[];

  const status = frequency.reduce((accumulator: IFrequencyDto[], freq) => {
    // TODO: Check if freq._id is in the medication logs. If it is, mark frequency with DONE.

    const freqDateTime = createFrequencyDateTime(currentDateTime, freq.dateTime);

    if (freqDateTime >= currentDateTime) {
      const diff = freqDateTime.valueOf() - currentDateTime.valueOf();
      const isFreqWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      if (isFreqWithinAnHour) {
        accumulator.push({
          _id: freq._id,
          medicationId: doc._id,
          dateTime: freqDateTime,
          status: medicationStatus.COMING
        });

        return accumulator;
      }
    }

    if (freqDateTime < currentDateTime) {
      const diff = currentDateTime.valueOf() - freqDateTime.valueOf();
      const isFreqPastWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      accumulator.push({
        _id: freq._id,
        medicationId: doc._id,
        dateTime: freqDateTime,
        status: isFreqPastWithinAnHour ? medicationStatus.COMING : medicationStatus.PAST_DUE
      });

      return accumulator;
    }

    return accumulator;
  }, []);

  return status;
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
