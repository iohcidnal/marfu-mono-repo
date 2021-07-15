import mongoose from 'mongoose';
import { IMedicationDto, IFrequencyDto, IFrequencyLogDto, MedicationStatus } from '@common';

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
  const frequenciesDto = frequencies?.map((freq, index) => ({
    ...freq,
    _id: freqIds[index],
    medicationId: medicationDoc._id
  })) as IFrequencyDto[];
  await freqModel.create(frequenciesDto, { session: session });

  await session.commitTransaction();
  session.endSession();

  return model.toDto(medicationDoc, frequenciesDto);
}

export async function getAllByMemberId(
  memberId: string,
  clientDateTime: string
): Promise<IMedicationDto[]> {
  const docs = await model.find({ memberId }).lean().populate('frequencies');
  const freqLogs = await getFrequencyLogs(docs);

  const result: IMedicationDto[] = docs.map(doc => {
    const frequencies = getFrequenciesStatus(clientDateTime, doc, freqLogs);
    const status = getMedicationStatus(frequencies);

    return {
      _id: doc._id,
      memberId: doc.memberId,
      medicationName: doc.medicationName,
      dosage: doc.dosage,
      frequencies,
      route: doc.route,
      note: doc.note,
      startDate: doc.startDate,
      endDate: doc.endDate,
      status,
      createdBy: doc.createdBy
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

  const doc = await model
    .findByIdAndUpdate(medication._id, medication, { lean: true, new: true })
    .populate('frequencies');

  return doc;
}

export async function deleteById(id: string): Promise<IMedicationDto | null> {
  const result = await model.findOneAndDelete({ _id: id });
  return result;
}

async function getFrequencyLogs(docs: IMedicationDto[]): Promise<IFrequencyLogDto[] | null> {
  // Get all frequency IDs to retrieve
  const frequencyIds = docs.flatMap(doc =>
    doc.frequencies?.map(freq => freq._id.toString())
  ) as string[];
  const freqLogs = await getAllFreqLogsByFrequencyIds(frequencyIds);

  return freqLogs;
}

function getMedicationStatus(frequenciesStatus: IFrequencyDto[]): MedicationStatus {
  let status = MedicationStatus.DONE;
  if (frequenciesStatus.some(freq => freq.status === MedicationStatus.PAST_DUE)) {
    status = MedicationStatus.PAST_DUE;
  } else if (frequenciesStatus.some(freq => freq.status === MedicationStatus.COMING)) {
    status = MedicationStatus.COMING;
  }

  return status;
}

function getFrequenciesStatus(
  clientDateTime: string,
  doc: IMedicationDto,
  freqLogDocs: IFrequencyLogDto[] | null
): IFrequencyDto[] {
  const currentDateTime = new Date(clientDateTime);
  const toDateFn = toDate(currentDateTime);
  const frequency = doc.frequencies as IFrequencyDto[];

  const result = frequency.reduce((accumulator: IFrequencyDto[], freq) => {
    const freqId = freq._id.toString();
    const medicationId = doc._id.toString();
    // If frequency is in the frequency logs, mark it with DONE.
    if (freqLogDocs?.some(log => log.frequencyId.toString() === freqId)) {
      accumulator.push({
        _id: freqId,
        medicationId,
        time: freq.time,
        status: MedicationStatus.DONE
      });

      return accumulator;
    }

    const freqTimeAsDateTime = toDateFn(freq.time);
    if (freqTimeAsDateTime >= currentDateTime) {
      const diff = freqTimeAsDateTime.valueOf() - currentDateTime.valueOf();
      const isFreqWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      if (isFreqWithinAnHour) {
        accumulator.push({
          _id: freqId,
          medicationId,
          time: freq.time,
          status: MedicationStatus.COMING
        });

        return accumulator;
      }
    }

    const diff = currentDateTime.valueOf() - freqTimeAsDateTime.valueOf();
    const isFreqPastWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
    accumulator.push({
      _id: freqId,
      medicationId,
      time: freq.time,
      status: isFreqPastWithinAnHour ? MedicationStatus.COMING : MedicationStatus.PAST_DUE
    });

    return accumulator;
  }, []);

  return [...result].sort((a, b) => {
    const dateTimeA = toDateFn(a.time);
    const dateTimeB = toDateFn(b.time);

    return dateTimeA.valueOf() - dateTimeB.valueOf();
  });
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
